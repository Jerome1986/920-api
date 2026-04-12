export function parseAppleModel(model: string) {
  // 提取 <iPhone18,1>
  const match = model.match(/<([^>]+)>/)
  const deviceCode = match ? match[1] : null
  console.log('提取', deviceCode)
  return {
    deviceCode,
    displayFallback: model.replace(/<[^>]+>/g, '').trim()
  }
}