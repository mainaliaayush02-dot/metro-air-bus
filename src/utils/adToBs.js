import NepaliDate from 'nepali-date-converter'

export function adToBS(adDateStr) {
  try {
    const nd = new NepaliDate(new Date(adDateStr))
    return nd.format('YYYY-MM-DD')
  } catch {
    return ''
  }
}

export function bsToAD(bsDateStr) {
  try {
    const [y, m, d] = bsDateStr.split('-').map(Number)
    const nd = new NepaliDate(y, m - 1, d)
    return nd.toJsDate()
  } catch {
    return null
  }
}

export function formatDualDate(adDateStr) {
  const bs = adToBS(adDateStr)
  return `${adDateStr}(AD)/${bs}(BS)`
}
