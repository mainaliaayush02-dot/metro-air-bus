import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adToBS } from '../utils/adToBs'
import Button from './ui/Button'

const CITIES = ['Kathmandu', 'Kakarbhitta']

function tomorrowAD() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function SearchForm({ initialFrom, initialTo, initialDate, initialPassengers }) {
  const navigate = useNavigate()
  const [from, setFrom] = useState(initialFrom || 'Kathmandu')
  const [to, setTo] = useState(initialTo || 'Kakarbhitta')
  const [date, setDate] = useState(initialDate || tomorrowAD())
  const [passengers, setPassengers] = useState(initialPassengers || 1)

  function handleFromChange(e) {
    const value = e.target.value
    setFrom(value)
    if (value === to) setTo(CITIES.find((c) => c !== value))
  }

  function handleToChange(e) {
    const value = e.target.value
    setTo(value)
    if (value === from) setFrom(CITIES.find((c) => c !== value))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const params = new URLSearchParams({ from, to, date, passengers: String(passengers) })
    navigate(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-5 sm:p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">FROM</label>
        <select
          value={from}
          onChange={handleFromChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">TO</label>
        <select
          value={to}
          onChange={handleToChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label className="block text-xs font-semibold text-gray-500 mb-1">DATE</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
        {date && <p className="absolute left-0 top-full mt-1 text-xs text-gray-400 whitespace-nowrap">BS: {adToBS(date) || '—'}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">PASSENGERS</label>
        <input
          type="number"
          min={1}
          max={6}
          value={passengers}
          onChange={(e) => setPassengers(Math.min(6, Math.max(1, Number(e.target.value) || 1)))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
      </div>

      <div>
        <label className="hidden lg:block text-xs font-semibold text-transparent mb-1" aria-hidden="true">
          &nbsp;
        </label>
        <Button type="submit" variant="dark" className="w-full">
          Search Buses
        </Button>
      </div>
    </form>
  )
}
