## Description
- This is a wrap library from "[EditorJS](https://www.npmjs.com/package/@editorjs/editorjs)"
- This library only run at client side.

## Installation
Run
```shell
yarn add @ggj/editor-js
```

## Run dev env
- If first time you start, run yarn build first:
```shell
yarn build
```

- Dev in react
```shell
yarn start:react:local
```

- Dev in vue
```shell
yarn start:vue:local
```

## How to use

- REACT
```tsx
import React, { useEffect } from 'react'
import {InitEditor} from '@ggj/editor-js'

function Editor() {
  useEffect(() => {
    InitEditor({
      ElementId: this.id, currentLang: 'ja'
    })
  }, [])
  return <div id="ElementId" />
}
```
- VUE
```js
<template>
  <div :id="id"></div>
</template>

<script>
import {InitEditor} from '@ggj/editor-js'
export default {
  name: 'Editor',
  data() {
    return { id: 'ElementId-xxx' }
  },
  mounted() {
    InitEditor({ElementId: this.id, currentLang: 'ja'})
  },
}
</script>
```

## Argument of the "InitEditor"
| # | Argument name | Type         | Description                                                                                                                       |
|---|---------------|--------------|-----------------------------------------------------------------------------------------------------------------------------------|
| 1 | ElementId     | string       | Element ID, where you want to render Editor.                                                                                      |
| 2 | currentLang   | string       | Language you editor. Sheet i18n [here](https://drive.google.com/drive/folders/1iVL4Yu78SPWZSP-uDJS40kv6Eu_Xy_Td) (lib-editor-js). |
| 3 | config        | EditorConfig | Use to custom config of "@ggj/editor-js".                                                                                         |

## How custom config
### Basic custom
- REACT
```tsx
import React, {useEffect} from 'react'
import {InitEditor, getBaseConfig} from '@ggj/editor-js'

function Editor() {
  useEffect(() => {
    const config = getBaseConfig()

    // MODIFY YOU CONFIG - START
    config.holder = 'custom-editor-id'
    config.onChange = () => console.log(arguments)
    // MODIFY YOU CONFIG - END

    InitEditor({
      ElementId: this.id, currentLang: 'ja', config: config,
    })
  }, [])
  return <div id="ElementId"/>
}
```
- VUE
```vue
<template>
  <div :id="id"></div>
</template>

<script>
import {InitEditor, getBaseConfig} from '@ggj/editor-js'
export default {
  name: 'Editor',
  data() {
    return { id: 'ElementId-xxx' }
  },
  mounted() {
    const config = getBaseConfig()

    // MODIFY YOU CONFIG - START
    config.holder = 'custom-editor-id'
    config.onChange = () => console.log(arguments)
    // MODIFY YOU CONFIG - END

    InitEditor({
      ElementId: this.id, currentLang: 'th', config: config,
    })
  },
}
</script>
```
### Custom with i18n
By default, config will init with 'ja' language. In case you want to init with other language, you need to change language first, then init config
Example:
```js
import {getBaseConfig, i18n} from '@ggj/editor-js'

// ...
getBaseConfig('th').then((cf) => {
  // MODIFY YOU CONFIG - START
  config.holder = 'custom-editor-id'
  config.onChange = () => console.log(arguments)
  // MODIFY YOU CONFIG - END

  InitEditor({ElementId: 'ElementId', currentLang: 'th', config: cf})
})
// ...
```

## i18n, t
The "i18n" and "t" is an instance of "[i18next](https://www.i18next.com/overview/api)" library.
I have exported it, that may be help you in case change language, get text,... and some special case related with i18n.
```js
import {i18n, t} from '@ggj/editor-js'
```

## Utils
### Count character
#### Params
| # | Argument name  | Type | Description                            |
|---|----------------|------|----------------------------------------|
| 1 | blocks         | any  | array of blocks data you need to count |
| 2 | countFunctions | any  | using in case you have a custom tools  |

#### Default
```js
import countCharacter from '@ggj/editor-js/dist/src/utils/countCharacter'

// ...
editor.save().then(data => {
  if (!data || data.blocks) return 0
  const countNumber = countCharacter(data.blocks)
  // do some thing with htmlString
  console.log(countNumber)
})
// ...
```
#### With custom tools

By default, the countCharacter function only count 4 blocks type: `table, paragraph, list, header`.
In case you have a custom block type, do like this
```js
import countCharacter, {COUNT_FUNCTIONS} from '@ggj/editor-js/dist/src/utils/countCharacter'

// ...
editor.save().then(data => {
  if (!data || data.blocks) return 0
  const countNumber = countCharacter(data.blocks, {
    ...COUNT_FUNCTIONS,
    myCustomTool: (block) => {
      // create function to count block data here
      return block.data.customdata.length // this only an example
    }
  })
})
  // do some thing with htmlString
  console.log(countNumber)
// ...
```

### Get HTML content from blocks data
#### Default
```js
import {genHtml} from '@ggj/editor-js/dist/src/utils/parsers'

// ...
editor.save().then(blocks => {
  const htmlString = genHtml(blocks)
  // do some thing with htmlString
})
// ...
```

## Welcome to contribute
Feel free to give your opinion if there are inappropriate points.

I really appreciate that.

Thank you.
