export default function BookingSummary({ schedule, seatNumbers, price, discount = 0 }) {
  const subtotal = seatNumbers.length * price
  const total = subtotal - discount

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
      <div className="flex items-center justify-between font-semibold text-brand-black">
        <span>{schedule.from} → {schedule.to}</span>
        <span>{schedule.departureTime}</span>
      </div>
      <p className="text-gray-500 mt-0.5">{schedule.busName}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        {seatNumbers.map((s) => (
          <span key={s} className="bg-brand-yellow text-brand-black text-xs font-bold px-2 py-1 rounded">
            {s}
          </span>
        ))}
      </div>

      <div className="space-y-1 mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-gray-600">
          <span>Rs. {price} × {seatNumbers.length} seat(s)</span>
          <span>Rs. {subtotal}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Discount</span>
          <span>Rs. {discount}</span>
        </div>
        <div className="flex justify-between font-bold text-brand-black text-base">
          <span>Total</span>
          <span>Rs. {total}</span>
        </div>
      </div>
    </div>
  )
}
