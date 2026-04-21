import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { SortableHeaderCell } from "@/components/data-grid/sortable-parts"
import { type DataGridColumn } from "@/components/data-grid/types"

const CONTROL_COLUMN_WIDTH = 40

type DataGridTableHeaderProps<ColumnId extends string> = {
  visibleColumns: DataGridColumn<ColumnId>[]
  columnWidths: Record<ColumnId, number>
  allVisibleRowsSelected: boolean
  someVisibleRowsSelected: boolean
  onToggleAllRows: (checked: boolean) => void
  onResizeStart: (
    event: React.PointerEvent<HTMLButtonElement>,
    columnId: ColumnId
  ) => void
}

export function DataGridTableHeader<ColumnId extends string>({
  visibleColumns,
  columnWidths,
  allVisibleRowsSelected,
  someVisibleRowsSelected,
  onToggleAllRows,
  onResizeStart,
}: DataGridTableHeaderProps<ColumnId>) {
  return (
    <>
      <colgroup>
        <col style={{ width: CONTROL_COLUMN_WIDTH }} />
        {visibleColumns.map((column) => (
          <col
            key={`col-${column.id}`}
            style={{ width: columnWidths[column.id] }}
          />
        ))}
      </colgroup>

      <TableHeader className="bg-muted/60">
        <TableRow className="bg-muted/60 hover:bg-muted/60">
          <TableHead className="h-10 w-10 border-r bg-muted/60 px-0 text-center">
            <Checkbox
              aria-label="Select all rows"
              checked={allVisibleRowsSelected}
              indeterminate={someVisibleRowsSelected}
              onCheckedChange={(checked) => onToggleAllRows(checked === true)}
              className="mx-auto"
            />
          </TableHead>
          {visibleColumns.map((column) => (
            <SortableHeaderCell
              key={column.id}
              column={column}
              width={columnWidths[column.id]}
              onResize={onResizeStart}
            />
          ))}
        </TableRow>
      </TableHeader>
    </>
  )
}
