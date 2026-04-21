import * as React from "react"

import { DndContext, type DragEndEvent } from "@dnd-kit/core"

export type DataGridIcon = React.ComponentType<{
  className?: string
}>

export type DataGridRowBase = {
  id: string
}

export type DataGridColumn<ColumnId extends string> = {
  id: ColumnId
  label: string
  icon: DataGridIcon
  defaultWidth: number
  minWidth?: number
}

export type DataGridDrawerPanelProps<Row, ColumnId extends string> = {
  drawerRow: Row | null
  drawerColumn: DataGridColumn<ColumnId> | null
  drawerCellValue: React.ReactNode
  getRowLabel: (row: Row) => string
  isEditableColumn: (columnId: ColumnId) => boolean
  isEmptyValue: (value: React.ReactNode) => boolean
  updateRow: (rowId: string, updater: (row: Row) => Row) => void
  closeDrawer: () => void
}

export type DataGridToolbarRenderProps<ColumnId extends string> = {
  visibleRowCount: number
  selectedRowIds: string[]
  selectedRowCount: number
  allVisibleRowsSelected: boolean
  someVisibleRowsSelected: boolean
  onToggleAllRows: (checked: boolean) => void
  clearSelection: () => void
  showSummaries: boolean
  onShowSummariesChange: (next: boolean) => void
  visibleColumns: DataGridColumn<ColumnId>[]
  visibleColumnIds: ColumnId[]
  hiddenColumns: DataGridColumn<ColumnId>[]
  toggleColumnVisibility: (columnId: ColumnId, visible: boolean) => void
  optionsSensors: NonNullable<
    React.ComponentProps<typeof DndContext>["sensors"]
  >
  onOptionColumnDragEnd: (event: DragEndEvent) => void
  optionsDndContextId: string
}

export type DataGridProps<
  Row extends DataGridRowBase,
  ColumnId extends string,
> = {
  rows: Row[]
  columns: DataGridColumn<ColumnId>[]
  getRowLabel: (row: Row) => string
  renderCell: (row: Row, column: DataGridColumn<ColumnId>) => React.ReactNode
  isEditableColumn: (columnId: ColumnId) => boolean
  getCellEditValue: (row: Row, columnId: ColumnId) => string
  applyCellEdit: (row: Row, columnId: ColumnId, nextValue: string) => Row
  getDrawerCellValue: (row: Row, columnId: ColumnId) => React.ReactNode
  canOpenDrawer?: (columnId: ColumnId) => boolean
  renderSummary?: (
    column: DataGridColumn<ColumnId>,
    visibleRows: Row[]
  ) => React.ReactNode
  renderDrawerPanel?: (
    props: DataGridDrawerPanelProps<Row, ColumnId>
  ) => React.ReactNode
  renderToolbar?: (
    props: DataGridToolbarRenderProps<ColumnId>
  ) => React.ReactNode
  onToolbarPropsChange?: (props: DataGridToolbarRenderProps<ColumnId>) => void
  onOpenDrawerCell?: (cell: EditingCell<ColumnId>) => void
  drawerModal?: boolean
  disablePointerDismissal?: boolean
  stickySummaryFooter?: boolean
  fillAvailableHeight?: boolean
  tableContainerClassName?: string
  onRowsChange?: (rows: Row[]) => void
}

export type EditingCell<ColumnId extends string> = {
  rowId: string
  columnId: ColumnId
  originRect?: {
    x: number
    y: number
    width: number
    height: number
  }
}
