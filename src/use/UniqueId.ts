/**
 * Generate unique id for component
 */
export function uniqueId(prefix?: string) {
  const p = prefix ? `${prefix}` : 'vgrid';

  // Random 6 digit number
  const rand = Math.floor(100000 + Math.random() * 900000); //eslint-disable-line

  return `${p}-${rand}`;
}
