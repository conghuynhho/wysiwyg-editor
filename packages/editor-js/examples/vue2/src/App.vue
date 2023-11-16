<template>
  <div>
    <button @click="onGenHTML">GEN HTML</button>
    <button @click="exportBlock">EXPORT BLOCK</button>
    <button @click="showListBlob">SHOW LIST BLOB</button>
    <button @click="log">log</button>
    <span style="position: fixed; bottom: 0; right: 0;">{{ percent }}</span>
    <span style="position: fixed; bottom: 20px; right: 0;">{{ imgNum }}</span>
    <div :id="id"></div>
    <div class="block-viewer" v-html="html.join('')" v-if="html"></div>
  </div>
</template>

<script>
import {InitEditor, getBaseConfig} from '../../../dist'
import ImageTool from '../../../dist/src/plugins/image-tool'
import {edjsParser, genHtml} from '../../../dist/src/utils/parsers'
import '../../../dist/lib-editor-js.css'
import countCharacter from '../../../dist/src/utils/countCharacter'
const ImT = ImageTool()
export default {
  name: 'App',
  components: {},
  data() {
    return {
      id: 'ElementId-xxx',
      html: '',
      editor: null,
      percent: 0,
      imgNum: 0,
    }
  },
  async mounted() {
    const cf = await getBaseConfig('th')
     cf.tools.image.class = ImT
     cf.tools.image.config.validate.limitUpload = 350
     cf.tools.image.config.validate.limit = 350
     cf.tools.image.config.uploadImgError = (type) => {
       const types = {
         1: 'TYPE_ERROR',
         2: 'SIZE_ERROR',
         3: 'OVER_LIMIT',
         4: 'OVER_LIMIT_UPLOAD',
       }
       alert(types[type])

     }

    InitEditor({
      ElementId: this.id, config: {
        ...cf,
        onChange: () => {
          this.editor.save().then(data => {
            data && data.blocks &&this.$set(this, 'percent', `Number of characters: ${countCharacter(data.blocks)}`)
            data && data.blocks &&this.$set(this, 'imgNum', `Number of image: ${data.blocks.filter(i => i.type === 'image' && ((i.data || {}).data || {}).imgSrc).length}`)
          })
        },
      },
      updateEditorInstance: (editor) => this.editor = editor
    })
  },
  methods: {
    log() {
      this.editor.save().then(data => {
        data.blocks.filter(i => i.type === 'image' && ((i.data || {}).data || {}).imgSrc).forEach((i, idx) => console.log(idx, ((i.data || {}).data || {}).imgSrc))
      })
    },
    async onGenHTML() {
      console.log(genHtml({data: await this.editor.save()}), await this.editor.save())
      this.html = edjsParser.parse(await this.editor.save())
      this.$nextTick(ImT.startLazyModeReview)
    },
    exportBlock() {
      this.editor.save().then(data => console.log(JSON.stringify(data)))
    },
    showListBlob() {
      console.log(ImT.listBlob)
    },
  }
}
</script>
