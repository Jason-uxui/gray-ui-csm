"use client"

import * as React from "react"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core"

import { DrawerPanel } from "@/components/data-grid/drawer-panel"
import { DataGridTableView } from "@/components/data-grid/table-view"
import { useGridColumns } from "@/components/data-grid/use-grid-columns"
import { useGridEditing } from "@/components/data-grid/use-grid-editing"
import { cn } from "@/lib/utils"
import {
  type DataGridDrawerPanelProps,
  type DataGridProps,
  type DataGridRowBase,
  type EditingCell,
} from "@/components/data-grid/types"

export type {
  DataGridColumn,
  DataGridDrawerPanelProps,
  DataGridProps,
  DataGridRowBase,
  DataGridToolbarRenderProps,
} from "@/components/data-grid/types"

const MIN_COLUMN_WIDTH = 96
const CONTROL_COLUMN_WIDTH = 40

function isEmptyValue(value: React.ReactNode) {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim().length === 0
  return false
}

export function DataGrid<Row extends DataGridRowBase, ColumnId extends string>({
  rows,
  columns,
  getRowLabel,
  renderCell,
  isEditableColumn,
  getCellEditValue,
  applyCellEdit,
  getDrawerCellValue,
  canOpenDrawer = () => true,
  renderSummary,
  renderDrawerPanel,
  renderToolbar,
  onToolbarPropsChange,
  onOpenDrawerCell,
  drawerModal = false,
  disablePointerDismissal = true,
  stickySummaryFooter = false,
  fillAvailableHeight = false,
  tableContainerClassName,
  onRowsChange,
}: DataGridProps<Row, ColumnId>) {
  const [showSummaries, setShowSummaries] = React.useState(true)
  const [drawerCell, setDrawerCell] =
    React.useState<EditingCell<ColumnId> | null>(null)
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([])
  const reactInstanceId = React.useId()
  const instanceId = React.useMemo(
    () => reactInstanceId.replace(/:/g, ""),
    [reactInstanceId]
  )

  const gridRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const tableRef = React.useRef<HTMLTableElement>(null)

  const {
    columnWidths,
    visibleColumnIds,
    draggingColumnId,
    visibleColumns,
    gridMinWidth,
    hiddenColumns,
    toggleColumnVisibility,
    handleOptionColumnDragEnd,
    beginResize,
  } = useGridColumns({
    columns,
    tableRef,
    minColumnWidth: MIN_COLUMN_WIDTH,
    controlColumnWidth: CONTROL_COLUMN_WIDTH,
  })

  const optionsPointerSensorOptions = React.useMemo(
    () => ({
      activationConstraint: {
        distance: 6,
      },
    }),
    []
  )
  const optionsSensors = useSensors(
    useSensor(PointerSensor, optionsPointerSensorOptions)
  )

  const drawerRow = React.useMemo(() => {
    if (!drawerCell) return null
    return rows.find((row) => row.id === drawerCell.rowId) ?? null
  }, [drawerCell, rows])

  const drawerColumn = React.useMemo(() => {
    if (!drawerCell) return null
    return columns.find((column) => column.id === drawerCell.columnId) ?? null
  }, [columns, drawerCell])

  const drawerCellValue = React.useMemo(() => {
    if (!drawerCell || !drawerRow) return null
    return getDrawerCellValue(drawerRow, drawerCell.columnId)
  }, [drawerCell, drawerRow, getDrawerCellValue])

  const commitRows = React.useCallback(
    (updater: (currentRows: Row[]) => Row[]) => {
      const nextRows = updater(rows)
      onRowsChange?.(nextRows)
    },
    [onRowsChange, rows]
  )

  const {
    editingCell,
    draftValue,
    setDraftValue,
    startEditing,
    commitEdit,
    cancelEdit,
    handleCellKeyDown,
  } = useGridEditing<Row, ColumnId>({
    gridRef,
    inputRef,
    visibleRowCount: rows.length,
    visibleColumnCount: visibleColumns.length,
    isEditableColumn,
    getCellEditValue,
    applyCellEdit,
    commitRows,
  })

  const closeDrawer = React.useCallback(() => {
    setDrawerCell(null)
  }, [])

  React.useEffect(() => {
    const visibleRowIds = new Set(rows.map((row) => row.id))

    setSelectedRowIds((current) =>
      current.filter((rowId) => visibleRowIds.has(rowId))
    )
  }, [rows])

  const toggleRowSelection = React.useCallback(
    (rowId: string, checked: boolean) => {
      setSelectedRowIds((current) => {
        if (checked) {
          return current.includes(rowId) ? current : [...current, rowId]
        }

        return current.filter((currentRowId) => currentRowId !== rowId)
      })
    },
    []
  )

  const toggleAllRows = React.useCallback(
    (checked: boolean) => {
      setSelectedRowIds(checked ? rows.map((row) => row.id) : [])
    },
    [rows]
  )

  const clearSelection = React.useCallback(() => {
    setSelectedRowIds([])
  }, [])

  const selectedRowCount = selectedRowIds.length
  const allVisibleRowsSelected =
    rows.length > 0 && selectedRowCount === rows.length
  const someVisibleRowsSelected =
    selectedRowCount > 0 && !allVisibleRowsSelected

  const updateRow = React.useCallback(
    (rowId: string, updater: (row: Row) => Row) => {
      commitRows((currentRows) =>
        currentRows.map((row) => (row.id === rowId ? updater(row) : row))
      )
    },
    [commitRows]
  )

  const drawerPanelProps: DataGridDrawerPanelProps<Row, ColumnId> = {
    drawerRow,
    drawerColumn,
    drawerCellValue,
    getRowLabel,
    isEditableColumn,
    isEmptyValue,
    updateRow,
    closeDrawer,
  }

  const toolbarProps = React.useMemo(
    () => ({
      visibleRowCount: rows.length,
      selectedRowIds,
      selectedRowCount,
      allVisibleRowsSelected,
      someVisibleRowsSelected,
      onToggleAllRows: toggleAllRows,
      clearSelection,
      showSummaries,
      onShowSummariesChange: setShowSummaries,
      visibleColumns,
      visibleColumnIds,
      hiddenColumns,
      toggleColumnVisibility,
      optionsSensors,
      onOptionColumnDragEnd: handleOptionColumnDragEnd,
      optionsDndContextId: `data-grid-options-${instanceId}`,
    }),
    [
      rows.length,
      selectedRowIds,
      selectedRowCount,
      allVisibleRowsSelected,
      someVisibleRowsSelected,
      toggleAllRows,
      clearSelection,
      showSummaries,
      visibleColumns,
      visibleColumnIds,
      hiddenColumns,
      toggleColumnVisibility,
      optionsSensors,
      handleOptionColumnDragEnd,
      instanceId,
    ]
  )

  React.useEffect(() => {
    onToolbarPropsChange?.(toolbarProps)
  }, [onToolbarPropsChange, toolbarProps])

  return (
    <DialogPrimitive.Root
      open={drawerCell !== null}
      modal={drawerModal}
      disablePointerDismissal={disablePointerDismissal}
      onOpenChange={(open) => {
        if (!open) closeDrawer()
      }}
    >
      <div
        className={cn("min-h-0", fillAvailableHeight && "flex h-full flex-col")}
        ref={gridRef}
      >
        {renderToolbar?.(toolbarProps)}

        <div className={cn(fillAvailableHeight && "min-h-0 flex-1")}>
          <DataGridTableView
            tableRef={tableRef}
            gridMinWidth={gridMinWidth}
            visibleColumns={visibleColumns}
            columnWidths={columnWidths}
            draggingColumnId={draggingColumnId}
            visibleRows={rows}
            getRowLabel={getRowLabel}
            editingCell={editingCell}
            isEditableColumn={isEditableColumn}
            startEditing={startEditing}
            onCellKeyDown={handleCellKeyDown}
            inputRef={inputRef}
            draftValue={draftValue}
            setDraftValue={setDraftValue}
            commitEdit={commitEdit}
            cancelEdit={cancelEdit}
            canOpenDrawer={canOpenDrawer}
            renderCell={renderCell}
            onOpenDrawer={(cell) => {
              if (onOpenDrawerCell) {
                onOpenDrawerCell(cell)
                return
              }

              setDrawerCell(cell)
            }}
            selectedRowIds={selectedRowIds}
            allVisibleRowsSelected={allVisibleRowsSelected}
            someVisibleRowsSelected={someVisibleRowsSelected}
            onToggleRowSelection={toggleRowSelection}
            onToggleAllRows={toggleAllRows}
            showSummaries={showSummaries}
            renderSummary={renderSummary}
            stickySummaryFooter={stickySummaryFooter}
            tableContainerClassName={tableContainerClassName}
            isEmptyValue={isEmptyValue}
            onResizeStart={beginResize}
          />
        </div>
      </div>

      {renderDrawerPanel ? (
        renderDrawerPanel(drawerPanelProps)
      ) : (
        <DrawerPanel
          drawerRow={drawerRow}
          drawerColumn={drawerColumn}
          drawerCellValue={drawerCellValue}
          getRowLabel={getRowLabel}
          isEditableColumn={isEditableColumn}
          isEmptyValue={isEmptyValue}
        />
      )}
    </DialogPrimitive.Root>
  )
}
