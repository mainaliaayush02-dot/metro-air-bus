// Format: MAB-YYYYMMDD-XXXX
// Example: MAB-20251228-8952
// MAB = Metro Air Bus | Date = journey date | XXXX = 4-digit random

export function generateTicketNo(journeyDateAD) {
  const date = new Date(journeyDateAD)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `MAB-${yyyy}${mm}${dd}-${rand}`
}
