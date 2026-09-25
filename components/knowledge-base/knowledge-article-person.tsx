import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { KnowledgeArticlePerson } from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"

function getKnowledgeArticlePersonInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function KnowledgeArticlePersonRow({
  person,
  nameClassName,
}: {
  person: KnowledgeArticlePerson
  nameClassName?: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="sm">
        {person.avatarUrl ? (
          <AvatarImage src={person.avatarUrl} alt="" />
        ) : null}
        <AvatarFallback>
          {getKnowledgeArticlePersonInitials(person.name)}
        </AvatarFallback>
      </Avatar>
      <span className={cn("truncate", nameClassName)}>{person.name}</span>
    </div>
  )
}
