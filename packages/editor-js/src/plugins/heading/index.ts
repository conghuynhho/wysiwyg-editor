import { IconH2, IconH3 } from '@codexteam/icons'
import Header from '@editorjs/header'

export default class CustomHeader extends Header {
  static get toolbox() {
    return [
      {
        icon: IconH2,
        title: 'Heading 2',
        shortcut: 'CMD+SHIFT+2',
        data: {
          level: 2,
        },
      },
      {
        icon: IconH3,
        title: 'Heading 3',
        shortcut: 'CMD+SHIFT+3',
        data: {
          level: 3,
        },
      },
    ]
  }
}
