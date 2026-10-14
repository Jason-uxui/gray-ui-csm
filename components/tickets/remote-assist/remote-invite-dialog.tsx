"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Dialog } from "@base-ui/react/dialog"
import { IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { Input } from "@/components/ui/input"
import {
  SUPPORT_ASSETS,
  invitationMessagePlaceholder,
} from "@/lib/tickets/remote-assist/mock-data"
import {
  isValidInvite,
  isValidRecipientEmail,
  parseRecipientEmails,
  uniqueRecipientEmails,
} from "@/lib/tickets/remote-assist/state"
import type { InviteDraft } from "@/lib/tickets/remote-assist/types"
import type { TicketPerson } from "@/lib/tickets/types"
import { SupportIcon } from "./support-icons"
import { InvitationRecipients } from "./invitation-recipients"

const DEMO_SEND_DELAY_MS = 450
export function RemoteInviteDialog({
  customer,
  contacts,
  initialDraft,
  onClose,
  onSend,
}: {
  customer: TicketPerson
  contacts: TicketPerson[]
  initialDraft: InviteDraft
  onClose: () => void
  onSend: (draft: InviteDraft) => boolean
}) {
  const [draft, setDraft] = useState(initialDraft)
  const [recipients, setRecipients] = useState(() =>
    uniqueRecipientEmails(initialDraft.recipients ?? [initialDraft.email])
  )
  const [recipientInput, setRecipientInput] = useState("")
  const [recipientInvalid, setRecipientInvalid] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])
  const close = () => {
    request.current?.abort()
    onClose()
  }
  function resolveRecipients() {
    const added = parseRecipientEmails(recipientInput)
    if (added.some((email) => !isValidRecipientEmail(email))) {
      setRecipientInvalid(true)
      setError("Check the email address before adding it.")
      return null
    }
    const next = uniqueRecipientEmails([...recipients, ...added])
    setRecipients(next)
    setRecipientInput("")
    setRecipientInvalid(false)
    setError("")
    return next
  }
  async function submit() {
    if (request.current) return
    const emails = resolveRecipients()
    if (!emails) return
    if (!isValidInvite(emails, draft.subject, draft.message)) {
      setRecipientInvalid(!emails.length)
      setError(
        "Add at least one email address, a title and your message before sending."
      )
      return
    }
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError("")
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(resolve, DEMO_SEND_DELAY_MS)
        controller.signal.addEventListener(
          "abort",
          () => {
            window.clearTimeout(timer)
            reject(new Error("Canceled"))
          },
          { once: true }
        )
      })
      if (controller.signal.aborted) return
      if (
        !onSend({
          email: emails[0],
          recipients: emails,
          subject: draft.subject.trim(),
          message: draft.message.trim(),
        })
      )
        setError("A session is already active, or this demo is not ready yet.")
    } catch {
      if (!controller.signal.aborted)
        setError(
          "The invitation could not be prepared. Your draft is still here; please try again."
        )
    } finally {
      request.current = null
      if (!controller.signal.aborted) setPending(false)
    }
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] bg-foreground/30" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[71] flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[39.3125rem] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border bg-background p-6 shadow-xl outline-none sm:h-[38.5rem]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <div className="flex items-center gap-3 pr-8">
              <SupportIcon name="monitor" size={20} />
              <Dialog.Title className="text-lg leading-none font-semibold">
                Invite to remote assistance
              </Dialog.Title>
            </div>
            <Dialog.Description className="sr-only">
              Prepare a demo invitation. The customer must accept before sharing
              a screen.
            </Dialog.Description>
            <TooltipButton
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3 rounded-xl focus-visible:ring-2"
              aria-label="Close invitation"
              onClick={close}
            >
              <IconX className="size-4" />
            </TooltipButton>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              <InvitationRecipients
                customer={customer}
                contacts={contacts}
                recipients={recipients}
                value={recipientInput}
                invalid={recipientInvalid}
                disabled={pending}
                onChange={setRecipients}
                onRemove={(email) =>
                  setRecipients(
                    recipients.filter((recipient) => recipient !== email)
                  )
                }
                onCommit={() => {
                  if (recipientInput.trim()) resolveRecipients()
                }}
                onValueChange={(value) => {
                  setRecipientInput(value)
                  setRecipientInvalid(false)
                }}
              />
              <div className="h-px shrink-0 bg-border" />
              <Input
                aria-label="Invitation title"
                placeholder="Title"
                value={draft.subject}
                onChange={(e) =>
                  setDraft({ ...draft, subject: e.target.value })
                }
                disabled={pending}
                className="shrink-0 rounded-none border-0 bg-transparent px-0 shadow-none! focus-visible:bg-transparent focus-visible:ring-0"
              />
              <div className="h-px shrink-0 bg-border" />
              <textarea
                aria-label="Invitation message"
                placeholder={invitationMessagePlaceholder(customer)}
                value={draft.message}
                onKeyDown={(event) => {
                  if (
                    event.nativeEvent.isComposing ||
                    draft.message ||
                    event.key !== "Enter"
                  )
                    return
                  event.preventDefault()
                  setDraft({
                    ...draft,
                    message: invitationMessagePlaceholder(customer),
                  })
                }}
                disabled={pending}
                onChange={(e) =>
                  setDraft({ ...draft, message: e.target.value })
                }
                className="min-h-20 w-full flex-1 resize-none bg-transparent py-2 text-sm leading-5 outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <div className="flex shrink-0 items-start gap-2 rounded-xl border bg-sidebar-accent p-3">
                <Image
                  src={SUPPORT_ASSETS.consent}
                  width={93}
                  height={62}
                  unoptimized
                  alt="The customer controls screen sharing"
                  className="h-auto w-16 shrink-0 rounded sm:w-[93px]"
                />
                <div>
                  <p className="text-sm font-semibold">
                    The customer stays in control
                  </p>
                  <p className="mt-1 text-sm leading-5">
                    Screen sharing starts after {customer.name.split(" ")[0]}{" "}
                    accepts. Remote control and recording require separate
                    permission.
                  </p>
                </div>
              </div>
              {error && (
                <p
                  id="invitation-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={close}
                  className="h-10 rounded-xl text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={pending}
                  className="h-10 rounded-xl px-4"
                >
                  {pending
                    ? "Sending…"
                    : error
                      ? "Retry invitation"
                      : "Send invitation"}
                  <SupportIcon name="mail" className="dark:invert-0" />
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
