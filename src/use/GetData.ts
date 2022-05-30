/**
 * extract data from json object
 */
export function getData(field: string, columnData: any) {
  if (!columnData) {
    return ''
  }

  const fields = field.split('.')
  const res = fields.reduce((acc: any, curr: string, index) => {
    return acc[curr] || (index < fields.length - 1 ? {} : null)
  }, columnData)

  return res ? res : '' // eslint-disable-line
}
