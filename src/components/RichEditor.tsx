"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BaseImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

// Extend Image to support style attribute for resizing
const Image = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});
import { useCallback, useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import DiffView from "./DiffView";

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onFixWriting?: () => Promise<string | null>;
  isFixing?: boolean;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
}

export default function RichEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  onFixWriting,
  isFixing,
  onAnalyze,
  isAnalyzing,
}: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [diffState, setDiffState] = useState<{
    before: string;
    after: string;
  } | null>(null);
  const [imageSelected, setImageSelected] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image/")) {
            event.preventDefault();
            const file = items[i].getAsFile();
            if (!file) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src })
                )
              );
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (let i = 0; i < files.length; i++) {
          if (files[i].type.startsWith("image/")) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              if (pos) {
                view.dispatch(
                  view.state.tr.insert(
                    pos.pos,
                    view.state.schema.nodes.image.create({ src })
                  )
                );
              }
            };
            reader.readAsDataURL(files[i]);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Track image selection via editor events
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      setImageSelected(editor.isActive("image"));
    };
    editor.on("selectionUpdate", handler);
    editor.on("transaction", handler);
    return () => {
      editor.off("selectionUpdate", handler);
      editor.off("transaction", handler);
    };
  }, [editor]);

  const insertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [editor]
  );

  async function handleAiFix() {
    if (!onFixWriting || !editor) return;
    const beforeHtml = editor.getHTML();
    const fixedHtml = await onFixWriting();
    if (fixedHtml && fixedHtml.trim()) {
      setDiffState({ before: beforeHtml, after: fixedHtml });
    } else if (fixedHtml === null) {
      // Error already shown by the handler
    } else {
      alert("AI returned empty response — try again");
    }
  }

  function handleAcceptDiff() {
    if (!diffState || !editor) return;
    editor.commands.setContent(diffState.after);
    onChange(diffState.after);
    setDiffState(null);
  }

  function handleRejectDiff() {
    setDiffState(null);
  }

  function setImageSize(width: string) {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .updateAttributes("image", {
        style: width === "full" ? "width:100%" : `width:${width}px`,
      })
      .run();
    // Ensure parent state gets the updated HTML (updateAttributes may not trigger onUpdate)
    onChange(editor.getHTML());
  }

  function removeSelectedImage() {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
  }

  if (!editor) return null;

  return (
    <>
      <div className="border-2 border-black wobbly-border hard-shadow bg-white/5 overflow-hidden">
        {/* Main Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b-2 border-black bg-white/5">
          <ToolbarButton
            icon="lucide:bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            icon="lucide:italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            icon="lucide:underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          />
          <ToolbarButton
            icon="lucide:strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          />

          <Divider />

          <ToolbarButton
            icon="lucide:heading-1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          />
          <ToolbarButton
            icon="lucide:heading-2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          />
          <ToolbarButton
            icon="lucide:heading-3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          />

          <Divider />

          <ToolbarButton
            icon="lucide:list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          />
          <ToolbarButton
            icon="lucide:list-ordered"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          />

          <Divider />

          <ToolbarButton
            icon="lucide:text-quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          />
          <ToolbarButton
            icon="lucide:code-2"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          />
          <ToolbarButton
            icon="lucide:minus"
            active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          />

          <Divider />

          <ToolbarButton
            icon="lucide:image-plus"
            active={false}
            onClick={insertImage}
            title="Insert Image"
          />

          <div className="ml-auto flex gap-0.5 items-center">
            <ToolbarButton
              icon="lucide:undo-2"
              active={false}
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo (Ctrl+Z)"
              disabled={!editor.can().undo()}
            />
            <ToolbarButton
              icon="lucide:redo-2"
              active={false}
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo (Ctrl+Y)"
              disabled={!editor.can().redo()}
            />

            {onFixWriting && (
              <>
                <Divider />
                <button
                  type="button"
                  onClick={handleAiFix}
                  disabled={isFixing}
                  className="flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2.5 py-1 rounded text-xs hover:bg-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Fix spelling & grammar (shows before/after)"
                >
                  <Icon
                    icon="lucide:spell-check"
                    className={isFixing ? "animate-spin" : ""}
                    width={14}
                  />
                  {isFixing ? "Fixing..." : "Fix Spelling"}
                </button>
              </>
            )}
            {onAnalyze && (
              <button
                type="button"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2.5 py-1 rounded text-xs hover:bg-teal-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-1"
                title="Extract insights, actions, and tags with AI"
              >
                <Icon
                  icon="lucide:sparkles"
                  className={isAnalyzing ? "animate-spin" : ""}
                  width={14}
                />
                {isAnalyzing ? "Analyzing..." : "Insight Builder"}
              </button>
            )}
          </div>
        </div>

        {/* Image controls bar — only when an image is clicked */}
        {imageSelected && (
          <div className="flex items-center gap-1 px-3 py-1.5 border-b-2 border-black bg-yellow-400/10">
            <Icon icon="lucide:image" className="text-yellow-400 mr-1" width={14} />
            <span className="text-xs text-white/50 mr-2">Resize:</span>
            {[
              { label: "Small", w: "150" },
              { label: "Medium", w: "300" },
              { label: "Large", w: "500" },
              { label: "Full width", w: "full" },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setImageSize(s.w)}
                className="px-2.5 py-0.5 text-xs font-bold bg-white/10 text-white hover:bg-yellow-400 hover:text-black border border-black transition-all wobbly-border"
              >
                {s.label}
              </button>
            ))}
            <button
              type="button"
              onClick={removeSelectedImage}
              className="px-2.5 py-0.5 text-xs font-bold bg-red-400/20 text-red-400 hover:bg-red-400 hover:text-black border border-black transition-all ml-2 wobbly-border-md"
              title="Delete image"
            >
              <Icon icon="lucide:trash-2" width={12} className="inline mr-1" />
              Remove
            </button>
          </div>
        )}

        {/* Editor content */}
        <EditorContent editor={editor} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Diff overlay */}
      {diffState && (
        <DiffView
          before={diffState.before}
          after={diffState.after}
          onAccept={handleAcceptDiff}
          onReject={handleRejectDiff}
        />
      )}
    </>
  );
}

function ToolbarButton({
  icon,
  active,
  onClick,
  title,
  disabled,
}: {
  icon: string;
  active: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-all ${
        active
          ? "bg-yellow-400/20 text-yellow-400"
          : "text-white/50 hover:text-white hover:bg-white/10"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      <Icon icon={icon} width={16} />
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-white/10 mx-1" />;
}
