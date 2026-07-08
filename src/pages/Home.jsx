import { Armchair, Wind, Zap } from 'lucide-react'
import SeoHead from '../seo/SeoHead'
import SearchForm from '../components/SearchForm'
import { COMPANY_CONFIG } from '../config/constants'

const FEATURES = [
  {
    icon: Armchair,
    title: 'VIP Recliner Seats',
    description: 'Spacious sofa-style recliner seats designed for long-distance comfort on every journey.',
  },
  {
    icon: Wind,
    title: 'AC & Clean Bus',
    description: 'Fully air-conditioned, regularly sanitized buses for a comfortable and hygienic ride.',
  },
  {
    icon: Zap,
    title: 'Real-Time Booking',
    description: 'See live seat availability and book instantly — no waiting, no overbooking.',
  },
]

export default function Home() {
  return (
    <div>
      <SeoHead
        title="Metro Air Bus | Kathmandu to Kakarbhitta VIP Sofa Bus Tickets"
        description="Book Metro Air Bus tickets online. Kathmandu to Kakarbhitta and Kakarbhitta to Kathmandu VIP Sofa bus. Comfortable recliner seats. Easy online booking."
        keywords="Kathmandu to Kakarbhitta bus, Kakarbhitta to Kathmandu bus, Metro Air Bus ticket, VIP sofa bus Nepal, online bus booking Nepal"
        canonical={COMPANY_CONFIG.domain}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TravelAgency',
          name: 'Metro Air Bus',
          description: 'VIP Sofa Bus Service from Kathmandu to Kakarbhitta',
          url: COMPANY_CONFIG.domain,
          telephone: '+977-014981375',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Gongabu Bus Park',
            addressLocality: 'Kathmandu',
            addressCountry: 'NP',
          },
          areaServed: ['Kathmandu', 'Kakarbhitta'],
          makesOffer: {
            '@type': 'Offer',
            priceCurrency: 'NPR',
            price: '2200',
            itemOffered: {
              '@type': 'BusTrip',
              name: 'Kathmandu to Kakarbhitta VIP Sofa Bus',
              provider: { '@type': 'Organization', name: 'Metro Air Bus' },
              departureBusStop: { '@type': 'BusStop', name: 'Gongabu Bus Park, Kathmandu' },
              arrivalBusStop: { '@type': 'BusStop', name: 'Kakarbhitta' },
              departureTime: '15:00',
            },
          },
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-yellow to-brand-orange">
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-black leading-tight">
              METRO AIR BUS
            </h1>
            <p className="mt-3 text-lg font-semibold text-brand-black/80">
              Nepal ko Premium VIP Sofa Bus
            </p>
            <p className="mt-1 text-brand-black/70">
              Kathmandu ↔ Kakarbhitta | Comfortable. On Time. Every Time.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <img
              src="/busphoto3.jpg"
              alt="Metro Air Bus VIP Sofa bus exterior"
              className="w-full max-w-md rounded-2xl shadow-xl border-4 border-white/40 object-cover aspect-[4/3]"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-16 lg:pb-20 -mt-4 lg:-mt-6">
          <SearchForm />
        </div>
      </section>

      {/* Why Metro Air Bus */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black text-center mb-10">
          Why Metro Air Bus
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                <Icon size={28} />
              </div>
              <h3 className="font-bold text-brand-black mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inside our bus */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <img
            src="/seatphoto.jpeg"
            alt="Metro Air Bus VIP Sofa recliner seats interior"
            className="w-full rounded-2xl shadow-lg border border-gray-200 object-cover aspect-[4/3]"
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black mb-4">
              Inside Our VIP Sofa Bus
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Sink into plush maroon sofa-style recliners with individual reading lights,
              personal fans, and curtained windows. Every Metro Air Bus VIP Sofa seat is
              designed for a relaxed, premium overnight journey between Kathmandu and
              Kakarbhitta.
            </p>
          </div>
        </div>
      </section>

      {/* Route info */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black text-center mb-10">
            Our Route
          </h2>
          <div className="max-w-xl mx-auto bg-gray-50 rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center justify-between text-lg font-bold text-brand-black">
              <span>Kathmandu</span>
              <span className="text-brand-orange">→</span>
              <span>Kakarbhitta</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-gray-400">Departure</p>
                <p className="font-semibold text-brand-black">03:00 PM</p>
              </div>
              <div>
                <p className="text-gray-400">Est. Arrival</p>
                <p className="font-semibold text-brand-black">06:00 PM</p>
              </div>
              <div>
                <p className="text-gray-400">Price</p>
                <p className="font-semibold text-brand-black">Rs. 2200</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-brand-black mb-3">
          Kathmandu to Kakarbhitta Bus Booking
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Metro Air Bus operates daily VIP Sofa bus service from Kathmandu (Gongabu Bus Park)
          to Kakarbhitta. Book your Kathmandu to Kakarbhitta bus ticket online and get instant
          e-ticket confirmation. Our buses depart daily at 3:00 PM from Gongabu Bus Park.
        </p>

        <h2 className="text-2xl font-extrabold text-brand-black mt-8 mb-3">
          Kakarbhitta to Kathmandu Bus
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Metro Air Bus also operates a daily return VIP Sofa bus service from Kakarbhitta to
          Kathmandu. Book your Kakarbhitta to Kathmandu bus ticket online in advance to secure
          your preferred recliner seat and enjoy a comfortable journey back to the capital.
        </p>
      </section>
    </div>
  )
}
