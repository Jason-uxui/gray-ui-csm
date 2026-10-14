import assert from "node:assert/strict"
import test from "node:test"
import {
  recipientSuggestions,
  uniqueRecipientContacts,
} from "../lib/tickets/remote-assist/recipient-suggestions.ts"
import { sessionTimeline } from "../lib/tickets/remote-assist/presentation.ts"
import {
  sampleCustomerResponse,
  sampleCustomerAction,
  sampleRecordingAction,
  SAMPLE_RECORDING_DELAY_MS,
} from "../lib/tickets/remote-assist/sample-customer.ts"
import {
  transitionSession,
  durationSeconds,
  formatDuration,
  isValidInvite,
  remainingSeconds,
  parseRecipientEmails,
  uniqueRecipientEmails,
  formatSessionDuration,
} from "../lib/tickets/remote-assist/state.ts"
import {
  decodeSessions,
  encodeSessions,
} from "../lib/tickets/remote-assist/storage.ts"

const base = () => ({
  id: "RA-test",
  ticketId: "t-001",
  kind: "remote",
  customer: { name: "Customer", email: "customer@example.test" },
  agent: { name: "Support" },
  subject: "Help",
  invitationMessage: "Join the demo",
  accessCode: "111 222 333",
  status: "waiting",
  createdAt: 1000,
  expiresAt: 301000,
  control: "none",
  recordingPermission: "none",
  recording: "none",
  muted: false,
  cameraOn: false,
  onHold: false,
  dialedDigits: "",
  messages: [],
  notes: [],
  events: [],
  outcome: "",
})
const action = (type, at = 2000) => ({ type, at })
const joined = () => transitionSession(base(), action("join"))

test("email suggestions match names/addresses, omit selected addresses and deduplicate case-insensitively", () => {
  const people = [
    { name: "Annie Nguyen", email: "annie@example.test" },
    { name: "Other Annie", email: "ANNIE@example.test" },
    { name: "Amina Rahman", email: "amina@example.test" },
    { name: "No email" },
  ]
  assert.equal(uniqueRecipientContacts(people).length, 2)
  assert.deepEqual(
    recipientSuggestions(people, [], "NGUYEN").map((p) => p.email),
    ["annie@example.test"]
  )
  assert.equal(
    recipientSuggestions(people, ["ANNIE@example.test"], "anni").length,
    0
  )
  assert.equal(recipientSuggestions(people, [], " ").length, 0)
  assert.equal(recipientSuggestions(people, [], "unknown").length, 0)
})
test("phone calls appear on the conversation only once they have finished", () => {
  const phone = { ...base(), kind: "phone", status: "dialing" }
  assert.equal(sessionTimeline([phone]).length, 0)
  const live = transitionSession(phone, action("join"))
  assert.equal(sessionTimeline([live]).length, 0)
  const ended = transitionSession(live, action("end", 4000))
  const events = sessionTimeline([ended])
  assert.equal(events.length, 1)
  assert.equal(events[0].remoteAssist.phase, "summary")
  assert.equal(sessionTimeline([base()])[0].remoteAssist.phase, "invitation")
})
test("sample phone customer connects and answers before sample recording consent", () => {
  let phone = { ...base(), kind: "phone", status: "dialing" }
  phone = transitionSession(phone, sampleCustomerAction(phone, 2000))
  assert.equal(phone.status, "connecting")
  phone = transitionSession(phone, sampleCustomerAction(phone, 3000))
  assert.equal(phone.status, "live")
  assert.equal(phone.recording, "none")
})
test("processing completes automatically after the sample delay, without overwriting failure or empty states", () => {
  const ended = {
    ...joined(),
    status: "ended",
    endedAt: 4000,
    recording: "processing",
    recordingPermission: "granted",
  }
  assert.equal(
    sampleRecordingAction(ended, 4000 + SAMPLE_RECORDING_DELAY_MS - 1),
    null
  )
  const completion = sampleRecordingAction(
    ended,
    4000 + SAMPLE_RECORDING_DELAY_MS
  )
  assert.equal(transitionSession(ended, completion).recording, "ready")
  for (const recording of ["none", "failed", "ready"])
    assert.equal(sampleRecordingAction({ ...ended, recording }, 9000), null)
  assert.equal(
    sampleRecordingAction({ ...ended, endedAt: undefined }, 9000),
    null
  )
  assert.equal(
    sampleRecordingAction({ ...ended, recordingPermission: "none" }, 9000),
    null
  )
})

test("invitation requires a valid address, title and message", () => {
  assert.equal(isValidInvite(" person@example.test ", "Help", "Join"), true)
  for (const email of ["", "not-an-email", "two addresses@example.test"])
    assert.equal(isValidInvite(email, "Help", "Join"), false)
  assert.equal(isValidInvite("a@example.test", " ", "Join"), false)
  assert.equal(isValidInvite("a@example.test", "Help", " "), false)
})
test("multiple recipients are parsed, deduplicated and all validated", () => {
  const emails = uniqueRecipientEmails([
    " first@example.test ",
    ...parseRecipientEmails(
      "FIRST@example.test,second@example.test; third@example.test\nfourth@example.test"
    ),
  ])
  assert.deepEqual(emails, [
    "first@example.test",
    "second@example.test",
    "third@example.test",
    "fourth@example.test",
  ])
  assert.equal(isValidInvite(emails, "Help", "Join"), true)
  assert.equal(isValidInvite([], "Help", "Join"), false)
  assert.equal(isValidInvite([...emails, "invalid"], "Help", "Join"), false)
  assert.equal(
    isValidInvite(["first@example.test,second@example.test"], "Help", "Join"),
    false
  )
})
test("recipient lists survive reload while earlier single-recipient history still works", () => {
  const old = decodeSessions(encodeSessions([base()]), "t-001")[0]
  assert.equal(old.customer.email, "customer@example.test")
  const current = {
    ...base(),
    recipientEmails: ["one@example.test", "two@example.test"],
  }
  assert.deepEqual(
    decodeSessions(encodeSessions([current]), "t-001")[0].recipientEmails,
    current.recipientEmails
  )
  assert.throws(() =>
    decodeSessions(
      encodeSessions([{ ...current, recipientEmails: [123] }]),
      "t-001"
    )
  )
})
test("summary duration uses the design's readable minute and second labels", () => {
  assert.equal(formatSessionDuration(1125), "18 min 45 sec")
})
test("sample customer connects, shares, and approves only requested permissions", () => {
  let session = base()
  assert.equal(sampleCustomerResponse(session).delayMs > 0, true)
  session = transitionSession(session, sampleCustomerAction(session, 2000))
  assert.equal(session.status, "connecting")
  session = transitionSession(session, sampleCustomerAction(session, 3000))
  assert.equal(session.status, "live")
  assert.equal(sampleCustomerResponse(session), null)
  session = transitionSession(session, {
    type: "control",
    value: "requested",
    at: 3100,
  })
  session = transitionSession(session, sampleCustomerAction(session, 4000))
  assert.equal(session.control, "granted")
  assert.equal(session.recordingPermission, "none")
  session = transitionSession(session, {
    type: "recording-permission",
    value: "requested",
    at: 4100,
  })
  session = transitionSession(session, sampleCustomerAction(session, 5000))
  assert.equal(session.recordingPermission, "granted")
})
test("sample customer does not restart terminal, disconnected or invalid waiting calls", () => {
  for (const status of [
    "canceled",
    "expired",
    "ended",
    "unanswered",
    "disconnected",
  ])
    assert.equal(sampleCustomerResponse({ ...base(), status }), null)
  assert.equal(sampleCustomerResponse({ ...base(), kind: "phone" }), null)
  assert.equal(
    sampleCustomerAction({ ...base(), status: "canceled" }, 2000),
    null
  )
  const reconnecting = transitionSession(
    transitionSession(joined(), action("disconnect", 3100)),
    action("reconnect", 4000)
  )
  assert.equal(sampleCustomerAction(reconnecting, 5000).type, "join")
})
test("customer joins before expiry, and a joined session does not expire", () => {
  const session = joined()
  assert.equal(session.status, "live")
  assert.equal(session.startedAt, 2000)
  assert.equal(transitionSession(session, action("expire", 500000)), session)
})
test("joining exactly at expiry fails instead of showing a live session", () => {
  const session = transitionSession(base(), action("join", 301000))
  assert.equal(session.status, "expired")
  assert.equal(session.startedAt, undefined)
  assert.equal(remainingSeconds(session, 400000), 0)
})
test("control needs a separate request and explicit customer grant", () => {
  const session = joined()
  assert.equal(
    transitionSession(session, { type: "control", value: "granted", at: 2100 }),
    session
  )
  const requested = transitionSession(session, {
    type: "control",
    value: "requested",
    at: 2100,
  })
  const granted = transitionSession(requested, {
    type: "control",
    value: "granted",
    at: 2200,
  })
  assert.equal(granted.control, "granted")
  assert.equal(granted.recordingPermission, "none")
  assert.equal(
    transitionSession(granted, { type: "control", value: "none", at: 2300 })
      .control,
    "none"
  )
})
test("declined control remains view-only and can be requested again", () => {
  const requested = transitionSession(joined(), {
    type: "control",
    value: "requested",
    at: 2100,
  })
  const denied = transitionSession(requested, {
    type: "control",
    value: "denied",
    at: 2200,
  })
  assert.equal(denied.control, "denied")
  assert.equal(
    transitionSession(denied, { type: "control", value: "requested", at: 2300 })
      .control,
    "requested"
  )
})
test("no recording is fabricated without recording consent", () => {
  const ended = transitionSession(joined(), action("end", 5000))
  assert.equal(ended.recording, "none")
  assert.equal(
    transitionSession(ended, {
      type: "recording-result",
      value: "ready",
      at: 6000,
    }),
    ended
  )
})
test("consented recording processes only after ending, then can fail or become ready", () => {
  const requested = transitionSession(joined(), {
    type: "recording-permission",
    value: "requested",
    at: 2100,
  })
  const recorded = transitionSession(requested, {
    type: "recording-permission",
    value: "granted",
    at: 2200,
  })
  assert.equal(recorded.recording, "recording")
  assert.equal(
    transitionSession(recorded, {
      type: "recording-result",
      value: "ready",
      at: 2300,
    }),
    recorded
  )
  const ended = transitionSession(recorded, action("end", 5000))
  assert.equal(ended.recording, "processing")
  const failed = transitionSession(ended, {
    type: "recording-result",
    value: "failed",
    at: 6000,
  })
  assert.equal(failed.recording, "failed")
  assert.equal(
    transitionSession(failed, {
      type: "recording-result",
      value: "ready",
      at: 7000,
    }).recording,
    "ready"
  )
})
test("disconnect releases control and reconnection keeps the original start time", () => {
  let session = transitionSession(joined(), {
    type: "control",
    value: "requested",
    at: 2100,
  })
  session = transitionSession(session, {
    type: "control",
    value: "granted",
    at: 2200,
  })
  session = transitionSession(session, action("disconnect", 2300))
  assert.equal(session.control, "none")
  session = transitionSession(session, action("reconnect", 2400))
  session = transitionSession(session, action("join", 2500))
  assert.equal(session.startedAt, 2000)
  assert.equal(session.status, "live")
})
test("end is idempotent and freezes the duration", () => {
  const ended = transitionSession(joined(), action("end", 7000))
  assert.equal(transitionSession(ended, action("end", 9000)), ended)
  assert.equal(durationSeconds(ended, 100000), 5)
  assert.equal(formatDuration(125), "02:05")
})
test("ending before the customer joins is a cancellation with no invented duration", () => {
  const ended = transitionSession(base(), action("end"))
  assert.equal(ended.status, "canceled")
  assert.equal(durationSeconds(ended, 999999), 0)
})
test("internal notes and customer messages remain separate, and replay does not duplicate them", () => {
  const message = {
    id: "m-1",
    author: { name: "Support" },
    body: "Private note",
    at: 2200,
  }
  const session = transitionSession(joined(), {
    type: "note",
    message,
    at: 2200,
  })
  assert.equal(session.notes.length, 1)
  assert.equal(session.messages.length, 0)
  assert.equal(
    transitionSession(session, { type: "note", message, at: 2300 }),
    session
  )
  assert.equal(
    transitionSession(base(), { type: "message", message, at: 2000 }).messages
      .length,
    0
  )
})
test("hold and keypad are restricted to a connected phone session", () => {
  assert.equal(
    transitionSession(joined(), { type: "media", field: "onHold", at: 2200 })
      .onHold,
    false
  )
  const phone = transitionSession(
    { ...base(), kind: "phone", status: "dialing" },
    action("join")
  )
  assert.equal(
    transitionSession(phone, { type: "media", field: "onHold", at: 2200 })
      .onHold,
    true
  )
  assert.equal(
    transitionSession(phone, { type: "digit", digit: "#", at: 2200 })
      .dialedDigits,
    "#"
  )
  assert.equal(
    transitionSession(phone, { type: "digit", digit: "x", at: 2200 }),
    phone
  )
})
test("saved session round-trips, rejects another ticket and rejects corrupted data", () => {
  const serialized = encodeSessions([joined()])
  assert.deepEqual(decodeSessions(serialized, "t-001"), [joined()])
  assert.throws(() => decodeSessions(serialized, "t-other"))
  assert.throws(() => decodeSessions("{broken", "t-001"))
  assert.throws(() =>
    decodeSessions(
      JSON.stringify({ version: 1, sessions: [{ ...base(), notes: [{}] }] }),
      "t-001"
    )
  )
})

test("connected sample calls provide audio through request, grant, processing and ready", () => {
  let session = { ...base(), kind: "phone", status: "dialing" }
  session = transitionSession(session, sampleCustomerAction(session, 2000))
  session = transitionSession(session, sampleCustomerAction(session, 3000))
  assert.equal(session.recording, "none")
  session = transitionSession(session, sampleCustomerAction(session, 4000))
  assert.equal(session.recordingPermission, "requested")
  session = transitionSession(session, sampleCustomerAction(session, 5000))
  assert.equal(session.recordingPermission, "granted")
  session = transitionSession(session, { type: "end", at: 6000 })
  assert.equal(session.recording, "processing")
  session = transitionSession(session, sampleRecordingAction(session, 10000))
  assert.equal(session.recording, "ready")
  assert.equal(
    sampleCustomerAction(
      { ...joined(), kind: "phone", recordingPermission: "denied" },
      11000
    ),
    null
  )
})

test("unanswered phone timeout and cancellation use call language, with no recording", () => {
  const phone = { ...base(), kind: "phone", status: "dialing" }
  const unanswered = transitionSession(phone, action("expire", 301000))
  assert.equal(unanswered.status, "unanswered")
  assert.equal(unanswered.events.at(-1).title, "Call unanswered")
  assert.equal(unanswered.recording, "none")
  assert.equal(
    transitionSession(phone, action("end")).events.at(-1).title,
    "Call canceled"
  )
  assert.equal(
    transitionSession(phone, action("cancel")).events.at(-1).title,
    "Call canceled"
  )
  assert.equal(
    transitionSession(base(), action("expire", 301000)).status,
    "expired"
  )
})
test("disconnected calls resume the same session without duplicating results", () => {
  const call = transitionSession(
    { ...base(), kind: "phone", status: "dialing" },
    action("join")
  )
  const lost = transitionSession(call, action("disconnect", 3000))
  assert.match(lost.events.at(-1).detail, /^Call disconnected/)
  const retry = transitionSession(lost, action("reconnect", 4000))
  const resumed = transitionSession(retry, action("join", 5000))
  assert.equal(resumed.startedAt, call.startedAt)
  assert.equal(sessionTimeline([resumed]).length, 0)
  assert.equal(
    sessionTimeline([transitionSession(resumed, action("end", 6000))]).length,
    1
  )
})
