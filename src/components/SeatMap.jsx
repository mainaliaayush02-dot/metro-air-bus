import { useEffect, useState } from 'react'
import { RefreshCw, ShipWheel } from 'lucide-react'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useRealTimeSeats } from '../hooks/useRealTimeSeats'
import { SEAT_LAYOUT_CONFIG } from '../utils/seatLayout'
import Spinner from './ui/Spinner'
import Button from './ui/Button'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'booked', label: 'Booked' },
  { id: 'hold', label: 'Operator Hold' },
]

function statusOf(seatDoc) {
  return seatDoc?.status || 'available'
}

function matchesFilter(status, filter) {
  if (filter === 'all') return true
  if (filter === 'hold') return status === 'operator_hold'
  return status === filter
}

function seatAppearance(status, isSelected) {
  if (isSelected) return 'bg-brand-yellow text-brand-black'
  if (status === 'booked') return 'bg-gray-400 text-white'
  if (status === 'operator_hold') return 'bg-gold-trim text-white'
  return 'bg-blue-600 text-white hover:bg-blue-700'
}

function Seat({ seatId, status, isSelected, price, onClick, dimmed, mode }) {
  const title =
    status === 'booked' ? `Seat ${seatId} is already booked`
      : status === 'operator_hold' ? `Seat ${seatId} is on hold`
      : `Seat ${seatId} - Rs. ${price}`
  const disabled = mode === 'admin-hold' ? status === 'booked' : status !== 'available' && !isSelected

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-16 items-center justify-center rounded-lg text-xs font-bold transition-colors disabled:cursor-not-allowed ${seatAppearance(status, isSelected)} ${dimmed ? 'opacity-30 pointer-events-none' : ''}`}
    >
      {seatId}
    </button>
  )
}

export default function SeatMap({ scheduleId, price, mode = 'booking', onProceed }) {
  const { seats, loading } = useRealTimeSeats(scheduleId)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [filter, setFilter] = useState('all')
  const [toasts, setToasts] = useState([])
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    if (mode !== 'booking') return
    const dropped = selectedSeats.filter((seatId) => statusOf(seats[seatId]) !== 'available')
    if (dropped.length === 0) return

    setSelectedSeats((current) => current.filter((s) => !dropped.includes(s)))
    setToasts((t) => [
      ...t,
      ...dropped.map((seatId) => ({
        id: `${seatId}-${Date.now()}`,
        message: `Seat ${seatId} was just booked by someone else`,
      })),
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seats])

  useEffect(() => {
    if (!toasts.length) return
    const timer = setTimeout(() => setToasts((t) => t.slice(1)), 4000)
    return () => clearTimeout(timer)
  }, [toasts])

  function handleRefresh() {
    setSpinning(true)
    setTimeout(() => setSpinning(false), 600)
  }

  async function handleSeatClick(seatId) {
    const status = statusOf(seats[seatId])

    if (mode === 'admin-hold') {
      if (status === 'booked') return
      const next = status === 'operator_hold' ? 'available' : 'operator_hold'
      await updateDoc(doc(db, 'schedules', scheduleId, 'seats', seatId), {
        status: next,
        updatedAt: serverTimestamp(),
      })
      return
    }

    if (status !== 'available' && !selectedSeats.includes(seatId)) return
    setSelectedSeats((current) =>
      current.includes(seatId) ? current.filter((s) => s !== seatId) : [...current, seatId]
    )
  }

  const subtotal = selectedSeats.length * price
  const discount = 0
  const total = subtotal - discount

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
          {FILTERS.map((f) => (
            <label key={f.id} className="flex items-center gap-2 text-sm text-brand-black cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filter === f.id}
                onChange={() => setFilter(filter === f.id ? 'all' : f.id)}
                className="h-4 w-4 rounded border-gray-400 accent-brand-black"
              />
              {f.label}
            </label>
          ))}
          <button
            onClick={handleRefresh}
            title="Refresh"
            className="ml-auto text-gray-500 hover:text-brand-orange"
          >
            <RefreshCw size={18} className={spinning ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 sm:p-6 pb-24 md:pb-6">
          <div className="flex justify-end mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellow text-brand-black shadow">
              <ShipWheel size={22} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {SEAT_LAYOUT_CONFIG.rows
              .filter((row) => row.type !== 'driver')
              .map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-6">
                  <div className="flex gap-2">
                    {row.left.map((seatId) => {
                      const status = statusOf(seats[seatId])
                      return (
                        <Seat
                          key={seatId}
                          seatId={seatId}
                          status={status}
                          price={price}
                          isSelected={selectedSeats.includes(seatId)}
                          dimmed={!matchesFilter(status, filter)}
                          onClick={() => handleSeatClick(seatId)}
                          mode={mode}
                        />
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    {row.right.map((seatId) => {
                      const status = statusOf(seats[seatId])
                      return (
                        <Seat
                          key={seatId}
                          seatId={seatId}
                          status={status}
                          price={price}
                          isSelected={selectedSeats.includes(seatId)}
                          dimmed={!matchesFilter(status, filter)}
                          onClick={() => handleSeatClick(seatId)}
                          mode={mode}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200 text-xs text-gray-600">
            <LegendDot className="bg-blue-600" label="Available" />
            <LegendDot className="bg-brand-yellow" label="Selected" />
            <LegendDot className="bg-gray-400" label="Booked" />
            <LegendDot className="bg-gold-trim" label="Operator Hold" />
          </div>
        </div>
      </div>

      {mode === 'booking' && (
        <>
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-20 bg-white rounded-xl border border-gray-200 shadow-md p-5">
              <SidebarContent
                selectedSeats={selectedSeats}
                price={price}
                subtotal={subtotal}
                discount={discount}
                total={total}
                onProceed={onProceed}
              />
            </div>
          </aside>

          <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-4 no-print z-30">
            <SidebarContent
              selectedSeats={selectedSeats}
              price={price}
              subtotal={subtotal}
              discount={discount}
              total={total}
              onProceed={onProceed}
              compact
            />
          </div>
        </>
      )}

      {toasts.length > 0 && (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="bg-brand-black text-white text-sm rounded-lg px-4 py-2 shadow-lg max-w-xs"
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LegendDot({ className, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded ${className}`} />
      {label}
    </div>
  )
}

function SidebarContent({ selectedSeats, price, subtotal, discount, total, onProceed, compact }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{selectedSeats.length} seat(s) selected</p>
          <p className="font-bold text-brand-black">Rs. {total}</p>
        </div>
        <Button
          variant="accent"
          disabled={selectedSeats.length === 0}
          onClick={() => onProceed?.(selectedSeats)}
        >
          Proceed to Book
        </Button>
      </div>
    )
  }

  return (
    <>
      <h3 className="font-bold text-brand-black mb-3">Selected Seats</h3>
      {selectedSeats.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">No seats selected yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSeats.map((s) => (
            <span
              key={s}
              className="bg-brand-yellow text-brand-black text-xs font-bold px-2 py-1 rounded"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-1 text-sm border-t border-gray-200 pt-3">
        <div className="flex justify-between text-gray-600">
          <span>Rs. {price} × {selectedSeats.length} seat(s)</span>
          <span>Rs. {subtotal}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Discount</span>
          <span>Rs. {discount}</span>
        </div>
        <div className="flex justify-between font-bold text-brand-black text-base pt-1">
          <span>Total</span>
          <span>Rs. {total}</span>
        </div>
      </div>

      <Button
        variant="accent"
        className="w-full mt-4"
        disabled={selectedSeats.length === 0}
        onClick={() => onProceed?.(selectedSeats)}
      >
        Proceed to Book
      </Button>
    </>
  )
}
