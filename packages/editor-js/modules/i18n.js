/* eslint-disable @typescript-eslint/no-var-requires */
try {
  const i18n = require('@ggj/build-i18n')
  const config = require('../i18n.config')
  i18n(config)
} catch(e) {
  console.log(e)
  process.exit(1)
}
/* eslint-enable @typescript-eslint/no-var-requires */
