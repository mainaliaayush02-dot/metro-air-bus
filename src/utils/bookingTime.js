export function parseDepartureDateTime(dateAD, timeStr) {
  const [time, meridiem] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  const [y, m, d] = dateAD.split('-').map(Number)
  return new Date(y, m - 1, d, hours, minutes)
}

export function canCancelBooking(booking) {
  if (booking.status !== 'confirmed') return false
  const departure = parseDepartureDateTime(booking.journeyDateAD, booking.departureTime)
  const hoursUntilDeparture = (departure.getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntilDeparture > 24
}
