"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import {
  IconAlertTriangle,
  IconAt,
  IconBell,
  IconBoltOff,
  IconBook2,
  IconCheck,
  IconInbox,
  IconMessageCircle,
  IconUserCheck,
  IconX,
  type Icon,
} from "@tabler/icons-react"

import type { NotificationFilter } from "@/components/notifications/use-notifications-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  AppNotification,
  NotificationDateGroup,
  NotificationKind,
} from "@/lib/notifications/types"
import { cn } from "@/lib/utils"

type NotificationsPanelProps = {
  filter: NotificationFilter
  notifications: AppNotification[]
  open: boolean
  unreadCount: number
  onFilterChange: (filter: NotificationFilter) => void
  onMarkAllAsRead: () => void
  onMarkAsRead: (notificationId: string) => void
  onOpenChange: (open: boolean) => void
}

type NotificationsSurfaceProps = Omit<
  NotificationsPanelProps,
  "open" | "onOpenChange"
>

type NotificationsContentProps = NotificationsSurfaceProps & {
  isLoading: boolean
  onClose: () => void
  TitleComponent: React.ElementType
  DescriptionComponent: React.ElementType
}

const dateGroups: NotificationDateGroup[] = ["Today", "Yesterday", "Earlier"]

const notificationIcons: Record<NotificationKind, Icon> = {
  assignment: IconUserCheck,
  mention: IconAt,
  "customer-reply": IconMessageCircle,
  "sla-risk": IconAlertTriangle,
  "ticket-update": IconInbox,
  "automation-failure": IconBoltOff,
  "knowledge-review": IconBook2,
}

function NotificationLoadingState() {
  return (
    <div className="space-y-3 p-4" aria-label="Loading notifications">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex gap-3 rounded-lg p-3">
          <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  )
}

function NotificationEmptyState({ filter }: { filter: NotificationFilter }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <IconCheck className="size-5" />
      </div>
      <p className="font-medium text-foreground">
        {filter === "unread" ? "You’re all caught up" : "No notifications yet"}
      </p>
      <p className="mt-1 max-w-64 text-sm text-muted-foreground">
        {filter === "unread"
          ? "There are no unread updates right now."
          : "New updates related to your work will appear here."}
      </p>
    </div>
  )
}

function NotificationItem({
  notification,
  onActivate,
  onMarkAsRead,
}: {
  notification: AppNotification
  onActivate: () => void
  onMarkAsRead: () => void
}) {
  const NotificationIcon = notificationIcons[notification.kind]

  return (
    <div
      className={cn(
        "group relative flex rounded-lg border border-transparent transition-colors hover:bg-muted/70",
        !notification.isRead && "bg-background hover:bg-muted/70"
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 gap-3 p-3 text-left outline-none focus-visible:rounded-lg focus-visible:ring-3 focus-visible:ring-ring/30"
        onClick={onActivate}
      >
        <Avatar className="mt-0.5 size-9 border border-border bg-background">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <NotificationIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block pr-6 text-sm leading-5 text-foreground">
            <strong className="font-semibold">{notification.source}</strong>{" "}
            {notification.action}{" "}
            <strong className="font-semibold">
              {notification.objectLabel}
            </strong>
          </span>
          {notification.detail ? (
            <span className="mt-0.5 line-clamp-2 block text-xs leading-4 text-muted-foreground">
              {notification.detail}
            </span>
          ) : null}
          <span className="mt-1 block text-xs text-muted-foreground">
            {notification.timestampLabel}
          </span>
        </span>
      </button>
      {!notification.isRead ? (
        <>
          <span
            className="absolute top-4 right-3 size-2 rounded-full bg-primary group-hover:hidden"
            aria-hidden="true"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-2.5 right-2 hidden group-focus-within:inline-flex group-hover:inline-flex"
            aria-label={`Mark notification from ${notification.source} as read`}
            onClick={onMarkAsRead}
          >
            <IconCheck />
          </Button>
        </>
      ) : null}
    </div>
  )
}

function useNotificationLoading(open: boolean) {
  const [isLoading, setIsLoading] = React.useState(true)
  const hasLoaded = React.useRef(false)

  React.useEffect(() => {
    if (!open || hasLoaded.current) return

    const loadingTimer = window.setTimeout(() => {
      hasLoaded.current = true
      setIsLoading(false)
    }, 350)

    return () => window.clearTimeout(loadingTimer)
  }, [open])

  return isLoading
}

function NotificationsContent({
  filter,
  notifications,
  unreadCount,
  onFilterChange,
  onMarkAllAsRead,
  onMarkAsRead,
  isLoading,
  onClose,
  TitleComponent,
  DescriptionComponent,
}: NotificationsContentProps) {
  const router = useRouter()

  const handleActivate = (notification: AppNotification) => {
    onMarkAsRead(notification.id)
    onClose()
    router.push(notification.destination)
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b px-4 py-3.5">
        <TitleComponent className="text-lg font-semibold">
          Notifications
        </TitleComponent>
        {unreadCount > 0 ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {unreadCount}
          </span>
        ) : null}
        <DescriptionComponent className="sr-only">
          Recent updates related to your assigned support work.
        </DescriptionComponent>
        <div className="ml-auto flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close notifications"
            onClick={onClose}
          >
            <IconX />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b px-4 py-3">
        <div className="flex items-center gap-1">
          {(["all", "unread"] as const).map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={filter === filterOption}
              onClick={() => onFilterChange(filterOption)}
            >
              {filterOption === "all" ? "All" : "Unread"}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          disabled={unreadCount === 0}
          onClick={onMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </div>

      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        {isLoading ? (
          <NotificationLoadingState />
        ) : notifications.length === 0 ? (
          <NotificationEmptyState filter={filter} />
        ) : (
          <div className="p-2">
            {dateGroups.map((dateGroup) => {
              const groupedNotifications = notifications.filter(
                (notification) => notification.dateGroup === dateGroup
              )

              if (groupedNotifications.length === 0) return null

              return (
                <section
                  key={dateGroup}
                  aria-labelledby={`notifications-${dateGroup.toLowerCase()}`}
                >
                  <h3
                    id={`notifications-${dateGroup.toLowerCase()}`}
                    className="flex items-center gap-3 px-3 pt-3 pb-1.5 text-xs font-medium text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border"
                  >
                    {dateGroup}
                  </h3>
                  <div className="space-y-1">
                    {groupedNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onActivate={() => handleActivate(notification)}
                        onMarkAsRead={() => onMarkAsRead(notification.id)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export function NotificationsPanel({
  open,
  onOpenChange,
  ...contentProps
}: NotificationsPanelProps) {
  const isLoading = useNotificationLoading(open)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!w-[calc(100%_-_1rem)] max-w-md"
      >
        <NotificationsContent
          {...contentProps}
          isLoading={isLoading}
          onClose={() => onOpenChange(false)}
          TitleComponent={SheetTitle}
          DescriptionComponent={SheetDescription}
        />
      </SheetContent>
    </Sheet>
  )
}

export function NotificationsPopover({
  unreadCount,
  ...contentProps
}: NotificationsSurfaceProps) {
  const [open, setOpen] = React.useState(false)
  const isLoading = useNotificationLoading(open)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="relative size-9 rounded-full p-0"
            aria-label={`Notifications, ${unreadCount} unread`}
          />
        }
      >
        <IconBell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 outline-none"
        >
          <PopoverPrimitive.Popup className="flex h-[min(720px,calc(100vh-5rem))] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl transition duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <NotificationsContent
              {...contentProps}
              unreadCount={unreadCount}
              isLoading={isLoading}
              onClose={() => setOpen(false)}
              TitleComponent={PopoverPrimitive.Title}
              DescriptionComponent={PopoverPrimitive.Description}
            />
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
