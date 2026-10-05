import type { Teammate, ThreadMessage } from "./types"

export const teammates: Teammate[] = [
  {
    id: "maya",
    name: "Maya Chen",
    email: "maya@graycsm.example",
    online: true,
    role: "Customer Success",
  },
  {
    id: "alex",
    name: "Alex Morgan",
    email: "alex@graycsm.example",
    online: true,
    role: "Technical Support",
  },
  {
    id: "sam",
    name: "Sam Wilson",
    email: "sam@graycsm.example",
    online: false,
    role: "Billing Specialist",
  },
]

export function createDemoMessages(): Record<string, ThreadMessage[]> {
  return {
    maya: [
      {
        id: "maya-1",
        author: "Maya Chen",
        time: "9:30 AM",
        body: "I reviewed the onboarding notes. The customer is waiting for the activation checklist.",
      },
      {
        id: "maya-2",
        author: "Maya Chen",
        time: "9:31 AM",
        body: "Could you share the latest customer message? I can confirm the owner and next steps.",
      },
    ],
  }
}
