// 换算时间
export function termToMs(term: string): number {
  switch (term) {
    case '180':
      return 1000 * 60 * 60 * 24 * 30 * 6
    case '365':
      return 1000 * 60 * 60 * 24 * 365
    case '永久':
      return 1000 * 60 * 60 * 24 * 365 * 100 // 写个超大数
    default:
      throw new Error('未知 term: ' + term)
  }
}
