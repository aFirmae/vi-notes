import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { CustomOrderedList } from './CustomOrderedList'
import { Markdown } from 'tiptap-markdown'
import { useEffect } from 'react'

interface TiptapEditorProps {
    value: string
    onChange: (value: string) => void
    onKeyDown?: (e: any) => void
    onKeyUp?: (e: any) => void
    onPaste?: (e: any) => void
}

export default function TiptapEditor({ value, onChange, onKeyDown, onKeyUp, onPaste }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                orderedList: false,
                heading: { levels: [1, 2, 3] },
            }),
            CustomOrderedList,
            Typography,
            Placeholder.configure({
                showOnlyCurrent: true,
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return `Heading ${node.attrs.level}`
                    }
                    if (node.type.name === 'bulletList' || node.type.name === 'orderedList' || node.type.name === 'listItem') {
                        return ''
                    }
                    return "Start typing..."
                },
                emptyNodeClass: 'is-editor-empty',
            }),
            Markdown,
        ],
        content: value,
        autofocus: 'end',
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as any).markdown.getMarkdown()
            onChange(markdown)
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[520px] px-8 py-8',
            },
            handleKeyDown: (_view, event) => {
                if (onKeyDown) onKeyDown(event as any)
                return false
            },
            handleDOMEvents: {
                keyup: (_view, event) => {
                    if (onKeyUp) onKeyUp(event as any)
                    return false
                }
            },
            handlePaste: (_view, event, _slice) => {
                if (onPaste) onPaste(event as any)
                return false
            },
        },
    })

    useEffect(() => {
        if (editor && value && (editor.storage as any).markdown.getMarkdown() !== value) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    return (
        <div className="w-full text-lg leading-loose">
            <style>{`
                .is-editor-empty::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: oklch(0.6 0 0);
                    pointer-events: none;
                    height: 0;
                }

                p.is-editor-empty:not(:first-child)::before {
                    display: none;
                }
                
                .prose ol { list-style-type: decimal; }
                
                .prose ol ol { list-style-type: lower-alpha; }
                .prose ol[type="a"] ol, .prose ol[style*="lower-alpha"] ol { list-style-type: lower-roman; }
                .prose ol[type="i"] ol, .prose ol[style*="lower-roman"] ol { list-style-type: lower-alpha; }
                
                .prose ol ol { list-style-type: lower-alpha; }
                .prose ol ol ol { list-style-type: lower-roman; }
                .prose ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol ol ol ol ol { list-style-type: lower-roman; }
                .prose ol ol ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol ol ol ol ol ol ol { list-style-type: lower-roman; }
                .prose ol ol ol ol ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol ol ol ol ol ol ol ol ol { list-style-type: lower-roman; }
                .prose ol ol ol ol ol ol ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol ol ol ol ol ol ol ol ol ol ol { list-style-type: lower-roman; }
                
                /* Override: When root is explicit 'lower-alpha' */
                .prose ol[type="a"] ol, .prose ol[style*="lower-alpha"] ol { list-style-type: lower-roman; }
                .prose ol[type="a"] ol ol, .prose ol[style*="lower-alpha"] ol ol { list-style-type: lower-alpha; }
                .prose ol[type="a"] ol ol ol, .prose ol[style*="lower-alpha"] ol ol ol { list-style-type: lower-roman; }
                .prose ol[type="a"] ol ol ol ol, .prose ol[style*="lower-alpha"] ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol[type="a"] ol ol ol ol ol, .prose ol[style*="lower-alpha"] ol ol ol ol ol { list-style-type: lower-roman; }
                .prose ol[type="a"] ol ol ol ol ol ol, .prose ol[style*="lower-alpha"] ol ol ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol[type="a"] ol ol ol ol ol ol ol, .prose ol[style*="lower-alpha"] ol ol ol ol ol ol ol { list-style-type: lower-roman; }
                .prose ol[type="a"] ol ol ol ol ol ol ol ol, .prose ol[style*="lower-alpha"] ol ol ol ol ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol[type="a"] ol ol ol ol ol ol ol ol ol, .prose ol[style*="lower-alpha"] ol ol ol ol ol ol ol ol ol { list-style-type: lower-roman; }

                /* Override: When root is explicit 'lower-roman' */
                .prose ol[type="i"] ol, .prose ol[style*="lower-roman"] ol { list-style-type: lower-alpha; }
                .prose ol[type="i"] ol ol, .prose ol[style*="lower-roman"] ol ol { list-style-type: lower-roman; }
                .prose ol[type="i"] ol ol ol, .prose ol[style*="lower-roman"] ol ol ol { list-style-type: lower-alpha; }
                .prose ol[type="i"] ol ol ol ol, .prose ol[style*="lower-roman"] ol ol ol ol { list-style-type: lower-roman; }
                .prose ol[type="i"] ol ol ol ol ol, .prose ol[style*="lower-roman"] ol ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol[type="i"] ol ol ol ol ol ol, .prose ol[style*="lower-roman"] ol ol ol ol ol ol { list-style-type: lower-roman; }
                .prose ol[type="i"] ol ol ol ol ol ol ol, .prose ol[style*="lower-roman"] ol ol ol ol ol ol ol { list-style-type: lower-alpha; }
                .prose ol[type="i"] ol ol ol ol ol ol ol ol, .prose ol[style*="lower-roman"] ol ol ol ol ol ol ol ol { list-style-type: lower-roman; }
                .prose ol[type="i"] ol ol ol ol ol ol ol ol ol, .prose ol[style*="lower-roman"] ol ol ol ol ol ol ol ol ol { list-style-type: lower-alpha; }
                
                .prose ul { list-style-type: disc; }
                .prose ul ul { list-style-type: circle; }
                .prose ul ul ul { list-style-type: square; }

                .prose li::marker {
                    color: currentColor;
                    font-weight: 600;
                }

                .ProseMirror p { margin-top: 0.5em; margin-bottom: 0.5em; }
                .ProseMirror h1 { margin-top: 1.5em; margin-bottom: 0.5em; font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; outline: none; }
                .ProseMirror h2 { margin-top: 1.25em; margin-bottom: 0.5em; font-size: 1.875rem; line-height: 2.25rem; font-weight: 600; outline: none; }
                .ProseMirror h3 { margin-top: 1em; margin-bottom: 0.5em; font-size: 1.5rem; line-height: 2rem; font-weight: 600; outline: none; }
            `}</style>
            <EditorContent editor={editor} />
        </div>
    )
}
