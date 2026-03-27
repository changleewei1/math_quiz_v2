'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useMemo, useState } from 'react';
import { BASE_EXTENSIONS, RichTextContent } from '@/lib/richContent';
import { RichImage } from './RichImage';

type ToolbarAction = {
  label: string;
  onClick: () => void;
  isActive?: boolean;
};

type RichTextEditorProps = {
  value: RichTextContent;
  onChange: (value: RichTextContent) => void;
  placeholder?: string;
  minHeight?: string;
};

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px'];
const LINE_HEIGHTS = ['1', '1.25', '1.5', '1.75', '2'];
const PARAGRAPH_SPACING = [0, 4, 8, 12, 16];
const INDENT_LEVELS = [0, 1, 2, 3];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '輸入內容...',
  minHeight = '180px',
}: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [...BASE_EXTENSIONS, RichImage],
    content: value || undefined,
    editorProps: {
      attributes: {
        class: 'rich-editor-content',
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!value) {
      editor.commands.clearContent(true);
      return;
    }
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const insertImage = (src: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: 'richImage',
      attrs: { src, wrapMode: 'none', align: 'center', width: 320, height: 220, x: 24, y: 24 },
    }).run();
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    if (!editor) return [];
    return [
      {
        label: '粗體',
        onClick: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive('bold'),
      },
      {
        label: '斜體',
        onClick: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive('italic'),
      },
      {
        label: '底線',
        onClick: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive('underline'),
      },
      {
        label: '清單',
        onClick: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive('bulletList'),
      },
      {
        label: '編號',
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive('orderedList'),
      },
    ];
  }, [editor]);

  if (!editor) return null;

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '上傳失敗');
      insertImage(data.url);
      setShowImageDialog(false);
      setImageUrl('');
    } catch (err) {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`rich-editor-btn ${action.isActive ? 'is-active' : ''}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
        <select
          className="rich-editor-select"
          onChange={(e) =>
            editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run()
          }
          defaultValue=""
        >
          <option value="" disabled>字級</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <select
          className="rich-editor-select"
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 }).run();
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>標題</option>
          <option value="paragraph">內文</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>
        <select
          className="rich-editor-select"
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { lineHeight: e.target.value })
              .updateAttributes('heading', { lineHeight: e.target.value })
              .updateAttributes('listItem', { lineHeight: e.target.value })
              .run()
          }
          defaultValue=""
        >
          <option value="" disabled>行距</option>
          {LINE_HEIGHTS.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <select
          className="rich-editor-select"
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { paragraphSpacing: Number(e.target.value) })
              .updateAttributes('heading', { paragraphSpacing: Number(e.target.value) })
              .updateAttributes('listItem', { paragraphSpacing: Number(e.target.value) })
              .run()
          }
          defaultValue=""
        >
          <option value="" disabled>段距</option>
          {PARAGRAPH_SPACING.map((value) => (
            <option key={value} value={value}>{value}px</option>
          ))}
        </select>
        <select
          className="rich-editor-select"
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { indent: Number(e.target.value) })
              .updateAttributes('heading', { indent: Number(e.target.value) })
              .updateAttributes('listItem', { indent: Number(e.target.value) })
              .run()
          }
          defaultValue=""
        >
          <option value="" disabled>縮排</option>
          {INDENT_LEVELS.map((value) => (
            <option key={value} value={value}>{value}em</option>
          ))}
        </select>
        <button
          type="button"
          className="rich-editor-btn"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          靠左
        </button>
        <button
          type="button"
          className="rich-editor-btn"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          置中
        </button>
        <button
          type="button"
          className="rich-editor-btn"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          靠右
        </button>
        <input
          type="color"
          className="rich-editor-color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="文字顏色"
        />
        <button
          type="button"
          className="rich-editor-btn"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fff3b0' }).run()}
        >
          螢光
        </button>
        <button
          type="button"
          className="rich-editor-btn"
          onClick={() => setShowImageDialog(true)}
        >
          插入圖片
        </button>
      </div>
      <div className="rich-editor-body">
        <EditorContent editor={editor} />
      </div>
      {showImageDialog && (
        <div className="rich-editor-dialog">
          <div className="rich-editor-dialog__panel">
            <h4 className="text-sm font-semibold mb-2">插入圖片</h4>
            <input
              type="text"
              placeholder="貼上圖片 URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rich-editor-input"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rich-editor-btn"
                onClick={() => {
                  if (imageUrl.trim()) insertImage(imageUrl.trim());
                  setShowImageDialog(false);
                  setImageUrl('');
                }}
              >
                插入網址
              </button>
              <label className="rich-editor-btn cursor-pointer">
                {uploading ? '上傳中...' : '上傳圖片'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </label>
              <button
                type="button"
                className="rich-editor-btn"
                onClick={() => setShowImageDialog(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      {editor.isEmpty && (
        <div className="rich-editor-placeholder">{placeholder}</div>
      )}
    </div>
  );
}

