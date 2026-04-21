import * as React from "react"

import { cn } from "@/lib/utils"
import { TableCell, TableFooter, TableRow } from "@/components/ui/table"

import {
  type DataGridColumn,
  type DataGridRowBase,
} from "@/components/data-grid/types"

type DataGridSummaryFooterProps<
  Row extends DataGridRowBase,
  ColumnId extends string,
> = {
  showSummaries: boolean
  stickySummaryFooter: boolean
  renderSummary?: (
    column: DataGridColumn<ColumnId>,
    visibleRows: Row[]
  ) => React.ReactNode
  visibleColumns: DataGridColumn<ColumnId>[]
  visibleRows: Row[]
  columnWidths: Record<ColumnId, number>
  draggingColumnId: ColumnId | null
  isEmptyValue: (value: React.ReactNode) => boolean
}

export function DataGridSummaryFooter<
  Row extends DataGridRowBase,
  ColumnId extends string,
>({
  showSummaries,
  stickySummaryFooter,
  renderSummary,
  visibleColumns,
  visibleRows,
  columnWidths,
  draggingColumnId,
  isEmptyValue,
}: DataGridSummaryFooterProps<Row, ColumnId>) {
  if (!showSummaries || !renderSummary) return null

  const stickyCellClassName = stickySummaryFooter
    ? "sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90"
    : undefined

  return (
    <TableFooter className="border-b bg-background font-normal">
      <TableRow className="hover:bg-transparent">
        <TableCell className={cn("h-10 border-r px-2 py-1", stickyCellClassName)} />
        {visibleColumns.map((column) => {
          const summaryContent = renderSummary(column, visibleRows)

          return (
            <TableCell
              key={`summary-${column.id}`}
              className={cn(
                "h-10 border-r px-2 py-1 text-left text-xs whitespace-nowrap text-muted-foreground",
                stickyCellClassName,
                draggingColumnId === column.id && "bg-muted/20"
              )}
              style={{
                width: columnWidths[column.id],
                minWidth: columnWidths[column.id],
              }}
            >
              {!isEmptyValue(summaryContent) ? (
                <span className="inline-block">{summaryContent}</span>
              ) : null}
            </TableCell>
          )
        })}
      </TableRow>
    </TableFooter>
  )
}
