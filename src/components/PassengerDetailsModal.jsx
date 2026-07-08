import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createBooking } from '../utils/createBooking'
import { lookupPromoCode } from '../utils/promoCode'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Alert from './ui/Alert'
import BookingSummary from './BookingSummary'

export default function PassengerDetailsModal({
  isOpen,
  onClose,
  scheduleId,
  schedule,
  seatNumbers,
  boardingPoints,
  droppingPoints,
  onSuccess,
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [boardingPoint, setBoardingPoint] = useState(boardingPoints?.[0]?.name || '')
  const [droppingPoint, setDroppingPoint] = useState(droppingPoints?.[0] || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [checkingPromo, setCheckingPromo] = useState(false)

  const discount = appliedPromo ? appliedPromo.discountAmount * seatNumbers.length : 0

  async function handleApplyPromo() {
    setPromoError('')
    if (!promoInput.trim()) return setPromoError('Enter a promo code.')

    setCheckingPromo(true)
    try {
      const promo = await lookupPromoCode(promoInput)
      if (!promo) {
        setAppliedPromo(null)
        setPromoError('Invalid or expired promo code.')
      } else {
        setAppliedPromo(promo)
      }
    } catch (err) {
      setPromoError(err.message || 'Failed to validate promo code.')
    } finally {
      setCheckingPromo(false)
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null)
    setPromoInput('')
    setPromoError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('Full name is required.')
    if (!/^9\d{9}$/.test(phone)) return setError('Enter a valid Nepal phone number (e.g. 98xxxxxxxx).')
    if (!boardingPoint) return setError('Please select a boarding point.')
    if (!droppingPoint) return setError('Please select a dropping point.')

    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    setSubmitting(true)
    try {
      const bookingId = await createBooking({
        scheduleId,
        schedule,
        seatNumbers,
        passengerName: name.trim(),
        passengerPhone: phone.trim(),
        boardingPoint,
        droppingPoint,
        uid: user.uid,
        promoCode: appliedPromo?.code || null,
        discountPerSeat: appliedPromo?.discountAmount || 0,
      })
      onSuccess(bookingId)
    } catch (err) {
      if (err.code === 'permission-denied') {
        setError('One or more selected seats were just booked by someone else. Please go back and select different seats.')
      } else {
        setError(err.message || 'Something went wrong while booking. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Passenger Details" className="max-w-md">
      <div className="space-y-4">
        <BookingSummary schedule={schedule} seatNumbers={seatNumbers} price={schedule.basePrice} discount={discount} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
          {appliedPromo ? (
            <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm">
              <span className="font-mono font-bold text-green-700">{appliedPromo.code}</span>
              <span className="text-green-700">Rs. {appliedPromo.discountAmount} off / seat</span>
              <button type="button" onClick={handleRemovePromo} className="text-gray-400 hover:text-red-600 text-xs font-semibold">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={checkingPromo}>
                {checkingPromo ? 'Checking...' : 'Apply'}
              </Button>
            </div>
          )}
          {promoError && <p className="text-xs text-red-600 mt-1">{promoError}</p>}
        </div>

        <Alert variant="error">{error}</Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="98xxxxxxxx"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boarding Point</label>
            <select
              value={boardingPoint}
              onChange={(e) => setBoardingPoint(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              {(boardingPoints || []).map((bp) => (
                <option key={bp.name} value={bp.name}>
                  {bp.name} — {bp.time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dropping Point</label>
            <select
              value={droppingPoint}
              onChange={(e) => setDroppingPoint(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              {(droppingPoints || []).map((dp) => (
                <option key={dp} value={dp}>{dp}</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="accent" disabled={submitting} className="w-full">
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </form>
      </div>
    </Modal>
  )
}
