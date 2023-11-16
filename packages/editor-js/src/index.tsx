import {createRoot} from 'react-dom/client'
import Editor from './Editor'
import i18n, {t} from '../i18n'
import {I18nextProvider} from 'react-i18next'
import type { EditorConfig } from '@editorjs/editorjs'
import type EditorJS from '@editorjs/editorjs'
import getBaseConfig from './editor.config'
import '../styles/index.scss'

const InitEditor = async ({
  ElementId,
  config,
  updateEditorInstance,
}: {
  ElementId: string,
  config?: EditorConfig,
  updateEditorInstance?: (e: EditorJS) => void,
}) => {
  const element = document.getElementById(ElementId)

  // validate element
  if (!element) {
    console.error('[@ggj/editor-js] InitEditor error: there is no root element to init editor component.')
    return
  }

  const cfg = config || await getBaseConfig()
  // render component
  createRoot(element).render(
    <I18nextProvider i18n={i18n}>
      <Editor config={cfg} updateEditorInstance={updateEditorInstance}/>
    </I18nextProvider>
  )
}

export {
  InitEditor,
  getBaseConfig,
  i18n,
  t,
}
