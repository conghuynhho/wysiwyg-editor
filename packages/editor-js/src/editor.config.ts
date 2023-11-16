import Embed from '@editorjs/embed'
import InlineCode from '@editorjs/inline-code'
import Delimiter from '@editorjs/delimiter'
import CustomHeader from './plugins/heading'
import List from '@editorjs/list'
import Header from '@editorjs/header'
import Paragraph from '@editorjs/paragraph'
import Table from '@editorjs/table'
import ColorPlugin from './plugins/text-color-tool/src'
import {UnderlineInlineTool} from 'editorjs-inline-tool'
import AlignmentBlockTune from './plugins/alignment-tool'
import type {EditorConfig} from '@editorjs/editorjs'
import i18n, {t} from '../i18n'
import ImageTool from './plugins/image-tool'

const ImgTool = ImageTool()

export default async function getBaseConfig(lang?: 'en'|'vi'|'ja'|'th'|'ch'|'tw') {
  // change language if available
  lang && await i18n.changeLanguage(lang)

  return {
    holder: 'codex-editor@id-' + Math.random(),
    autofocus: false,
    logLevel: 'ERROR',
    placeholder: 'Enter somethings',
    defaultBlock: 'paragraph', // This Tool will be used as default
    inlineToolbar: ['bold', 'italic', 'underline', 'link', 'inlineCode', 'Color', 'Marker'],
    tools: {
      image: {
        class: ImgTool as unknown,
        // tunes: ['textAlign'],
        config: {
          validate: {
            accept: 'image/bmp,image/jpeg,image/x-png,image/png',
            maxFileSize: 10, // MB
            limit: 20
          }
        }
      },
      embed: {
        class: Embed,
        inlineToolbar: true,
        config: {
          services: {
            youtube: true
          }
        }
      },
      inlineCode: {
        class: InlineCode,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+M',
      },
      delimiter: Delimiter,
      Marker: {
        class: ColorPlugin,
        config: {
          customPicker: true,
          defaultColor: '#FFBF00',
          colorCollections: ['#37352F', '#ffffff', '#787774', '#9F6B53', '#D9730F', '#CB912F', '#458262', '#347EA9', '#9065B0', '#C14D8A', '#D44C47'],
          type: 'marker',
        },
        shortcut: 'CMD+SHIFT+M',
      },
      header: {
        class: CustomHeader as Header,
        inlineToolbar: true,
        tunes: ['textAlign'],
        // shortcut: 'CMD+SHIFT+H',
        config: {
          levels: [2, 3],
        }
      },
      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        },
      },
      paragraph: {
        class: Paragraph,
        // tunes: [''],
        inlineToolbar: true,
        config: {
          placeholder: '', // テキストを入力またはマークダウンを記述
          inlineToolbar: true,
          preserveBlank: true,
        }
      },
      underline: UnderlineInlineTool,
      table: {
        class: Table,
        tunes: [],
      },
      Color: {
        class: ColorPlugin,
        config: {
          customPicker: true,
          colorCollections: ['#37352F', '#ffffff', '#787774', '#9F6B53', '#D9730F', '#CB912F', '#458262', '#347EA9', '#9065B0', '#C14D8A', '#D44C47'],
          defaultColor: '#000000',
          type: 'text',
        }
      },
      textAlign: {
        class: AlignmentBlockTune,
        config: {
          default: 'left',
          blocks: {
            image: 'left'
          }
        },
      },
    },
    blockTool: {
      class: Paragraph,
      tunes: ['header']
    },
    i18n: {
      messages: {
        ui: {
          'blockTunes': {
            'toggler': {
              'Click to tune': t('ui-toggler-click_to_tune'),
              'or drag to move': t('ui-toggler-or_drag_to_move')
            },
          },
          'inlineToolbar': {
            'converter': {
              'Convert to': t('convert_to')
            }
          },
          'toolbar': {
            'toolbox': {
              'Filter': t('ui-toolbar-filter'),
              'Add': t('ui-toolbar-add'),
              'Nothing found': t('ui-toolbar-nothing-found'),

            }
          }
        },
        toolNames: {
          'Text': t('text'),
          'Heading': t('heading'),
          'Delimiter': t('delimiter'),
          'Image': t('image'),
          'List': t('list'),
          'Table': t('table'),
          'Bold': t('bold'),
          'Italic': t('italic'),
          'Underline': t('underline'),
          'Link': t('link'),
          'InlineCode': t('inline_code'),
          'Color': t('color'),
          'Marker': t('marker'),
          // "ChangeCase": t('change_case'),
        },
        tools: {
          'warning': {
            'Title': t('tools-warning-title'),
            'Message': t('tools-warning-message'),
          },
          'list': {
            'Ordered': t('tools-list-unordered'),
            'Unordered': t('tools-list-ordered'),
          },
          'image': {
            'Select an Image': t('tools-image-select'),
            'With border': t('tools-image-with-border'),
            'Stretch image': t('tools-image-stretch'),
            'With background': t('tools-image-with-background'),
            'Over limit': t('tools-image-over-limit'),
          },
          'table': {
            'Add row above': t('tools-table-add_row_above'),
            'Add row below': t('tools-table-add_row_below'),
            'Delete row': t('tools-table-delete_row'),
            'Add column to left': t('tools-table-add_column_to_left'),
            'Add column to right': t('tools-table-add_column_to_right'),
            'Delete column': t('tools-table-delete_column'),
            'With headings': t('tools-table-tune-with_heading'),
            'Without headings': t('tools-table-tune-without_heading'),
          },
          'link': {
            'Add a link': t('tools-link-placeholder')
          },
          'stub': {
            'The block can not be displayed correctly.': t('tools-stub-warning')
          },
        },
        blockTunes: {
          'delete': {
            'Delete': t('blocktune-delete')
          },
          'moveUp': {
            'Move up': t('blocktune-moveup')
          },
          'moveDown': {
            'Move down': t('blocktune-movedown')
          },
          'textAlign': {
            'left': t('blocktune-text-align-left'),
            'center': t('blocktune-text-align-center'),
            'right': t('blocktune-text-align-right'),
          },
          'image': {
            'Select an Image': t('tools-image-select'),
            'With border': t('tools-image-with-border'),
            'Stretch image': t('tools-image-stretch'),
            'With background': t('tools-image-with-background'),
          },
        },
      },
    },
  } as EditorConfig
}
