type TGetImageFromRateLimit = {
  element: HTMLImageElement,
  urlImage?: string,
  countRetry?: number,
  maxRetry?: number,
  callbackUpdateTimeout?: null | ((val: ReturnType<typeof setTimeout>) => void),
}
const getImageFromRateLimit = ({element, urlImage, countRetry = 0, maxRetry = 19, callbackUpdateTimeout}: TGetImageFromRateLimit) => {

  if (!element || !urlImage)
    throw Error('getImageFromRateLimit not found element or urlImage')

  try {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', urlImage, true)
    xhr.responseType = 'blob'
    xhr.onload = () => {
      const retryAfter = xhr.getResponseHeader('retry-after')
      if (retryAfter) {
        if (countRetry == maxRetry)
          return
        countRetry += 1

        const timeout = setTimeout(() => {
            getImageFromRateLimit({element, urlImage, countRetry, maxRetry, callbackUpdateTimeout})
          }, parseInt(retryAfter) * 1000)

        callbackUpdateTimeout && callbackUpdateTimeout(timeout)
        return
      } else if (xhr.status == 200) {
        const url = URL.createObjectURL(xhr.response)
        element.src = url
        element.onload = () => URL.revokeObjectURL((url))
      }
    }
    xhr.send()
  } catch (error) {
    console.log('load image error ============: ', {...error})
  }
}

export default getImageFromRateLimit
