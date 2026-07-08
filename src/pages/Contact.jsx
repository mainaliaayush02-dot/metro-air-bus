import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react'
import SeoHead from '../seo/SeoHead'
import { COMPANY_CONFIG } from '../config/constants'

export default function Contact() {
  const whatsappHref = `https://wa.me/977${COMPANY_CONFIG.whatsappNumber}`

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SeoHead
        title={`Contact Us | ${COMPANY_CONFIG.name}`}
        description="Contact Metro Air Bus for VIP Sofa bus ticket bookings, inquiries, and support. Call, WhatsApp, or visit our Gongabu Bus Park office in Kathmandu."
        keywords="Metro Air Bus contact, Metro Air Bus phone number, Gongabu Bus Park office"
        canonical={`${COMPANY_CONFIG.domain}/contact`}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-black">Contact Us</h1>
        <p className="text-gray-500 mt-2">We're here to help with bookings, changes, and questions.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                <Phone size={18} />
              </div>
              <div>
                <h2 className="font-bold text-brand-black">Call Us</h2>
                {COMPANY_CONFIG.contacts.map((num) => (
                  <p key={num}>
                    <a href={`tel:+977${num}`} className="text-gray-600 hover:text-brand-orange">
                      {num}
                    </a>
                  </p>
                ))}
                <p>
                  <a href={`tel:+977${COMPANY_CONFIG.headOffice}`} className="text-gray-600 hover:text-brand-orange">
                    Head Office: {COMPANY_CONFIG.headOffice}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle size={18} />
              </div>
              <div>
                <h2 className="font-bold text-brand-black">WhatsApp</h2>
                <p className="text-gray-500 text-sm mb-2">Fastest way to reach us for booking help.</p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[#25D366] font-semibold hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                <MapPin size={18} />
              </div>
              <div>
                <h2 className="font-bold text-brand-black">Office & Boarding Point</h2>
                <p className="text-gray-600">{COMPANY_CONFIG.boardingPoint}</p>
                <a
                  href={COMPANY_CONFIG.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-brand-orange font-semibold hover:underline mt-1"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="font-bold text-brand-black">Daily Departure</h2>
                <p className="text-gray-600">Kathmandu ↔ Kakarbhitta — 03:00 PM daily</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md min-h-[400px]">
          <iframe
            title="Metro Air Bus location on Google Maps"
            src={COMPANY_CONFIG.mapEmbedUrl}
            className="w-full h-full min-h-[400px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  )
}
