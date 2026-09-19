"use client"

import { TableSurface } from "@/components/ui/table"

import { useMemo, useRef, useState, type ChangeEvent } from "react"
import Image from "next/image"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  IconDotsVertical,
  IconFile,
  IconFileZip,
  IconLink,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconUpload,
  IconX,
} from "@tabler/icons-react"

import type { CustomerAttachment, CustomerAttachmentType } from "@/lib/customers/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type PersonLike = {
  name: string
  email?: string
  avatarUrl?: string
}

type CustomerAssetsFilesTabProps = {
  items: CustomerAttachment[]
  currentUser: PersonLike
  onCreate: (newFiles: CustomerAttachment[]) => void
  onDelete: (fileId: string) => void
  onEdit: (
    fileId: string,
    patch: Partial<
      Pick<CustomerAttachment, "name" | "url" | "type" | "isLinkAsset">
    >
  ) => void
}

function inferAttachmentTypeFromName(name: string): CustomerAttachmentType {
  const fileName = name.toLowerCase()
  if (fileName.endsWith(".pdf")) return "pdf"
  if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".webp")) return "image"
  if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) return "doc"
  if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx") || fileName.endsWith(".csv")) return "sheet"
  if (fileName.endsWith(".ppt") || fileName.endsWith(".pptx")) return "slide"
  if (fileName.endsWith(".zip")) return "zip"
  return "other"
}

function inferAttachmentTypeFromUrl(url: string): CustomerAttachmentType {
  try {
    const parsed = new URL(url)
    const normalizedPath = parsed.pathname.toLowerCase()
    if (normalizedPath.endsWith(".pdf")) return "pdf"
    if (
      normalizedPath.endsWith(".png") ||
      normalizedPath.endsWith(".jpg") ||
      normalizedPath.endsWith(".jpeg") ||
      normalizedPath.endsWith(".webp")
    ) {
      return "image"
    }
    if (normalizedPath.endsWith(".doc") || normalizedPath.endsWith(".docx")) return "doc"
    if (normalizedPath.endsWith(".xls") || normalizedPath.endsWith(".xlsx") || normalizedPath.endsWith(".csv")) return "sheet"
    if (normalizedPath.endsWith(".ppt") || normalizedPath.endsWith(".pptx")) return "slide"
    if (normalizedPath.endsWith(".zip")) return "zip"
    return "link"
  } catch {
    return "link"
  }
}

function formatDateLabel(isoDate: string) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return "Unknown"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatFileSizeLabel(file: CustomerAttachment) {
  if (file.isLinkAsset || file.sizeMB === 0) return "Link"
  return `${file.sizeMB.toFixed(1)} MB`
}

function getAttachmentTypeColorClass(type: CustomerAttachmentType) {
  if (type === "pdf") return "text-red-500"
  if (type === "doc") return "text-blue-500"
  if (type === "sheet") return "text-emerald-500"
  if (type === "slide") return "text-amber-500"
  if (type === "zip") return "text-orange-500"
  if (type === "link") return "text-sky-500"
  if (type === "image") return "text-fuchsia-500"
  return "text-muted-foreground"
}

function getAttachmentTypeAssetSrc(type: CustomerAttachmentType) {
  if (type === "pdf") return "/file-icons/pdf.svg"
  if (type === "doc") return "/file-icons/docx.svg"
  if (type === "sheet") return "/file-icons/xlsx.svg"
  if (type === "slide") return "/file-icons/ppt.svg"
  return null
}

function AttachmentTypeIcon({ type }: { type: CustomerAttachmentType }) {
  const fileAssetSrc = getAttachmentTypeAssetSrc(type)

  if (fileAssetSrc) {
    return (
      <Image
        src={fileAssetSrc}
        alt={`${type} icon`}
        width={24}
        height={24}
        className="block size-full object-contain"
      />
    )
  }

  if (type === "zip") return <IconFileZip className="size-6" />
  if (type === "link") return <IconLink className="size-6" />
  if (type === "image") return <IconPhoto className="size-6" />

  return <IconFile className="size-6" />
}

function AddCustomerFileModal({
  open,
  onOpenChange,
  currentUser,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: PersonLike
  onCreate: (newFiles: CustomerAttachment[]) => void
}) {
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const canSubmit = link.trim().length > 0 || pendingFiles.length > 0

  const handleClose = () => {
    setTitle("")
    setLink("")
    setPendingFiles([])
    onOpenChange(false)
  }

  const handleUploadFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) return
    setPendingFiles((current) => [...current, ...selectedFiles])
    event.currentTarget.value = ""
  }

  const handleCreate = () => {
    if (!canSubmit) return

    const now = Date.now()
    const trimmedTitle = title.trim()
    const trimmedLink = link.trim()
    const hasLink = trimmedLink.length > 0

    const uploadedAttachments = pendingFiles.map((file, fileIndex) => ({
      id: `manual-upload-${now}-${fileIndex}`,
      name: file.name,
      type: inferAttachmentTypeFromName(file.name),
      sizeMB: Number((file.size / (1024 * 1024)).toFixed(1)),
      url: "#",
    }))

    if (hasLink) {
      const primaryName = trimmedTitle || trimmedLink
      const newFile: CustomerAttachment = {
        id: `manual-link-${now}`,
        name: primaryName,
        type: inferAttachmentTypeFromUrl(trimmedLink),
        sizeMB: 0,
        url: trimmedLink,
        addedBy: {
          name: currentUser.name,
          email: currentUser.email ?? "unknown@graycsm.example",
          avatarUrl: currentUser.avatarUrl,
        },
        addedAt: new Date().toISOString(),
        source: { kind: "manual" },
        isLinkAsset: true,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      }
      onCreate([newFile])
      handleClose()
      return
    }

    const newFiles: CustomerAttachment[] = uploadedAttachments.map((file, fileIndex) => ({
      ...file,
      id: `${file.id}-asset`,
      name: fileIndex === 0 && trimmedTitle ? trimmedTitle : file.name,
      addedBy: {
        name: currentUser.name,
        email: currentUser.email ?? "unknown@graycsm.example",
        avatarUrl: currentUser.avatarUrl,
      },
      addedAt: new Date().toISOString(),
      source: { kind: "manual" },
      isLinkAsset: false,
    }))

    onCreate(newFiles)
    handleClose()
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[70] bg-black/32 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-[71] flex w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] border border-border/70 bg-background/96 shadow-2xl outline-none transition duration-200 data-ending-style:translate-y-[calc(-50%+1rem)] data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+1rem)] data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 px-6 py-5">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                Add file
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                Add a link asset or upload files for this customer.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl"
                />
              }
              onClick={handleClose}
            >
              <IconX className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="space-y-4 px-6 py-5">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Asset title"
              className="h-10 rounded-xl"
            />
            <Input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="Paste a link (Drive, Figma, etc.)"
              className="h-10 rounded-xl"
            />

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleUploadFiles}
            />

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Uploaded files</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className="size-4" />
                  Upload
                </Button>
              </div>

              {pendingFiles.length > 0 ? (
                <div className="space-y-2">
                  {pendingFiles.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center justify-between rounded-lg border border-border/70 bg-background px-3 py-2 text-sm"
                    >
                      <span className="truncate text-foreground">{file.name}</span>
                      <span className="text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No files selected yet.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/70 px-6 py-4">
            <Button type="button" variant="ghost" className="rounded-xl" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" className="rounded-xl" onClick={handleCreate} disabled={!canSubmit}>
              Create file
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function EditCustomerFileModal({
  open,
  file,
  onOpenChange,
  onSave,
}: {
  open: boolean
  file: CustomerAttachment | null
  onOpenChange: (open: boolean) => void
  onSave: (
    fileId: string,
    patch: Partial<
      Pick<CustomerAttachment, "name" | "url" | "type" | "isLinkAsset">
    >
  ) => void
}) {
  const [nameDraft, setNameDraft] = useState("")
  const [urlDraft, setUrlDraft] = useState("")

  const initialUrl =
    file && file.url !== "#" && file.url.trim().length > 0 ? file.url : ""

  const resetDrafts = () => {
    setNameDraft(file?.name ?? "")
    setUrlDraft(initialUrl)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSave = () => {
    if (!file) return

    const trimmedName = nameDraft.trim()
    if (!trimmedName) return
    const trimmedUrl = urlDraft.trim()

    const nextType =
      trimmedUrl.length > 0
        ? inferAttachmentTypeFromUrl(trimmedUrl)
        : inferAttachmentTypeFromName(trimmedName)

    onSave(file.id, {
      name: trimmedName,
      url: trimmedUrl.length > 0 ? trimmedUrl : "#",
      type: nextType,
      isLinkAsset: trimmedUrl.length > 0,
    })
    handleClose()
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && file) {
          resetDrafts()
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[70] bg-black/32 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-[71] flex w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] border border-border/70 bg-background/96 shadow-2xl outline-none transition duration-200 data-ending-style:translate-y-[calc(-50%+1rem)] data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+1rem)] data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 px-6 py-5">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                Edit file
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                Update file name and optional link.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl"
                />
              }
              onClick={handleClose}
            >
              <IconX className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="space-y-4 px-6 py-5">
            <Input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              placeholder="File name"
              className="h-10 rounded-xl"
            />
            <Input
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              placeholder="Optional link URL"
              className="h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/70 px-6 py-4">
            <Button type="button" variant="ghost" className="rounded-xl" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              onClick={handleSave}
              disabled={nameDraft.trim().length === 0}
            >
              Save changes
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function CustomerAssetsFilesTab({
  items,
  currentUser,
  onCreate,
  onDelete,
  onEdit,
}: CustomerAssetsFilesTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)

  const sortedFiles = useMemo(
    () =>
      [...items].sort((fileA, fileB) => {
        return new Date(fileB.addedAt).getTime() - new Date(fileA.addedAt).getTime()
      }),
    [items]
  )

  const recentFiles = useMemo(() => sortedFiles.slice(0, 6), [sortedFiles])

  const filteredFiles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (normalizedQuery.length === 0) return sortedFiles

    return sortedFiles.filter((file) => file.name.toLowerCase().includes(normalizedQuery))
  }, [searchQuery, sortedFiles])

  const allFilteredSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((file) => selectedFileIds.includes(file.id))

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedFileIds([])
      return
    }
    setSelectedFileIds(filteredFiles.map((file) => file.id))
  }

  const toggleSelectRow = (fileId: string, checked: boolean) => {
    setSelectedFileIds((currentIds) => {
      if (checked) {
        return currentIds.includes(fileId) ? currentIds : [...currentIds, fileId]
      }
      return currentIds.filter((id) => id !== fileId)
    })
  }

  const editingFile = useMemo(
    () => sortedFiles.find((file) => file.id === editingFileId) ?? null,
    [editingFileId, sortedFiles]
  )

  const openEditModal = (fileId: string) => {
    setEditingFileId(fileId)
    setIsEditModalOpen(true)
  }

  return (
    <>
      <div className="scrollbar-hidden h-full overflow-y-auto px-6 py-6">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">Recent Files</h2>
              <Badge
                variant="outline"
                className="min-w-6 justify-center rounded-full border-transparent bg-primary/10 px-2 text-primary"
              >
                {recentFiles.length}
              </Badge>
            </div>

            {recentFiles.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {recentFiles.map((file) => {
                  const fileIconColorClass = getAttachmentTypeColorClass(file.type)
                  return (
                    <article
                      key={file.id}
                      className="flex items-start justify-between rounded-2xl border border-border/70 bg-background px-4 py-3"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className={cn("flex size-6 shrink-0 items-center justify-center self-center", fileIconColorClass)}>
                          <AttachmentTypeIcon type={file.type} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSizeLabel(file)}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg text-muted-foreground"
                              aria-label={`Open actions for ${file.name}`}
                            />
                          }
                        >
                          <IconDotsVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(file.id)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(file.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                No files available yet.
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">All files</h2>
              <div className="flex w-full max-w-sm items-center gap-2">
                <div className="relative flex-1">
                  <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search files"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-9 rounded-xl bg-transparent pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <IconPlus className="size-4" />
                  Add file
                </Button>
              </div>
            </div>

            <TableSurface>
              <Table containerClassName="max-h-[52vh]">
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-10 px-3">
                      <Checkbox
                        aria-label="Select all files"
                        checked={allFilteredSelected}
                        onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                      />
                    </TableHead>
                    <TableHead className="px-2">Name</TableHead>
                    <TableHead className="px-2">Added by</TableHead>
                    <TableHead className="px-2">Added date</TableHead>
                    <TableHead className="w-10 px-2" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => {
                      const fileIconColorClass = getAttachmentTypeColorClass(file.type)
                      return (
                        <TableRow key={file.id}>
                          <TableCell className="px-3 py-3.5">
                            <Checkbox
                              aria-label={`Select file ${file.name}`}
                              checked={selectedFileIds.includes(file.id)}
                              onCheckedChange={(checked) => toggleSelectRow(file.id, checked === true)}
                            />
                          </TableCell>
                          <TableCell className="px-2 py-3.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className={cn(
                                  "flex size-6 shrink-0 items-center justify-center self-center",
                                  fileIconColorClass
                                )}
                              >
                                <AttachmentTypeIcon type={file.type} />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSizeLabel(file)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 py-3.5 text-sm text-muted-foreground">
                            {file.addedBy.name}
                          </TableCell>
                          <TableCell className="px-2 py-3.5 text-sm text-muted-foreground">
                            {formatDateLabel(file.addedAt)}
                          </TableCell>
                          <TableCell className="px-2 py-3.5">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-lg text-muted-foreground"
                                    aria-label={`Open actions for ${file.name}`}
                                  />
                                }
                              >
                                <IconDotsVertical className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditModal(file.id)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(file.id)}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        No file matches your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableSurface>
          </section>
        </div>
      </div>

      <AddCustomerFileModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        currentUser={currentUser}
        onCreate={onCreate}
      />
      <EditCustomerFileModal
        open={isEditModalOpen}
        file={editingFile}
        onOpenChange={(nextOpen) => {
          setIsEditModalOpen(nextOpen)
          if (!nextOpen) setEditingFileId(null)
        }}
        onSave={onEdit}
      />
    </>
  )
}
