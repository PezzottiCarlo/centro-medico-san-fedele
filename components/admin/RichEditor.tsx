'use client'

import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapImage from '@tiptap/extension-image'
import TipTapLink from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2, Heading3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
}

export function RichEditor({ content, onChange }: RichEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage,
      TipTapLink.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-64 p-4 focus:outline-none',
      },
    },
  })

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded hover:bg-gray-100 transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-gray-600'
      )}
    >
      {children}
    </button>
  )

  const addLink = () => {
    const url = window.prompt('URL del link:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'content')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const { url } = await res.json()
      editor.chain().focus().setImage({ src: url }).run()
    } catch {
      alert('Errore durante il caricamento dell\'immagine.')
    }

    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  return (
    <div className="border border-gray-300 rounded-sm overflow-hidden">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Grassetto"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Corsivo"
        >
          <Italic size={16} />
        </ToolbarButton>
        <div className="w-px bg-gray-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Titolo H2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Titolo H3"
        >
          <Heading3 size={16} />
        </ToolbarButton>
        <div className="w-px bg-gray-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista puntata"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerata"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <div className="w-px bg-gray-200 mx-1" />
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Aggiungi link">
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Aggiungi immagine">
          <ImageIcon size={16} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
