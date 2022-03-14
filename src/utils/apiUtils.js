/* Process a key: value params object and return a params url string
 * @param params {object}: An object with keys and strings or string arrays to format
 * @returns {String}: A string with the keys and values formatted for an api request
 */
export function formatParams(params) {
  const paramsArr = []
  for (const key in params) {
    if (Array.isArray(params[key])) {
      for (const value of params[key]) {
        paramsArr.push(`${key}=${value}`)
      }
    } else {
      paramsArr.push(`${key}=${params[key]}`)
    }
  }
  return paramsArr.join('&')
}
