"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconCalendarTime,
  IconDotsVertical,
  IconFilter,
  IconGripVertical,
  IconPlus,
  IconUser,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type {
  TicketTask,
  TicketTaskDuePreset,
  TicketTaskStatus,
} from "@/lib/tickets/detail-data"
import {
  DEFAULT_TICKET_TASK_TITLE,
  createTicketTaskId,
  ticketTaskDueLabel,
  ticketTaskDueOptions,
  ticketTaskStatusLabel,
  ticketTaskStatusOptions,
  ticketTaskStatusTextClassName,
} from "@/lib/tickets/task-utils"
import type { TicketPerson } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketTaskInlineListProps = {
  ticketId: string
  tasks: TicketTask[]
  assigneeOptions: TicketPerson[]
  onToggleTask: (taskId: string) => void
  onCreateTask: (payload: { id: string; title: string }) => void
  onUpdateTask: (
    taskId: string,
    patch: Partial<Pick<TicketTask, "title" | "status" | "due" | "assignee">>
  ) => void
  onDeleteTask: (taskId: string) => void
  onDuplicateTask: (taskId: string) => void
  onReorderTasks: (activeTaskId: string, overTaskId: string) => void
}

export function TicketTaskInlineList({
  ticketId,
  tasks,
  assigneeOptions,
  onToggleTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onReorderTasks,
}: TicketTaskInlineListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [statusFilters, setStatusFilters] = useState<TicketTaskStatus[]>([])
  const [dueFilters, setDueFilters] = useState<TicketTaskDuePreset[]>([])
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchStatus =
        statusFilters.length === 0 || statusFilters.includes(task.status)
      const matchDue = dueFilters.length === 0 || dueFilters.includes(task.due)
      const matchAssignee =
        assigneeFilter === "all"
          ? true
          : assigneeFilter === "unassigned"
            ? !task.assignee
            : task.assignee?.name === assigneeFilter

      return matchStatus && matchDue && matchAssignee
    })
  }, [assigneeFilter, dueFilters, statusFilters, tasks])

  const isFiltering =
    statusFilters.length > 0 || dueFilters.length > 0 || assigneeFilter !== "all"

  const toggleStatusFilter = (nextValue: TicketTaskStatus, checked: boolean) => {
    setStatusFilters((currentFilters) => {
      if (checked) {
        if (currentFilters.includes(nextValue)) return currentFilters
        return [...currentFilters, nextValue]
      }

      return currentFilters.filter((value) => value !== nextValue)
    })
  }

  const toggleDueFilter = (nextValue: TicketTaskDuePreset, checked: boolean) => {
    setDueFilters((currentFilters) => {
      if (checked) {
        if (currentFilters.includes(nextValue)) return currentFilters
        return [...currentFilters, nextValue]
      }

      return currentFilters.filter((value) => value !== nextValue)
    })
  }

  const startEditTask = (task: TicketTask) => {
    setEditingTaskId(task.id)
    setEditingTitle(task.title)
  }

  const cancelEditTask = () => {
    setEditingTaskId(null)
    setEditingTitle("")
  }

  const commitUpdateTask = (taskId: string) => {
    const nextTitle = editingTitle.trim()
    if (!nextTitle) {
      cancelEditTask()
      return
    }

    onUpdateTask(taskId, { title: nextTitle })
    cancelEditTask()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorderTasks(String(active.id), String(over.id))
  }

  return (
    <div className="scrollbar-hidden h-full overflow-y-auto px-6 py-6">
      <div className="rounded-3xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl"
                    aria-label="Filter tasks"
                  />
                }
              >
                <IconFilter className="size-4" />
                Filter
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-64">
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Filter tasks
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <div className="px-3 py-2 text-xs text-muted-foreground">Status</div>
                  {ticketTaskStatusOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={statusFilters.includes(option.value)}
                      onCheckedChange={(checked) =>
                        toggleStatusFilter(option.value, checked === true)
                      }
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <div className="px-3 py-2 text-xs text-muted-foreground">Due</div>
                  {ticketTaskDueOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={dueFilters.includes(option.value)}
                      onCheckedChange={(checked) =>
                        toggleDueFilter(option.value, checked === true)
                      }
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <div className="px-3 py-2 text-xs text-muted-foreground">Assignee</div>
                  <DropdownMenuRadioGroup
                    value={assigneeFilter}
                    onValueChange={(nextValue) => setAssigneeFilter(nextValue)}
                  >
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="unassigned">
                      Unassigned
                    </DropdownMenuRadioItem>
                    {assigneeOptions.map((assignee) => (
                      <DropdownMenuRadioItem key={assignee.name} value={assignee.name}>
                        {assignee.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilters([])
                    setDueFilters([])
                    setAssigneeFilter("all")
                  }}
                >
                  Clear all filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isFiltering ? (
              <span className="text-xs font-medium text-muted-foreground">
                {filteredTasks.length} shown
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-xl px-3.5"
              onClick={() => {
                const nextTaskId = createTicketTaskId(ticketId)
                const nextTaskTitle = DEFAULT_TICKET_TASK_TITLE

                onCreateTask({
                  id: nextTaskId,
                  title: nextTaskTitle,
                })
                setEditingTaskId(nextTaskId)
                setEditingTitle(nextTaskTitle)
              }}
            >
              <IconPlus className="size-4" />
              New Task
            </Button>
          </div>
        </div>

        <div className="space-y-1 p-2">
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No tasks yet. Create one from New Task.
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No tasks match the current filters.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {filteredTasks.map((task) => {
                    const isEditing = editingTaskId === task.id

                    return (
                      <TicketTaskInlineRow
                        key={task.id}
                        task={task}
                        assigneeOptions={assigneeOptions}
                        isEditing={isEditing}
                        isAnyTaskEditing={editingTaskId !== null}
                        editingTitle={editingTitle}
                        onEditingTitleChange={setEditingTitle}
                        onToggle={() => onToggleTask(task.id)}
                        onStartEdit={() => startEditTask(task)}
                        onCancelEdit={cancelEditTask}
                        onSaveEdit={() => commitUpdateTask(task.id)}
                        onStatusChange={(status) =>
                          onUpdateTask(task.id, { status })
                        }
                        onDueChange={(due) => onUpdateTask(task.id, { due })}
                        onAssigneeChange={(assignee) =>
                          onUpdateTask(task.id, { assignee })
                        }
                        onDelete={() => onDeleteTask(task.id)}
                        onDuplicate={() => onDuplicateTask(task.id)}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}

type TicketTaskInlineRowProps = {
  task: TicketTask
  assigneeOptions: TicketPerson[]
  isEditing: boolean
  isAnyTaskEditing: boolean
  editingTitle: string
  onEditingTitleChange: (nextValue: string) => void
  onToggle: () => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onStatusChange: (nextStatus: TicketTaskStatus) => void
  onDueChange: (nextDue: TicketTaskDuePreset) => void
  onAssigneeChange: (assignee?: TicketPerson) => void
  onDelete: () => void
  onDuplicate: () => void
}

function TicketTaskInlineRow({
  task,
  assigneeOptions,
  isEditing,
  isAnyTaskEditing,
  editingTitle,
  onEditingTitleChange,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onStatusChange,
  onDueChange,
  onAssigneeChange,
  onDelete,
  onDuplicate,
}: TicketTaskInlineRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isAnyTaskEditing,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isDone = task.status === "done"

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl px-1 py-2 transition",
          isDone ? "bg-background" : "hover:bg-muted/40",
          isDragging && "opacity-60"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 cursor-grab hover:bg-transparent text-muted-foreground/50 active:cursor-grabbing"
          aria-label="Reorder task"
          disabled={isAnyTaskEditing}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="size-4" />
        </Button>

        <Checkbox
          checked={isDone}
          onCheckedChange={() => onToggle()}
          aria-label={isDone ? `Mark ${task.title} as open` : `Mark ${task.title} as done`}
          className="rounded-full"
        />

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Input
              value={editingTitle}
              onChange={(event) => onEditingTitleChange(event.target.value)}
              onBlur={onSaveEdit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  onSaveEdit()
                }

                if (event.key === "Escape") {
                  event.preventDefault()
                  onCancelEdit()
                }
              }}
              className="h-8 rounded-lg text-base border-none ring-0 bg-transparent transition-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus:px-0 focus:bg-transparent focus:shadow-none"
              aria-label="Edit task title"
              autoFocus
            />
          ) : (
            <p
              className={cn(
                "truncate text-sm font-medium text-foreground",
                isDone && "text-muted-foreground line-through"
              )}
              onDoubleClick={onStartEdit}
            >
              {task.title}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 rounded-lg px-2 text-xs font-semibold",
                    ticketTaskStatusTextClassName[task.status]
                  )}
                />
              }
            >
              {ticketTaskStatusLabel[task.status]}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <div className="px-3 py-2 text-xs text-muted-foreground">Set status</div>
              <DropdownMenuRadioGroup
                value={task.status}
                onValueChange={(nextValue) =>
                  onStatusChange(nextValue as TicketTaskStatus)
                }
              >
                {ticketTaskStatusOptions.map((statusOption) => (
                  <DropdownMenuRadioItem
                    key={statusOption.value}
                    value={statusOption.value}
                  >
                    {statusOption.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg px-2 text-xs text-muted-foreground"
                />
              }
            >
              <IconCalendarTime className="size-3.5" />
              {ticketTaskDueLabel[task.due]}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Set due date
              </div>
              <DropdownMenuRadioGroup
                value={task.due}
                onValueChange={(nextValue) =>
                  onDueChange(nextValue as TicketTaskDuePreset)
                }
              >
                {ticketTaskDueOptions.map((dueOption) => (
                  <DropdownMenuRadioItem key={dueOption.value} value={dueOption.value}>
                    {dueOption.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg"
                  aria-label="Set assignee"
                />
              }
            >
              <Avatar className="size-6">
                {task.assignee?.avatarUrl ? (
                  <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                ) : null}
                <AvatarFallback className="text-[10px]">
                  {task.assignee?.name
                    ? task.assignee.name.charAt(0).toUpperCase()
                    : <IconUser className="size-3.5" />}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <div className="px-3 py-2 text-xs text-muted-foreground">Assign task</div>
              <DropdownMenuRadioGroup
                value={task.assignee?.name ?? "unassigned"}
                onValueChange={(nextValue) => {
                  if (nextValue === "unassigned") {
                    onAssigneeChange(undefined)
                    return
                  }

                  const selected = assigneeOptions.find(
                    (assigneeOption) => assigneeOption.name === nextValue
                  )
                  onAssigneeChange(selected)
                }}
              >
                <DropdownMenuRadioItem value="unassigned">
                  Unassigned
                </DropdownMenuRadioItem>
                {assigneeOptions.map((assigneeOption) => (
                  <DropdownMenuRadioItem
                    key={assigneeOption.name}
                    value={assigneeOption.name}
                  >
                    {assigneeOption.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg text-muted-foreground"
                  aria-label="Task actions"
                />
              }
            >
              <IconDotsVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem onClick={onStartEdit}>Edit title</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
