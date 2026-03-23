import { Markdown } from 'tiptap-markdown'

const md = Markdown.configure({ html: true })
// We can't run it node-side without proper build because tiptap uses prosemirror things.
