export function countCharacters(contents) {
  if(!contents) return 0
  try {
    const ctn = contents
      .replace(
        /((&nbsp;)|(&ensp;)|(&emsp;)|(&#160;)|(&#xa0;)|( &thinsp;)|(<br\/>))/g,
        ' ',
      )
      .replace(/(<([^>]+)>)/g, ' ')
      .trim()
    return (ctn || '').length
  } catch {
    return 0
  }
}

export const COUNT_FUNCTIONS = {
  header(block) {
    const text = block.data.text
    return countCharacters(text)
  },
  paragraph(block) {
    const text = block.data.text
    return countCharacters(text)
  },
  table(block) {
    let count = 0
    const content = block.data.content
    for(let row = 0; row < content.length; row++) {
      const rowItem = content[row]
      for(let column = 0; column < rowItem.length; column++) {
        const num = countCharacters(rowItem[column])
        count += num
      }
    }
    return count
  },
  list(block) {
    let count = 0
    const items = block.data.items
    for(let j = 0; j < items.length; j++) {
      const num = countCharacters(items[j])
      count += num
    }
    return count
  },
}

export default function countCharacter(blocks: ({type: string})[], countFunctions = COUNT_FUNCTIONS) {
  return blocks.reduce((count, block) => {
    return countFunctions[block.type]
      ? count + countFunctions[block.type](block)
      : count
  }, 0)
}
