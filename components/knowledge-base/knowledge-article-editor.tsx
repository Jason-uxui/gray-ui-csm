"use client"

import * as React from "react"
import {
  IconBlockquote,
  IconBold,
  IconChevronDown,
  IconClearFormatting,
  IconCode,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconMinus,
  IconPilcrow,
  IconUnderline,
} from "@tabler/icons-react"
import {
  EditorContent,
  useEditor,
  type Editor,
  type JSONContent,
} from "@tiptap/react"
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { normalizeSafeArticleHref } from "@/lib/knowledge-base/content"
import { cn } from "@/lib/utils"

const articleHeadingLevels = [2, 3, 4, 5, 6] as const

type ArticleHeadingLevel = (typeof articleHeadingLevels)[number]

const articleHeadingLevelOptions: Array<{
  level: ArticleHeadingLevel
  label: string
}> = [
  { level: 2, label: knowledgeBasePageCopy.articleToolbarHeadingTwoLabel },
  { level: 3, label: knowledgeBasePageCopy.articleToolbarHeadingThreeLabel },
  { level: 4, label: knowledgeBasePageCopy.articleToolbarHeadingFourLabel },
  { level: 5, label: knowledgeBasePageCopy.articleToolbarHeadingFiveLabel },
  { level: 6, label: knowledgeBasePageCopy.articleToolbarHeadingSixLabel },
]

const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [...articleHeadingLevels],
    },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),
]

function getActiveHeadingLevel(editor: Editor): ArticleHeadingLevel | null {
  for (const level of articleHeadingLevels) {
    if (editor.isActive("heading", { level })) {
      return level
    }
  }

  return null
}

function ToolbarButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "size-9 rounded-xl text-muted-foreground hover:text-foreground",
        active && "bg-muted text-foreground"
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function ArticleLinkDialog({
  open,
  initialUrl,
  onOpenChange,
  onApply,
  onRemove,
}: {
  open: boolean
  initialUrl: string
  onOpenChange: (open: boolean) => void
  onApply: (url: string) => void
  onRemove: () => void
}) {
  const [urlDraft, setUrlDraft] = React.useState(initialUrl)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setUrlDraft(initialUrl)
    setErrorMessage(null)
  }, [initialUrl, open])

  const handleApply = () => {
    const trimmedUrl = urlDraft.trim()
    if (!trimmedUrl) {
      setErrorMessage(knowledgeBasePageCopy.articleLinkInvalidUrlLabel)
      return
    }

    const safeHref = normalizeSafeArticleHref(trimmedUrl)
    if (!safeHref) {
      setErrorMessage(knowledgeBasePageCopy.articleLinkInvalidUrlLabel)
      return
    }

    onApply(safeHref)
    onOpenChange(false)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[70] bg-black/32 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity] data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm motion-reduce:transition-none" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-[71] flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] border border-border/70 bg-background/96 p-0 text-popover-foreground shadow-2xl transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] outline-none data-ending-style:translate-y-[calc(-50%+1rem)] data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+1rem)] data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xl motion-reduce:transition-none">
          <div className="px-6 pt-6 pb-4">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              {knowledgeBasePageCopy.articleLinkDialogTitle}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              {knowledgeBasePageCopy.articleLinkDialogDescription}
            </DialogPrimitive.Description>
          </div>

          <div className="space-y-2 px-6 pb-5">
            <Label htmlFor="article-link-url">
              {knowledgeBasePageCopy.articleLinkPromptLabel}
            </Label>
            <Input
              id="article-link-url"
              value={urlDraft}
              onChange={(event) => {
                setUrlDraft(event.target.value)
                setErrorMessage(null)
              }}
              placeholder={knowledgeBasePageCopy.articleLinkDialogPlaceholder}
              className="h-10 rounded-xl"
            />
            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border/70 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={() => {
                onRemove()
                onOpenChange(false)
              }}
            >
              {knowledgeBasePageCopy.articleLinkDialogRemoveLabel}
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                {knowledgeBasePageCopy.articleCancelLabel}
              </Button>
              <Button
                type="button"
                className="rounded-xl"
                onClick={handleApply}
              >
                {knowledgeBasePageCopy.articleLinkDialogSaveLabel}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

const editorMenuSurfaceClassName =
  "flex flex-wrap items-center gap-0.5 rounded-xl border border-border/70 bg-background p-1 shadow-sm"

const articleEditorProseClassName =
  "min-h-[360px] text-base leading-8 text-foreground/85 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:rounded-xl [&_.ProseMirror_blockquote]:bg-card [&_.ProseMirror_blockquote]:px-5 [&_.ProseMirror_blockquote]:py-4 [&_.ProseMirror_blockquote]:not-italic [&_.ProseMirror_blockquote]:text-base [&_.ProseMirror_blockquote]:leading-8 [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_blockquote_p]:my-0 [&_.ProseMirror_blockquote_p]:border-l-2 [&_.ProseMirror_blockquote_p]:border-border [&_.ProseMirror_blockquote_p]:pl-5 [&_.ProseMirror_blockquote_p]:font-medium [&_.ProseMirror_blockquote_p]:tracking-tight [&_.ProseMirror_blockquote_p]:text-foreground/80 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-sm [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:leading-tight [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:tracking-tight [&_.ProseMirror_h3]:mt-5 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:leading-tight [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:tracking-tight [&_.ProseMirror_h4]:mt-4 [&_.ProseMirror_h4]:mb-2 [&_.ProseMirror_h4]:text-lg [&_.ProseMirror_h4]:leading-tight [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_h4]:tracking-tight [&_.ProseMirror_h5]:mt-4 [&_.ProseMirror_h5]:mb-2 [&_.ProseMirror_h5]:text-base [&_.ProseMirror_h5]:leading-tight [&_.ProseMirror_h5]:font-semibold [&_.ProseMirror_h5]:tracking-tight [&_.ProseMirror_h6]:mt-3 [&_.ProseMirror_h6]:mb-2 [&_.ProseMirror_h6]:text-sm [&_.ProseMirror_h6]:leading-tight [&_.ProseMirror_h6]:font-semibold [&_.ProseMirror_h6]:tracking-tight [&_.ProseMirror_hr]:my-6 [&_.ProseMirror_hr]:border-border [&_.ProseMirror_ol]:my-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:my-3 [&_.ProseMirror_ul]:my-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6"

function KnowledgeArticleInlineToolbar({
  editor,
  onOpenLinkDialog,
}: {
  editor: Editor
  onOpenLinkDialog: () => void
}) {
  return (
    <>
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarBoldLabel}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <IconBold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarItalicLabel}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarUnderlineLabel}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <IconUnderline className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarCodeLabel}
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <IconCode className="size-4" />
      </ToolbarButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarLinkLabel}
        active={editor.isActive("link")}
        onClick={onOpenLinkDialog}
      >
        <IconLink className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarClearFormatLabel}
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        <IconClearFormatting className="size-4" />
      </ToolbarButton>
    </>
  )
}

function KnowledgeArticleBlockToolbar({ editor }: { editor: Editor }) {
  const activeHeadingLevel = getActiveHeadingLevel(editor)

  return (
    <>
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarParagraphLabel}
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <IconPilcrow className="size-4" />
      </ToolbarButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={knowledgeBasePageCopy.articleToolbarHeadingMenuLabel}
              className={cn(
                "h-9 gap-1 rounded-xl px-2 text-sm font-medium",
                activeHeadingLevel && "bg-muted text-foreground"
              )}
            />
          }
        >
          {activeHeadingLevel ? `H${activeHeadingLevel}` : "H"}
          <IconChevronDown className="size-3.5 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuGroup>
            {articleHeadingLevelOptions.map((option) => (
              <DropdownMenuItem
                key={option.level}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({ level: option.level })
                    .run()
                }
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarBulletListLabel}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <IconList className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarNumberedListLabel}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconListNumbers className="size-4" />
      </ToolbarButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarBlockquoteLabel}
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <IconBlockquote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={knowledgeBasePageCopy.articleToolbarDividerLabel}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <IconMinus className="size-4" />
      </ToolbarButton>
    </>
  )
}

export function KnowledgeArticleEditor({
  articleId,
  value,
  onChange,
}: {
  articleId: string
  value: JSONContent
  onChange: (value: JSONContent) => void
}) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false)
  const [linkDraft, setLinkDraft] = React.useState("")

  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[320px] outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON())
    },
  })

  const openLinkDialog = React.useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href
    setLinkDraft(typeof previousUrl === "string" ? previousUrl : "")
    setIsLinkDialogOpen(true)
  }, [editor])

  const applyLink = React.useCallback(
    (url: string) => {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run()
    },
    [editor]
  )

  const removeLink = React.useCallback(() => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run()
  }, [editor])

  const syncedArticleIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!editor || syncedArticleIdRef.current === articleId) return

    const isInitialMount = syncedArticleIdRef.current === null
    syncedArticleIdRef.current = articleId

    if (!isInitialMount) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [articleId, editor, value])

  return (
    <div className={articleEditorProseClassName}>
      {editor ? (
        <>
          <BubbleMenu
            editor={editor}
            role="toolbar"
            aria-label={knowledgeBasePageCopy.articleToolbarAriaLabel}
            className={editorMenuSurfaceClassName}
          >
            <KnowledgeArticleInlineToolbar
              editor={editor}
              onOpenLinkDialog={openLinkDialog}
            />
          </BubbleMenu>
          <FloatingMenu editor={editor} className={editorMenuSurfaceClassName}>
            <KnowledgeArticleBlockToolbar editor={editor} />
          </FloatingMenu>
        </>
      ) : null}
      <EditorContent editor={editor} />
      <ArticleLinkDialog
        open={isLinkDialogOpen}
        initialUrl={linkDraft}
        onOpenChange={setIsLinkDialogOpen}
        onApply={applyLink}
        onRemove={removeLink}
      />
    </div>
  )
}
