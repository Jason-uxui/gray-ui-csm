"use client"

import { useRef, useState, type KeyboardEvent } from "react"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { IconX } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { DiscussionAvatar } from "@/components/detail-tabs/shared-discussion-tab-content"
import type { TicketPerson } from "@/lib/tickets/types"
import { recipientSuggestions } from "@/lib/tickets/remote-assist/recipient-suggestions"

export function InvitationRecipients({
  customer,
  contacts,
  recipients,
  value,
  invalid,
  disabled,
  onChange,
  onRemove,
  onCommit,
  onValueChange,
}: {
  customer: TicketPerson
  contacts: TicketPerson[]
  recipients: string[]
  value: string
  invalid: boolean
  disabled: boolean
  onChange: (emails: string[]) => void
  onRemove: (email: string) => void
  onCommit: () => void
  onValueChange: (value: string) => void
}) {
  const highlighted = useRef<TicketPerson | undefined>(undefined)
  const portalContainer = useRef<HTMLElement | null>(null)
  const [popupRequested, setPopupRequested] = useState(false)
  const suggestions = recipientSuggestions(contacts, recipients, value)
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return
    if (["Enter", ",", ";"].includes(event.key)) {
      if (event.key === "Enter" && suggestions.length && highlighted.current)
        return
      event.preventDefault()
      onCommit()
    } else if (event.key === "Backspace" && !value && recipients.length) {
      onChange(recipients.slice(0, -1))
    }
  }
  return (
    <div
      ref={(node) => {
        portalContainer.current =
          node?.closest<HTMLElement>('[role="dialog"]') ?? null
      }}
      className="flex min-h-9 min-w-0 items-start gap-1.5"
    >
      <label
        htmlFor="remote-recipient"
        className="shrink-0 pt-2.5 text-[11px] leading-4 font-medium text-muted-foreground"
      >
        TO
      </label>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 py-1.5">
        {recipients.map((email) => (
          <div
            key={email.toLowerCase()}
            className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-sidebar-accent px-2.5 py-0.5 text-sm leading-5"
          >
            {email.toLowerCase() === customer.email?.toLowerCase() && (
              <DiscussionAvatar person={customer} className="size-4!" />
            )}
            <span className="truncate" title={email}>
              {email}
            </span>
            <TooltipButton
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              aria-label={`Remove ${email}`}
              onClick={() => onRemove(email)}
              className="size-5 shrink-0 rounded-full p-0 focus-visible:ring-2"
            >
              <IconX className="size-3" stroke={1.5} />
            </TooltipButton>
          </div>
        ))}
        <Autocomplete.Root
          items={suggestions}
          filteredItems={suggestions}
          filter={null}
          value={value}
          open={popupRequested && suggestions.length > 0 && !disabled}
          onOpenChange={setPopupRequested}
          itemToStringValue={(person) => person.email ?? ""}
          onItemHighlighted={(person) => {
            highlighted.current = person
          }}
          onValueChange={(nextValue, details) => {
            if (details.reason === "item-press") {
              onChange([...recipients, nextValue])
              onValueChange("")
              setPopupRequested(false)
              highlighted.current = undefined
            } else {
              highlighted.current = undefined
              setPopupRequested(!!nextValue.trim())
              onValueChange(nextValue)
            }
          }}
        >
          <Autocomplete.Input
            render={<Input />}
            id="remote-recipient"
            type="text"
            inputMode="email"
            autoComplete="off"
            aria-label="Add recipient email"
            aria-invalid={invalid}
            aria-describedby={invalid ? "invitation-error" : undefined}
            disabled={disabled}
            placeholder={recipients.length ? "" : "Add email…"}
            onKeyDown={keyDown}
            onBlur={onCommit}
            className="h-6 min-w-24 flex-1 rounded-none border-0 bg-transparent px-0 py-0 shadow-none! focus-visible:bg-transparent focus-visible:ring-0 aria-invalid:ring-0"
          />
          <Autocomplete.Portal container={portalContainer}>
            <Autocomplete.Positioner
              sideOffset={8}
              className="z-[80] max-w-[calc(100vw-2rem)]"
            >
              <Autocomplete.Popup
                data-recipient-suggestions
                className="w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl"
              >
                <Autocomplete.List className="max-h-56 overflow-y-auto p-1">
                  {(person: TicketPerson) => (
                    <Autocomplete.Item
                      key={person.email}
                      value={person}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none data-highlighted:bg-secondary"
                    >
                      <DiscussionAvatar person={person} className="size-8!" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {person.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {person.email}
                        </p>
                      </div>
                    </Autocomplete.Item>
                  )}
                </Autocomplete.List>
              </Autocomplete.Popup>
            </Autocomplete.Positioner>
          </Autocomplete.Portal>
        </Autocomplete.Root>
      </div>
    </div>
  )
}
