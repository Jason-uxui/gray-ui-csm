import type { TicketPerson } from "./types"

export const supportAgents: TicketPerson[] = [
  {
    name: "Jason Duong",
    email: "jason@graycsm.example",
    avatarUrl: "/avatars/avatar-profile.jpg",
  },
  { name: "Annie Nguyen", email: "annie@graycsm.example" },
  { name: "Lam Tran", email: "lam@graycsm.example" },
  { name: "Nhi Pham", email: "nhi@graycsm.example" },
  { name: "Minh Ho", email: "minh@graycsm.example" },
  { name: "Thanh Le", email: "thanh@graycsm.example" },
  { name: "Bao Truong", email: "bao@graycsm.example" },
]

export function getAssignedAgent(person?: TicketPerson) {
  return person
    ? {
        ...supportAgents.find((agent) => agent.name === person.name),
        ...person,
      }
    : undefined
}

export function findTransferCandidates(
  currentAgent: TicketPerson | undefined,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase()
  return supportAgents.filter(
    (agent) =>
      agent.name !== currentAgent?.name &&
      `${agent.name} ${agent.email ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery)
  )
}

export function getAvailableFollowers(followers: TicketPerson[]) {
  return supportAgents.filter(
    (agent) => !followers.some((follower) => follower.name === agent.name)
  )
}
