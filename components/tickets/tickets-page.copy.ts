const ticketLabel = (count: number) => (count === 1 ? "ticket" : "tickets")

export const ticketsPageCopy = {
  noSelectionBulkAction:
    "No tickets selected. Please select at least one ticket.",
  noSelectionDelete: "No tickets selected to delete.",
  noSelectionExport: "No tickets selected to export.",
  csvExportFailed: "CSV export failed. Please try again.",
  deleteFailed: "Delete failed. Please try again.",
  deleteRetryLabel: "Retry",
  deleteProtectedOnly:
    "Delete failed. Closed tickets are protected from bulk delete.",
  deleteDialogDescription:
    "Closed tickets will be skipped. This action can be undone for deleted tickets.",
  deleteDialogCancelLabel: "Cancel",
  deleteDialogConfirmLabel: "Delete tickets",
  discardDraftTitle: "Discard unsent draft?",
  discardDraftDescription:
    "Your current reply has not been sent yet. If you close the drawer now, the draft will be lost.",
  discardDraftCancelLabel: "Keep editing",
  discardDraftConfirmLabel: "Discard draft",
  dismissBulkFeedbackAriaLabel: "Dismiss bulk action feedback",
  createTicketAriaLabel: "Create new ticket",
  createTicketSrOnly: "New Ticket",
  bulkUpdateNoChanges: (actionLabel: string) =>
    `No changes applied. Selected tickets are already in the target ${actionLabel} state.`,
  bulkUpdateFailed: (actionLabel: string) =>
    `Bulk ${actionLabel} update failed. Please try again.`,
  bulkUpdatePartiallyApplied: (
    changedCount: number,
    totalCount: number,
    actionLabel: string,
    unchangedCount: number
  ) =>
    `Updated ${changedCount}/${totalCount} tickets for ${actionLabel}. ${unchangedCount} already matched target state.`,
  bulkUpdateApplied: (changedCount: number, actionLabel: string) =>
    `Updated ${changedCount} ${ticketLabel(changedCount)} for ${actionLabel}.`,
  csvExportApplied: (count: number) =>
    `Exported ${count} ${ticketLabel(count)} to CSV.`,
  deletePartiallyApplied: (deletedCount: number, skippedCount: number) =>
    `Deleted ${deletedCount} tickets. Skipped ${skippedCount} closed tickets.`,
  deleteApplied: (deletedCount: number) =>
    `Deleted ${deletedCount} ${ticketLabel(deletedCount)}.`,
  deleteDialogTitle: (count: number) =>
    `Delete ${count} ${count === 1 ? "selected ticket" : "selected tickets"}?`,
}
