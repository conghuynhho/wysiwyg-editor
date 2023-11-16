import i18n, {t} from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANG_DEFAULT, NS_DEFAULT, LANG_FALLBACK } from './i18n.config'
// @ts-ignore
import * as sources from './lang/lib-editor-js/lib-editor-js.json'

const resources = Object.keys(sources).reduce((object, lang) => {
  return {
    ...object,
    [lang]: {
      [NS_DEFAULT]: sources[lang],
    },
  }
}, {})

i18n.use(initReactI18next).init({
  resources: resources,
  // Set default namespace,
  defaultNS: NS_DEFAULT,
  lng: LANG_DEFAULT,
  interpolation: {
    // react already safes from xss
    escapeValue: false,
  },
  fallbackLng: LANG_FALLBACK,
})

export default i18n

export {
  t,
}
