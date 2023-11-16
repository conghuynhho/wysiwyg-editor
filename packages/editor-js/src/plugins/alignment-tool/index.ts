import {API, ToolSettings} from '@editorjs/editorjs'
function make(tagName, classNames: (null|string[]) = null, attributes = {}) {
  const el = document.createElement(tagName)
  if (classNames && Array.isArray(classNames)) {
    el.classList.add(...classNames)
  } else if (classNames) {
    el.classList.add(classNames)
  }
  for (const attrName in attributes) {
    el[attrName] = attributes[attrName]
  }
  return el
}

function htmlToElement(htmlString) {
  const template = document.createElement('template')
  htmlString = htmlString.trim() // Never return a text node of whitespace as the result
  template.innerHTML = htmlString
  return template.content.firstChild
}

class AlignmentBlockTune {
  api?: API
  settings: ToolSettings<{blocks: {header: string, list: string}, default: string}>['config'] = {
    default: 'right',
    blocks: {
      header: 'center',
      list: 'right'
    }
  }
  data: ({alignment: string})
  block: HTMLInputElement
  alignmentSettings: Array<{name: string, icon: string, title: string}> = [
    {
      name: 'left',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" id="Layer" height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m10 23h28c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"/><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m10 45h28c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"/></svg>',
      title: 'left'
    },
    {
      name: 'center',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" id="Layer" height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m46 23c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"/><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m46 45c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"/></svg>',
      title: 'center'
    },
    {
      name: 'right',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" id="Layer" height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 19h-28c-1.104 0-2 .896-2 2s.896 2 2 2h28c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 41h-28c-1.104 0-2 .896-2 2s.896 2 2 2h28c1.104 0 2-.896 2-2s-.896-2-2-2z"/></svg>',
      title: 'right'
    }
  ]
  wrapper?: HTMLElement
  _CSS = {
    alignment: {
      left: 'ce-tune-alignment--left',
      center: 'ce-tune-alignment--center',
      right: 'ce-tune-alignment--right',
    }
  }
  static get DEFAULT_ALIGNMENT() {
    return 'left'
  }
  static get isTune() {
    return true
  }
  getAlignment() {
    if(!this.settings) return
    // eslint-disable-next-line no-prototype-builtins
    if (!!this.settings.blocks && this.settings.blocks.hasOwnProperty(this.block.name)) {
      return this.settings.blocks[this.block.name]
    }
    if (this.settings.default) {
      return this.settings.default
    }
    return AlignmentBlockTune.DEFAULT_ALIGNMENT
  }
  constructor({api, data, config, block}) {
    this.api = api
    this.block = block
    this.settings = config
    this.data = data || {alignment: this.getAlignment()}
  }
  wrap(blockContent) {
    this.wrapper = make('div')
    if(!this.wrapper) return
    this.wrapper.classList.toggle(this._CSS.alignment[this.data.alignment])
    this.wrapper.append(blockContent)
    return this.wrapper
  }
  render() {
    const wrapper = make('div')
    this.initStyle()
    this.alignmentSettings.map(align => {
      if(!this.api) return
      const title = this.api.i18n.t(align.title)
      const button = document.createElement('button')
      button.classList.add(this.api.styles.settingsButton)
      button.innerHTML = align.icon
      button.title = title
      button.type = 'button'
      button.classList.toggle(this.api.styles.settingsButtonActive, align.name === this.data.alignment)
      this.api.tooltip.onHover(button, title, {
        placement: 'top',
      })
      wrapper.appendChild(button)
      return button
    }).forEach((element, index, elements) => {
      element && element.addEventListener('click', () => {
        this.data = {
          alignment: this.alignmentSettings[index].name
        }
        elements.forEach((el, i) => {
          if(!this.api) return
          const {name} = this.alignmentSettings[i]
          el && el.classList.toggle(this.api.styles.settingsButtonActive, name === this.data.alignment)
          //toggle alignment style class for block
          this.wrapper && this.wrapper.classList.toggle(this._CSS.alignment[name], name === this.data.alignment)
        })
      })
    })
    return wrapper
  }
  save() {
    return this.data
  }
  static _isInitStyle = false
  static getStyleElement() {
    return htmlToElement(`
      <style>
        .ce-tune-alignment--right {
          text-align: right;
        }
        .ce-tune-alignment--center {
          text-align: center;
        }
        .ce-tune-alignment--left {
          text-align: left;
        }
      </style>
    `)
  }
  initStyle() {
    if(this.api) {
      const styleEl = AlignmentBlockTune.getStyleElement()
      styleEl && this.api.ui.nodes.wrapper.appendChild(styleEl)
      AlignmentBlockTune._isInitStyle = true
    }
  }
}

// module.exports = AlignmentBlockTune
export default AlignmentBlockTune
