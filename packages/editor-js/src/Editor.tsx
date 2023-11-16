import EditorJS, {EditorConfig} from '@editorjs/editorjs'
import {useEffect} from 'react'

export default function Editor({updateEditorInstance, config}: {
  updateEditorInstance?: (v: EditorJS) => void
  config: EditorConfig,
}) {

  const _editor = new EditorJS(config as EditorConfig)

  // init editor
  useEffect(() => {
    updateEditorInstance && updateEditorInstance(_editor)
  }, [])

  // div to render editor-js
  return <div id={`${config.holder}`}/>
}

export type {
  EditorJS,
}
