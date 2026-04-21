import * as React from "react"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconGripVertical, IconSeparatorVertical } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { TableHead } from "@/components/ui/table"

import { type DataGridColumn } from "@/components/data-grid/types"

type SortableHeaderCellProps<ColumnId extends string> = {
  column: DataGridColumn<ColumnId>
  width: number
  onResize: (
    event: React.PointerEvent<HTMLButtonElement>,
    columnId: ColumnId
  ) => void
}

type SortableColumnOptionItemProps<ColumnId extends string> = {
  column: DataGridColumn<ColumnId>
  checked: boolean
  disabled: boolean
  onCheckedChange: (checked: boolean) => void
}

function ColumnHead<ColumnId extends string>({
  icon: Icon,
  label,
}: Pick<DataGridColumn<ColumnId>, "icon" | "label">) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 leading-none">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </span>
  )
}

export function SortableColumnOptionItem<ColumnId extends string>({
  column,
  checked,
  disabled,
  onCheckedChange,
}: SortableColumnOptionItemProps<ColumnId>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
    >
      <DropdownMenuCheckboxItem
        checked={checked}
        disabled={disabled}
        onCheckedChange={(next) => onCheckedChange(next === true)}
        className={cn(
          "touch-none pl-1.5",
          isDragging && "bg-muted/40 opacity-70"
        )}
      >
        <span
          {...attributes}
          {...listeners}
          role="button"
          aria-label={`Reorder ${column.label}`}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          className="inline-flex size-5 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <IconGripVertical className="size-3.5" />
        </span>
        <span className="truncate">{column.label}</span>
      </DropdownMenuCheckboxItem>
    </div>
  )
}

export function SortableHeaderCell<ColumnId extends string>({
  column,
  width,
  onResize,
}: SortableHeaderCellProps<ColumnId>) {
  return (
    <TableHead
      className="group/column-head relative h-10 overflow-hidden border-r bg-muted/60 px-2 text-sm"
      style={{
        width,
        minWidth: width,
        transition: "none",
      }}
    >
      <div className="flex h-full min-w-0 items-center overflow-hidden">
        <ColumnHead icon={column.icon} label={column.label} />
      </div>
      <button
        type="button"
        aria-label={`Resize ${column.label} column`}
        className="absolute top-0 right-0 flex h-full w-3 cursor-col-resize items-center justify-center text-border transition-colors hover:text-muted-foreground"
        onPointerDown={(event) => onResize(event, column.id)}
      >
        <IconSeparatorVertical className="size-4" />
      </button>
    </TableHead>
  )
}
