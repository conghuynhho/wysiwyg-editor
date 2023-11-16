import {API, ToolSettings} from '@editorjs/editorjs'
import {IconPicture} from '@codexteam/icons'
import getImageFromRateLimit from './lazy-image-from-rate-limit'
import type {ToolConfig} from '@editorjs/editorjs'
import {BlockTool} from '@editorjs/editorjs'

export const TYPE_ERROR = 1
export const SIZE_ERROR = 2
export const OVER_LIMIT = 3
export const OVER_LIMIT_UPLOAD = 4

function htmlToElement(htmlString: string): HTMLElement {
  const template = document.createElement('template')
  htmlString = htmlString.trim() // Never return a text node of whitespace as the result
  template.innerHTML = htmlString
  return (template.content.firstChild || document.createElement('template')) as HTMLDivElement
}

const DEFAULT_CONFIG: ToolConfig = {
  validate: {
    accept: 'image/bmp,image/jpeg,image/x-png,image/png',
    maxFileSize: 10, // MB
    limit: 350,
    limitUpload: 50,
  },
  showCountFile: true,
}

export interface ITunes {
  textAlign?: {
    alignment?: string
  }
}

export interface IImageData {
  imgSrc: string,
  imgFile?: File,
  width: number,
  height: number,
  withBorder?: boolean,
  stretched?: boolean,
  withBackground?: boolean,
}

export interface IData {
  id?: string,
  data: IImageData,
  tunes?: ITunes,
  type?: string
}

// Crate ImageTool class using for editor js plugin
async function getImageSize(imgFile: File): Promise<{ width: number | null, height: number | null }> {
  return await new Promise(rs => {
    try {
      if ((imgFile.type || '').includes('image')) {
        const img = new Image()
        img.src = URL.createObjectURL(imgFile)
        img.onload = function () {
          rs({
            width: img.width || 0,
            height: img.height || 0
          })
        }

        // Error: Image file type error
        img.onerror = () => {
          rs({width: null, height: null})
        }
        img.remove()
      } else {
        rs({width: 0, height: 0})
      }
    } catch (e) {
      console.log(e)
      rs({width: 0, height: 0})
    }
  })
}

const IMAGE_CLASS = 'image-tool__image-picture'
export default function CreateImageToolClass() {
  return class ImageTool implements BlockTool {
    constructor({api, config, onSelectFile, readOnly, data}) {
      this.api = api
      this.config = config
      this.onSelectFile = onSelectFile
      this.readOnly = readOnly
      // this.data = data
      this.nodes = {
        wrapper: htmlToElement(`<div class="${[this.CSS.baseClass, this.CSS.wrapper].join(' ')}"></div>`)
      }

      this.data = data
      this.appendImageElement()
      if(this.data?.data?.imgFile && this.data?.data?.imgSrc) {
        ImageTool.countFile = ImageTool.countFile + 1
        this.updateCountImageText()
      }
    }

    api?: API
    config?: ToolSettings<{
      validate: {
        accept: string,
        maxFileSize: number,

        // if number of image larger than this limit, disable input image
        limit: number,
        limitUpload: number,
      },
      imgGenHtml: (val: Parameters<typeof ImageTool.imgGenHtml>[0]) => string
      uploadImgError?: (type: number) => number
      loadingImage: string,
      showCountFile?: boolean
    }>['config']
    // data: IData
    onSelectFile: (files: File[]) => void
    tunes: any
    ui: any
    static isToolbarDisabled = false
    static countFile = 0
    static listBlob: string[] = []
    readOnly: any
    nodes: ({
      wrapper:
        ReturnType<typeof htmlToElement>,
    })

    setTune(tuneName: string, value: any) {
      this.data[tuneName] = value
      this.applyTune(tuneName, value)
      if (tuneName === 'stretched') {
        // Wait until the API is ready
        Promise.resolve().then(() => {
          if(!this.api) return
          const blockId = this.api.blocks.getCurrentBlockIndex()
          this.api.blocks.stretchBlock(blockId, value)
        })
          .catch(err => {
            console.error(err)
          })
      }
    }

    applyTune(tuneName: string, status: any) {
      // @ts-ignore
      this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${tuneName}`, status)
    }

    tuneToggled(tuneName: string) {
      // inverse tune state
      this.setTune(tuneName, !this.data[tuneName])
    }

    get CSS() {
      return {
        baseClass: this.api ? this.api.styles.block : '',
        /**
         * Tool's classes
         */
        wrapper: 'image-tool',
        imageContainer: 'image-tool__image',
        imagePreloader: 'image-tool__image-preloader',
        imageEl: IMAGE_CLASS,
        caption: 'image-tool__caption',
      }
    }

    static get toolbox() {
      return {
        title: 'Image',
        icon: IconPicture
      }
    }

    isFileSizeOkay(f: File) {
      return f.size / 1024 / 1024 < (this.config?.validate.maxFileSize || DEFAULT_CONFIG.validate.maxFileSize) // in MB
    }

    isImageLimited = false
    isImageUploadLimited = false

    async isFileNumberOverLimit(imageWillAdd = 0, isExcludeCurrentBlock = false) {
      const data = await this.api?.saver.save()
      const countEditorImage = ((data || {}).blocks || []).filter(block => block.type === 'image').length
      const excludeNum = isExcludeCurrentBlock ? -1 : 0

      const isImageLimited = countEditorImage + imageWillAdd + excludeNum  > (this.config?.validate.limit || DEFAULT_CONFIG.validate.limit)

      const limitUpload = (this.config?.validate.limitUpload || DEFAULT_CONFIG.validate.limitUpload)
      const isImageUploadLimited = ImageTool.countFile === limitUpload || (ImageTool.countFile + Math.max(imageWillAdd, 0) > limitUpload)

      this.isImageLimited = isImageLimited
      this.isImageUploadLimited = isImageUploadLimited

      return isImageLimited || isImageUploadLimited
    }

    // validate and create blocks image from FileList
    async validateAndCreateBlocksFromFileList(files: File[]): Promise<IData[]> {
      const fileSizes: IData[] = []

      for(let i = 0; i < files.length; i++) {
        const imgFile = files[i]

        // validate file size
        if(!this.isFileSizeOkay(imgFile)) {
          this.config?.uploadImgError && this.config.uploadImgError(SIZE_ERROR)
          return []
        }

        // get width/height
        const {width, height} = await getImageSize(imgFile)

        // cannot get width/height, file is invalid, return []
        if(!width || !height) {
          this.config?.uploadImgError && this.config.uploadImgError(TYPE_ERROR)
          return []
        }

        // push to array
        fileSizes.push({
          data: {
            imgSrc: URL.createObjectURL(imgFile),
            imgFile: imgFile,
            width,
            height,
          }
        })
      }
      return fileSizes
    }

    // Handle input multi image
    // Please read `README > Flow input image` before maintain this function.
    async onClickInputFile() {
      const currentBlockIndex = this.api?.blocks.getCurrentBlockIndex() || 0;
      (this.nodes.wrapper as HTMLDivElement).style.padding = '0'
      this.updateCountImageText()

      if (ImageTool.isToolbarDisabled || await this.isFileNumberOverLimit(1, true)) {
        if(this.isImageLimited) {
          this.config?.uploadImgError && this.config.uploadImgError(OVER_LIMIT)
        } else if(this.isImageUploadLimited) {
          this.config?.uploadImgError && this.config.uploadImgError(OVER_LIMIT_UPLOAD)
        }
        if(this.api) {
          // setTimeout, fix block remove immediately after append.
          setTimeout(() => this.api && !isNaN(currentBlockIndex) && this.api.blocks.delete(currentBlockIndex), 0)
        }
        return
      }

      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('multiple', 'true')
      input.setAttribute('accept', this.config?.validate?.accept || DEFAULT_CONFIG.validate.accept)
      input.setAttribute('style', 'height: 2px; width: 2px; overflow: hidden;position: fixed; top: 0; right: 0; background: red;')
      document.body.appendChild(input)

      input.addEventListener('blur', () => {
        if(this.api) {
          this.api && !isNaN(currentBlockIndex) && this.api.blocks.delete(currentBlockIndex)
        }
        (this.nodes.wrapper as HTMLDivElement).style.padding = ''
        this.updateCountImageText()
        input.remove()
        input.value = ''
      }, { once: true })

      input.addEventListener('input',  async (event: Event) => {
        const files = Array.from((<HTMLInputElement>event.target).files || [])

        // validate array files
        if(!files || files.length === 0) {
          input.blur()
          return
        }

        // validate limit
        if(await this.isFileNumberOverLimit(files.length)) {
          this.updateCountImageText()
          if(this.isImageLimited) {
            this.config?.uploadImgError && this.config.uploadImgError(OVER_LIMIT)
          } else if(this.isImageUploadLimited) {
            this.config?.uploadImgError && this.config.uploadImgError(OVER_LIMIT_UPLOAD)
          }
          input.blur()
          return
        }

        // validate mimetype and create blocks data
        const blocksImage: IData[] = await this.validateAndCreateBlocksFromFileList(files)

        // if failed, return
        if(!blocksImage.length) {
          input.blur()
          return
        }

        // insert blocks to editor
        this.onSelectFile && this.onSelectFile(files)
        input.blur()
        this.insertMultiBlocksImage(blocksImage)
      })

      input.click()
      setTimeout(() => input.focus(), 100)
    }

    insertMultiBlocksImage(blocksImage: IData[]) {
      const currentIndex = this.api?.blocks.getCurrentBlockIndex() || 0
      ImageTool.listBlob = [...ImageTool.listBlob, ...(blocksImage.map(block => block.data.imgSrc))]

      // handle insert array blocks image to end
      if(blocksImage.length) {
        // insert image blocks
        blocksImage.forEach((block, idx) => {
          this.api && this.api.blocks.insert(
            'image',
            block,
            this.config,
            currentIndex + idx + 1,
            false,
            false,
          )
        })
      }
      this.updateCountImageText()
      this.isFileNumberOverLimit(1).then(() => {
        (this.isImageUploadLimited || this.isImageLimited) && this.disableToolbar()
      })
    }

    disableToolbar() {
      const toolbarEl = this.getImageToolbarElement()
      toolbarEl?.setAttribute('style', 'opacity: .2;cursor: not-allowed;')
      toolbarEl?.setAttribute('title', this.api ? this.api.i18n.t('Over limit') : 'Over limit')
      ImageTool.isToolbarDisabled = true
    }

    enableToolbar() {
      const toolbarEl = this.getImageToolbarElement()
      toolbarEl?.setAttribute('style', '')
      toolbarEl?.setAttribute('title', '')
      ImageTool.isToolbarDisabled = false
    }

    appendCallback() {
      this.onClickInputFile()
      // this.appendImageElement()
    }

    render() {
      return this.nodes.wrapper
    }

    save() {
      return this.data
    }

    _data: IData = {
      data: {
        width: 0,
        height: 0,
        stretched: false,
        withBorder: false,
        withBackground: false,
        imgSrc: '',
      }
    }
    get data(): IData {
      return this._data
    }

    set data(data) {
      this._data = data
    }

    removed() {
      this.lazyTimeoutEdit && clearTimeout(this.lazyTimeoutEdit)
      if(this.data?.data?.imgFile && this.data?.data?.imgSrc) {
        ImageTool.countFile = ImageTool.countFile - 1
        this.isFileNumberOverLimit(-1).then(() => !this.isImageUploadLimited && !this.isImageLimited && this.enableToolbar())
      } else {
        this.isFileNumberOverLimit(0).then(() => !this.isImageUploadLimited && !this.isImageLimited && this.enableToolbar())
      }
      this.updateCountImageText()
    }

    getImageToolbarElement() {
      const codexEditor = this.api?.ui.nodes.wrapper
      if (!codexEditor) return null
      const cePopoverItem = this.api?.ui.nodes.wrapper.querySelector('div[data-item-name="image"]')
      return cePopoverItem || null
    }

    static releaseAllBlob() {
      this.listBlob.forEach(item => {
        URL.revokeObjectURL(item)
      })
    }

    appendImageElement() {
      (this.nodes.wrapper as HTMLDivElement).innerHTML = ''
      if (this.data?.data?.imgSrc) {
        this.nodes.wrapper.appendChild((htmlToElement(
          ImageTool.imgGenHtml({data: this.data, tunes: null, isReviewMode: false}) as string
        )) as unknown as Node)
        this.startLazyModeEdit()
      }
    }

    async updateCountImageText() {
      const showCountFile = this.config?.showCountFile || DEFAULT_CONFIG.showCountFile
      if(!showCountFile) return

      const toolEl = this.getImageToolbarElement()
      if(!toolEl) return

      const limitUpload = this.config?.validate.limitUpload || DEFAULT_CONFIG.validate.limitUpload
      toolEl.setAttribute('data-content', ` (${ImageTool.countFile}/${limitUpload})`)
    }

    static loadingImage: (string | null) = null
    lazyTimeoutEdit: (null | ReturnType<typeof setTimeout>) = null
    // lazy image for edit mode
    startLazyModeEdit() {
      const imgEl = (this.nodes.wrapper as HTMLDivElement).querySelector('img')
      if (!imgEl) return
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // set image source only when it is in the viewport
            if (entry.isIntersecting) {
              const image: any = entry.target
              getImageFromRateLimit({
                element: image,
                urlImage: image.dataset.src,
                countRetry: 0,
                maxRetry: 19,
                callbackUpdateTimeout: (timeout) => {
                  this.lazyTimeoutEdit = timeout
                }
              })
              image.classList.remove('lazy')
              io.unobserve(image)
            }
          })
        },
        {
          root: null,
          rootMargin: '50px',
          threshold: 0,
        }
      )
      io.observe(imgEl)
    }

    static lazyTimeoutReview: { [val: number]: ReturnType<typeof setTimeout> } = {}
    // lazy image for review mode
    static startLazyModeReview() {
      const imgEls = document.querySelectorAll(`img.lazy.${IMAGE_CLASS}`)
      if (!imgEls.length) return
      const io = new IntersectionObserver((entries) =>
        entries.forEach((entry, index) => {
          // set image source only when it is in the viewport
          if (entry.isIntersecting) {
            const image: any = entry.target
            getImageFromRateLimit({
              element: image,
              urlImage: image.dataset.src,
              countRetry: 0,
              maxRetry: 19,
              callbackUpdateTimeout: (timeout) => {this.lazyTimeoutReview[index] = timeout}
            })
            image.classList.remove('lazy')
            io.unobserve(image)
          }
        })
      )
      imgEls.forEach(imgEl => io.observe(imgEl))
    }

    static genNoImageUI(isReviewMode = false) {
      const template = '<div class="ce-block__content cdx-block" style="text-align: center;cursor: pointer">NO IMAGE</div>'
      return !isReviewMode
        ? template
        : (
          `<div class="ce-block">
            <div class="ce-block__content">
              <div class="cdx-block image-tool" style="pointer-events: none">
                ${template}
              </div>
            </div>
          </div>`
        )
    }

    static genMaxSize(o1) {
      const maxAvailH = window.innerHeight * .5
      const ratioH = maxAvailH / o1.h
      if (ratioH < 1) {
        o1.w = o1.w * ratioH
        o1.h = o1.h * ratioH
      }
      return {
        w: o1.w,
        h: o1.h
      }
    }

    static imgGenHtml({data, tunes, isReviewMode = true}: { data: any, tunes?: any, isReviewMode?: boolean }) {
      const img = data?.data ? data.data : {
        width: 0,
        height: 0,
        stretched: false,
        withBorder: false,
        withBackground: false
      }
      // if(img.width === 0 || img.height === 0) return ImageTool.genNoImageUI(isReviewMode)
      if (!img.width || !img.height || img.width === 0 || img.height === 0) return

      const {width, height} = img
      const {w, h} = ImageTool.genMaxSize({w: width, h: height})
      const template =
        `<div style=${`max-width:${w}px; max-height:${h}px`}>
        <div class="aspect-ratio-box" style=${`padding-top:${height / width * 100}%`}>
          <div class="cdx-block image-tool image-tool__image aspect-ratio-box-inside">
            <img
              alt="image"
              class="lazy image-tool__image-picture"
              data-src="${(img as { imgSrc: string })?.imgSrc}"
              ${this.loadingImage ? `src="${this.loadingImage}"` : ''}
            >
          </div>
        </div>
      </div>`

      if (isReviewMode) {
        const textAlign = tunes?.textAlign?.alignment || ''
        const imgClass = [
          `${data.stretched ? 'image-tool--stretched' : ''}`,
          `${data.withBackground ? 'image-tool--withBackground ' : ''}`,
          `${data.withBorder ? 'image-tool--withBorder ' : ''}`
        ]
        return (
          `<div class="ce-block ${data.stretched ? 'ce-block--stretched' : ''} ${textAlign ? `ce-tune-alignment--${textAlign}` : ''}">
            <div class="ce-block__content">
              <div class="cdx-block image-tool ${imgClass.join(' ')}">
                ${template}
              </div>
            </div>
          </div>`
        )
      }

      return template
    }
  }
}
