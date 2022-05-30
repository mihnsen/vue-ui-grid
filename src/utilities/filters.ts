export function useGridHeader(str: string) {
  if (str) {
    const s = str.charAt(0).toUpperCase() + str.slice(1)
    return s.replace(/_/, ' ')
  }
  return str
}
