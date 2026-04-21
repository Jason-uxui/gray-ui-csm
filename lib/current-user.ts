export const currentUser = {
  name: "Jason Support Lab",
  email: "support-ops@opensource-demo.dev",
  avatar: "/avatars/avatar-profile.jpg",
} as const

export const replyFromAccounts = [
  {
    address: "support-ops@opensource-demo.dev",
    label: "Support Ops",
    description: "Primary support queue",
  },
  {
    address: "help@opensource-demo.dev",
    label: "Help Center",
    description: "General support mailbox",
  },
  {
    address: "priority@opensource-demo.dev",
    label: "Priority Desk",
    description: "Escalations and VIP routing",
  },
] as const

export const replyFromAddresses = replyFromAccounts.map(
  (account) => account.address
)
