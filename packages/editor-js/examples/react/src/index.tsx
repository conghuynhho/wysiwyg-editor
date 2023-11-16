// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../dist/lib-editor-js.css'
import ImageTool from '../../../dist/src/plugins/image-tool'
const ImT = ImageTool()
//@ts-ignore
import {InitEditor, getBaseConfig, i18n} from '../../../dist'

//@ts-ignore
import Undo from './undo.js'

const editors: { [key: string]: any } = {}
const App = () => {
  //@ts-ignore
  useEffect(() => {
    i18n.changeLanguage('ja').then(async () => {
      const cf = await getBaseConfig('ja')
      cf.tools.image.class = ImT
      cf.tools.image.config.validate.limitUpload = 30
      cf.tools.image.config.validate.limit = 350
      cf.onReady = () => {
        const undoConfig = {
          editor: editors[0],
          config: {
            shortcuts: {
              undo: ['CMD+Z'],
              redo: ['CMD+SHIFT+Z', 'CMD+Y'],
            },
            debounceTimer: 100,
          },
        }
        new Undo(undoConfig)
      }
      InitEditor({
        ElementId: 'ElementId',
        currentLang: 'th',
        config: cf,
        updateEditorInstance(_editor: any) {
          editors[0] = _editor
        }})
    })
  }, [])
  return <>
    <h1 style={{textAlign: 'center'}}>Welcome to Editor JS</h1>
    <div id="ElementId">ElementId</div>
  </>
}

createRoot(document.getElementById('app') as Element).render(<App />)
