import { Link } from 'react-router-dom'
import { Bus, Clock, Users } from 'lucide-react'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { formatDualDate } from '../utils/adToBs'

export default function ScheduleCard({ schedule }) {
  const soldOut = schedule.availableSeats <= 0

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-black">
          <span>{schedule.from}</span>
          <span className="text-brand-orange">→</span>
          <span>{schedule.to}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{formatDualDate(schedule.departureDateAD)}</p>

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {schedule.departureTime} – {schedule.arrivalTime}
          </span>
          <span className="flex items-center gap-1">
            <Bus size={14} /> {schedule.busName}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {schedule.availableSeats} seats left
          </span>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:min-w-[140px]">
        <div className="text-right">
          <p className="text-xs text-gray-400">Per seat</p>
          <p className="text-xl font-extrabold text-brand-black">Rs. {schedule.basePrice}</p>
        </div>
        {soldOut ? (
          <Badge variant="danger">Sold Out</Badge>
        ) : (
          <Button as={Link} to={`/seats/${schedule.id}`} variant="accent" className="w-full sm:w-auto">
            Select Seats
          </Button>
        )}
      </div>
    </div>
  )
}
