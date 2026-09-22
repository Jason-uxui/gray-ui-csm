"use client"

import * as React from "react"

import { notificationMockData } from "@/lib/notifications/mock-data"
import type { AppNotification } from "@/lib/notifications/types"

export type NotificationFilter = "all" | "unread"

export function useNotificationsState() {
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    () => notificationMockData.map((notification) => ({ ...notification }))
  )
  const [filter, setFilter] = React.useState<NotificationFilter>("all")

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length

  const visibleNotifications =
    filter === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications

  const markAsRead = React.useCallback((notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = React.useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true }))
    )
  }, [])

  return {
    filter,
    markAllAsRead,
    markAsRead,
    notifications: visibleNotifications,
    setFilter,
    unreadCount,
  }
}
