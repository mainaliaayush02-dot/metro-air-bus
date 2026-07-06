import { useSearchParams } from 'react-router-dom'
import { useSchedules } from '../hooks/useSchedules'
import ScheduleCard from '../components/ScheduleCard'
import SearchForm from '../components/SearchForm'
import SeoHead from '../seo/SeoHead'
import Spinner from '../components/ui/Spinner'
import { formatDualDate } from '../utils/adToBs'
import { COMPANY_CONFIG } from '../config/constants'

export default function SearchResults() {
  const [params] = useSearchParams()
  const from = params.get('from') || 'Kathmandu'
  const to = params.get('to') || 'Kakarbhitta'
  const date = params.get('date') || ''

  const { schedules, loading } = useSchedules({ from, to, date })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SeoHead
        title={`${from} to ${to} Bus on ${date} | ${COMPANY_CONFIG.name}`}
        description={`Find and book Metro Air Bus VIP Sofa buses from ${from} to ${to}. Live seat availability, instant e-ticket.`}
        keywords={`${from} to ${to} bus, Metro Air Bus schedule, bus booking Nepal`}
        canonical={`${COMPANY_CONFIG.domain}/search`}
      />

      <div className="mb-6">
        <SearchForm initialFrom={from} initialTo={to} initialDate={date} />
      </div>

      <h1 className="text-xl font-bold text-brand-black mb-1">
        {from} → {to}
      </h1>
      {date && <p className="text-sm text-gray-500 mb-6">{formatDualDate(date)}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          No buses found for this route and date. Try a different date.
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  )
}
