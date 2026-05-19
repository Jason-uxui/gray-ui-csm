"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconLink,
  IconSparkles,
} from "@tabler/icons-react"

import { CsmPageTemplate } from "@/components/csm-page-template"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { CsmTemplateMetric } from "@/lib/csm-routes"
import { tickets } from "@/lib/tickets/mock-data"

type KnowledgeBasePageProps = {
  title: string
  description: string
  metrics: CsmTemplateMetric[]
}

const categoryLabel = {
  billing: "Billing",
  technical: "Technical",
  "account-login": "Account access",
  subscription: "Subscription",
  other: "General support",
} as const

export function KnowledgeBasePage({
  title,
  description,
  metrics,
}: KnowledgeBasePageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sourceTicketId = searchParams.get("sourceTicket")

  const sourceTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === sourceTicketId),
    [sourceTicketId]
  )

  if (!sourceTicket) {
    return (
      <CsmPageTemplate
        title={title}
        description={description}
        metrics={metrics}
        primaryActionLabel="New article"
      />
    )
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[16rem_minmax(0,1fr)_16rem]">
      <aside className="space-y-4 rounded-2xl border bg-background p-4">
        <Button
          type="button"
          variant="ghost"
          className="h-8 rounded-xl px-2"
          onClick={() => router.push(`/tickets/${sourceTicket.id}`)}
        >
          <IconArrowLeft className="size-4" />
          Back to ticket
        </Button>

        <Separator />

        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Source ticket
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-6 rounded-full">
                #{sourceTicket.ticketNumber.replace("#-", "TC-")}
              </Badge>
              <Badge variant="outline" className="h-6 rounded-full capitalize">
                {sourceTicket.ticketType ?? "incident"}
              </Badge>
            </div>
            <h2 className="mt-3 text-sm font-semibold text-foreground">
              {sourceTicket.subject}
            </h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Article will stay linked to this ticket and similar future issues.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Similar unresolved tickets
          </div>
          {[
            "Activation path still unclear",
            "Customer needs a reusable guide",
            "Follow-up answer repeated twice",
          ].map((item, index) => (
            <div key={item} className="flex items-start gap-2 text-xs">
              <span className="mt-1.5 size-2 rounded-full bg-primary" />
              <span className="min-w-0 flex-1 text-muted-foreground">
                {item}
              </span>
              <span className="text-muted-foreground">+{index + 2}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="min-h-0 rounded-2xl border bg-background p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Create knowledge base article
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Draft generated from ticket context. Review before publishing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="rounded-xl">
              Save draft
            </Button>
            <Button type="button" className="rounded-xl">
              Publish
              <IconChevronDown className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-4 py-5">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <IconSparkles className="mt-0.5 size-5 text-primary" />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  AI draft ready
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Generated from ticket context and similar unresolved tickets.
                  Adjust the answer, then save or publish.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-xl font-semibold text-foreground">
            How to resolve: {sourceTicket.subject}
          </div>

          <div className="flex flex-wrap gap-2">
            {["B", "I", "U", "H2", "H3"].map((control) => (
              <Button
                key={control}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                {control}
              </Button>
            ))}
            <Button type="button" variant="outline" size="sm" className="rounded-xl">
              <IconLink className="size-4" />
            </Button>
          </div>

          <article className="space-y-4 text-sm leading-7 text-foreground">
            <p>
              This guide helps customers resolve the issue behind “
              {sourceTicket.subject}” without waiting for another support
              handoff.
            </p>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800">
              <IconLink className="mr-1 inline size-4 align-[-3px]" />
              Quick path: Account &gt; Support &gt; Ticket details &gt; Next
              action
            </div>
            <section>
              <h2 className="font-semibold">Before replying</h2>
              <p className="mt-1 text-muted-foreground">
                Confirm the customer impact, current status, and whether the
                next action belongs to the customer or the support team.
              </p>
            </section>
            <section>
              <h2 className="font-semibold">Recommended response</h2>
              <p className="mt-1 text-muted-foreground">
                Share the shortest customer-safe next step first, then include
                any context that helps them understand timing or ownership.
              </p>
            </section>
          </article>
        </div>
      </main>

      <aside className="space-y-4 rounded-2xl border bg-background p-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Settings
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              Category
            </span>
            <Select defaultValue={sourceTicket.category}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(categoryLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Linked tickets
          </div>
          <Badge variant="secondary" className="h-auto rounded-xl px-3 py-2">
            #{sourceTicket.ticketNumber.replace("#-", "TC-")} ·{" "}
            {sourceTicket.subject}
          </Badge>
          <p className="text-xs leading-5 text-muted-foreground">
            Publishing will also auto-link similar future tickets.
          </p>
        </div>

        <Separator />

        <div className="flex items-start gap-2 rounded-2xl bg-muted/50 p-3">
          <IconCheck className="mt-0.5 size-4 text-emerald-600" />
          <p className="text-xs leading-5 text-muted-foreground">
            After publish, agent replies can include this article automatically.
          </p>
        </div>
      </aside>
    </div>
  )
}
