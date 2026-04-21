import * as React from "react"

import { Table } from "@/components/ui/table"
import {
  DataGridSummaryFooter,
  DataGridTableBody,
  DataGridTableHeader,
} from "@/components/data-grid/table-parts"
import {
  type DataGridColumn,
  type DataGridRowBase,
  type EditingCell,
} from "@/components/data-grid/types"

type DataGridTableViewProps<
  Row extends DataGridRowBase,
  ColumnId extends string,
> = {
  tableRef: React.RefObject<HTMLTableElement | null>
  gridMinWidth: number
  visibleColumns: DataGridColumn<ColumnId>[]
  columnWidths: Record<ColumnId, number>
  visibleRows: Row[]
  getRowLabel: (row: Row) => string
  editingCell: EditingCell<ColumnId> | null
  isEditableColumn: (columnId: ColumnId) => boolean
  startEditing: (row: Row, columnId: ColumnId) => void
  onCellKeyDown: (
    event: React.KeyboardEvent<HTMLTableCellElement>,
    row: Row,
    rowIndex: number,
    column: DataGridColumn<ColumnId>,
    colIndex: number
  ) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  draftValue: string
  setDraftValue: (value: string) => void
  commitEdit: () => void
  cancelEdit: () => void
  canOpenDrawer: (columnId: ColumnId) => boolean
  renderCell: (row: Row, column: DataGridColumn<ColumnId>) => React.ReactNode
  onOpenDrawer: (cell: EditingCell<ColumnId>) => void
  selectedRowIds: string[]
  allVisibleRowsSelected: boolean
  someVisibleRowsSelected: boolean
  onToggleRowSelection: (rowId: string, checked: boolean) => void
  onToggleAllRows: (checked: boolean) => void
  showSummaries: boolean
  renderSummary?: (
    column: DataGridColumn<ColumnId>,
    visibleRows: Row[]
  ) => React.ReactNode
  stickySummaryFooter: boolean
  tableContainerClassName?: string
  isEmptyValue: (value: React.ReactNode) => boolean
  onResizeStart: (
    event: React.PointerEvent<HTMLButtonElement>,
    columnId: ColumnId
  ) => void
  draggingColumnId: ColumnId | null
}

export function DataGridTableView<
  Row extends DataGridRowBase,
  ColumnId extends string,
>({
  tableRef,
  gridMinWidth,
  visibleColumns,
  columnWidths,
  visibleRows,
  getRowLabel,
  editingCell,
  isEditableColumn,
  startEditing,
  onCellKeyDown,
  inputRef,
  draftValue,
  setDraftValue,
  commitEdit,
  cancelEdit,
  canOpenDrawer,
  renderCell,
  onOpenDrawer,
  selectedRowIds,
  allVisibleRowsSelected,
  someVisibleRowsSelected,
  onToggleRowSelection,
  onToggleAllRows,
  showSummaries,
  renderSummary,
  stickySummaryFooter,
  tableContainerClassName,
  isEmptyValue,
  onResizeStart,
  draggingColumnId,
}: DataGridTableViewProps<Row, ColumnId>) {
  return (
    <Table
      ref={tableRef}
      className="table-fixed"
      containerClassName={tableContainerClassName}
      style={{ width: `max(100%, ${gridMinWidth}px)` }}
    >
      <DataGridTableHeader
        visibleColumns={visibleColumns}
        columnWidths={columnWidths}
        allVisibleRowsSelected={allVisibleRowsSelected}
        someVisibleRowsSelected={someVisibleRowsSelected}
        onToggleAllRows={onToggleAllRows}
        onResizeStart={onResizeStart}
      />

      <DataGridTableBody
        visibleRows={visibleRows}
        getRowLabel={getRowLabel}
        visibleColumns={visibleColumns}
        editingCell={editingCell}
        isEditableColumn={isEditableColumn}
        startEditing={startEditing}
        onCellKeyDown={onCellKeyDown}
        inputRef={inputRef}
        draftValue={draftValue}
        setDraftValue={setDraftValue}
        commitEdit={commitEdit}
        cancelEdit={cancelEdit}
        canOpenDrawer={canOpenDrawer}
        renderCell={renderCell}
        onOpenDrawer={onOpenDrawer}
        selectedRowIds={selectedRowIds}
        onToggleRowSelection={onToggleRowSelection}
        columnWidths={columnWidths}
        draggingColumnId={draggingColumnId}
      />

      <DataGridSummaryFooter
        showSummaries={showSummaries}
        renderSummary={renderSummary}
        stickySummaryFooter={stickySummaryFooter}
        visibleColumns={visibleColumns}
        visibleRows={visibleRows}
        columnWidths={columnWidths}
        draggingColumnId={draggingColumnId}
        isEmptyValue={isEmptyValue}
      />
    </Table>
  )
}
