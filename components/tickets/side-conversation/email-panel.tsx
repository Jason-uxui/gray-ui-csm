"use client"
import { IconSend } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSideConversation } from "./context"
export function EmailPanel() {
  const side = useSideConversation()
  return (
    <div className="min-h-0 space-y-4 overflow-y-auto">
      <p className="text-xs text-muted-foreground">
        Email demo — messages stay in this ticket preview.
      </p>
      {side.emails.map((email) => (
        <div key={email.id} className="rounded-xl border p-3 text-sm">
          <Badge variant="secondary">Sent in demo</Badge>
          <p className="mt-2 break-all">To: {email.to}</p>
          <p className="font-medium">{email.subject}</p>
          <p className="mt-2 break-words whitespace-pre-wrap text-muted-foreground">
            {email.body}
          </p>
        </div>
      ))}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          side.sendEmail()
        }}
      >
        <label className="block space-y-1 text-xs">
          To
          <Input
            required
            type="email"
            value={side.emailTo}
            placeholder="teammate@example.com"
            onChange={(e) => side.setEmailTo(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-xs">
          Subject
          <Input
            required
            value={side.emailSubject}
            onChange={(e) => side.setEmailSubject(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-xs">
          Message
          <textarea
            required
            className="min-h-32 w-full rounded-xl border bg-background p-3 text-sm"
            value={side.emailBody}
            onChange={(e) => side.setEmailBody(e.target.value)}
          />
        </label>
        <Button
          type="submit"
          disabled={
            !side.emailTo.trim() ||
            !side.emailSubject.trim() ||
            !side.emailBody.trim()
          }
        >
          Send demo email
          <IconSend className="size-4" />
        </Button>
      </form>
    </div>
  )
}
