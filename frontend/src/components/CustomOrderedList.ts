import OrderedList from '@tiptap/extension-ordered-list'
import { wrappingInputRule } from '@tiptap/core'

export const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listType: {
        default: null,
        parseHTML: element => {
          if (element.getAttribute('type') === 'a') return 'lower-alpha'
          if (element.getAttribute('type') === 'i') return 'lower-roman'
          if (element.style.listStyleType) return element.style.listStyleType
          return null
        },
        renderHTML: attributes => {
          if (!attributes.listType) return {}
          
          let type = '1'
          let style = 'decimal'
          if (attributes.listType === 'lower-alpha') {
             type = 'a'
             style = 'lower-alpha'
          } else if (attributes.listType === 'lower-roman') {
             type = 'i'
             style = 'lower-roman'
          }
          return { type, style: `list-style-type: ${style}` }
        },
      }
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: /^([iI])\.\s$/,
        type: this.type,
        getAttributes: () => ({ listType: 'lower-roman', start: 1 }),
        joinPredicate: (_, node) => node.type === this.type && node.attrs.listType === 'lower-roman',
      }),
      wrappingInputRule({
        find: /^((?:ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx))\.\s$/i,
        type: this.type,
        getAttributes: () => ({ listType: 'lower-roman', start: 1 }),
        joinPredicate: (_, node) => node.type === this.type && node.attrs.listType === 'lower-roman',
      }),
      wrappingInputRule({
        find: /^([a-hA-Hj-zJ-Z])\.\s$/,
        type: this.type,
        getAttributes: match => ({ listType: 'lower-alpha', start: match[1].toLowerCase().charCodeAt(0) - 96 }),
        joinPredicate: (_, node) => node.type === this.type && node.attrs.listType === 'lower-alpha',
      }),
      wrappingInputRule({
        find: /^(\d+)\.\s$/,
        type: this.type,
        getAttributes: match => ({ listType: null, start: +match[1] }),
        joinPredicate: (_, node) => node.type === this.type && node.attrs.listType === null,
      }),
    ]
  },
})
