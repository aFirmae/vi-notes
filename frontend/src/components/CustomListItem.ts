import ListItem from '@tiptap/extension-list-item'

export const CustomListItem = ListItem.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        if (empty && $anchor.parent.content.size === 0) {
          return this.editor.commands.liftListItem(this.name)
        }
        return false
      },
    }
  },
})
