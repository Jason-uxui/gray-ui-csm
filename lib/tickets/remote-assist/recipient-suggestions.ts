import type { TicketPerson } from "../types"

export function uniqueRecipientContacts(people: TicketPerson[]) {
  const contacts = new Map<string, TicketPerson>()
  for (const person of people) {
    const email = person.email?.trim()
    if (!email) continue
    const key = email.toLowerCase()
    if (!contacts.has(key)) contacts.set(key, { ...person, email })
  }
  return [...contacts.values()]
}

export function recipientSuggestions(
  contacts: TicketPerson[],
  selected: string[],
  query: string
) {
  const term = query.trim().toLowerCase()
  if (!term) return []
  const selectedEmails = new Set(selected.map((email) => email.toLowerCase()))
  return uniqueRecipientContacts(contacts).filter(
    (person) =>
      !selectedEmails.has(person.email!.toLowerCase()) &&
      `${person.name} ${person.email}`.toLowerCase().includes(term)
  )
}
