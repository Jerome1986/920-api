import { pinyin } from 'pinyin-pro'
// ------------------------------
// 标准化
// ------------------------------
export function normalize(text: string) {
  if (!text) return ''

  const result = pinyin(text, {
    type: 'string',
    toneType: 'none',
    nonZh: 'consecutive',
    v: false,
  })

  return result
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
}