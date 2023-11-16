import { IconAddBorder, IconStretch, IconAddBackground } from '@codexteam/icons'

function make(tagName, classNames = null, attributes = {}) {
  const el = document.createElement(tagName)

  if (Array.isArray(classNames)) {
    el.classList.add(...classNames)
  } else if (classNames) {
    el.classList.add(classNames)
  }

  for (const attrName in attributes) {
    el[attrName] = attributes[attrName]
  }

  return el
}

/**
 * Working with Block Tunes
 */
export default class Tunes {
  /**
   * @param {object} tune - image tool Tunes managers
   * @param {object} tune.api - Editor API
   * @param {object} tune.actions - list of user defined tunes
   * @param {Function} tune.onChange - tune toggling callback
   */
  constructor({ api, actions, onChange }) {
    this.api = api
    this.actions = actions
    this.onChange = onChange
    this.buttons = []

  }

  /**
   * Available Image tunes
   *
   * @returns {{name: string, icon: string, title: string}[]}
   */
  static get tunes() {
    return [
      {
        name: 'withBorder',
        icon: IconAddBorder,
        title: 'With border',
      },
      {
        name: 'stretched',
        icon: IconStretch,
        title: 'Stretch image',
      },
      {
        name: 'withBackground',
        icon: IconAddBackground,
        title: 'With background',
      },
    ]
  }

  /**
   * Styles
   *
   * @returns {{wrapper: string, buttonBase: *, button: string, buttonActive: *}}
   */
  get CSS() {
    return {
      wrapper: '',
      buttonBase: this.api.styles.settingsButton,
      button: 'image-tool__tune',
      buttonActive: this.api.styles.settingsButtonActive,
    }
  }

  render(toolData) {
    const wrapper = make('div', this.CSS.wrapper)

    this.buttons = []

    const tunes = Tunes.tunes.concat(this.actions)

    tunes.forEach(tune => {
      if(tune) {
        const title = this.api.i18n.t(tune.title)
        const el = make('div', [this.CSS.buttonBase, this.CSS.button], {
          innerHTML: tune.icon,
          title,
        })

        // const el = make('div', [this.CSS.buttonBase, this.CSS.button], {
        //   innerHTML: `<div class="ce-popover__item"><div class="ce-popover__item-icon">${tune.icon}</div><div class="ce-popover__item-label">${tune.title}</div></div>`,
        //   title,
        // })

        el.addEventListener('click', () => {
          this.tuneClicked(tune.name, tune.action)
        })

        el.dataset.tune = tune.name

        el.classList[toolData[tune.name] ? 'add' : 'remove'](this.CSS.buttonActive)

        this.buttons.push(el)

        this.api.tooltip.onHover(el, title, {
          placement: 'top',
        })

        wrapper.appendChild(el)
      }
    })

    return wrapper
  }

  /**
   * Clicks to one of the tunes
   *
   * @param {string} tuneName - clicked tune name
   * @param {Function} customFunction - function to execute on click
   */
  tuneClicked(tuneName, customFunction) {
    if (typeof customFunction === 'function') {
      if (!customFunction(tuneName)) {
        return false
      }
    }

    const button = this.buttons.find(el => el.dataset.tune === tuneName)

    button.classList.toggle(this.CSS.buttonActive, !button.classList.contains(this.CSS.buttonActive))

    this.onChange(tuneName)
  }
}
