// One-off Firestore seed script.
// Usage: SEED_EMAIL=<operator-email> SEED_PASSWORD=<password> node scripts/seed.mjs
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  getFirestore,
  collection,
  addDoc,
  writeBatch,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import pkg from 'nepali-date-converter'
import { SEAT_LAYOUT_CONFIG } from '../src/utils/seatLayout.js'

const NepaliDate = pkg.default

const firebaseConfig = {
  apiKey: 'AIzaSyA-4VdIahVddRU4o6yNhx-Uup6c1H25SSQ',
  authDomain: 'metroairbus.firebaseapp.com',
  projectId: 'metroairbus',
}

const email = process.env.SEED_EMAIL
const password = process.env.SEED_PASSWORD
if (!email || !password) {
  console.error('Set SEED_EMAIL and SEED_PASSWORD env vars (an operator/superadmin account).')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

await signInWithEmailAndPassword(auth, email, password)
console.log('Signed in as', email)

function adDateString(d) {
  return d.toISOString().slice(0, 10)
}

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const departureDateAD = adDateString(tomorrow)
const departureDateBS = new NepaliDate(tomorrow).format('YYYY-MM-DD')

// 1. Route
const routeRef = await addDoc(collection(db, 'routes'), {
  from: 'Kathmandu',
  to: 'Kakadvitta',
  fromCode: 'KTM',
  toCode: 'KKV',
  boardingPoints: [
    { name: 'Gongabu Bus Park', time: '03:00 PM' },
    { name: 'Balaju', time: '07:15 AM' },
    { name: 'Kalanki', time: '07:30 AM' },
  ],
  isActive: true,
  createdAt: serverTimestamp(),
})
console.log('Created route:', routeRef.id)

// 2. Buses
const bus1Ref = await addDoc(collection(db, 'buses'), {
  busName: 'New Metro VIP Sofa',
  busNumber: 'BA 1 KHA 1234',
  totalSeats: SEAT_LAYOUT_CONFIG.totalSeats,
  seatLayoutVersion: SEAT_LAYOUT_CONFIG.id,
  isActive: true,
  createdAt: serverTimestamp(),
})
console.log('Created bus 1:', bus1Ref.id)

const bus2Ref = await addDoc(collection(db, 'buses'), {
  busName: 'New Metro VIP Sofa',
  busNumber: 'BA 1 KHA 5678',
  totalSeats: SEAT_LAYOUT_CONFIG.totalSeats,
  seatLayoutVersion: SEAT_LAYOUT_CONFIG.id,
  isActive: true,
  createdAt: serverTimestamp(),
})
console.log('Created bus 2:', bus2Ref.id)

// 3. Schedule (tomorrow, using bus 1)
const scheduleRef = await addDoc(collection(db, 'schedules'), {
  routeId: routeRef.id,
  busId: bus1Ref.id,
  busName: 'New Metro VIP Sofa',
  busNumber: 'BA 1 KHA 1234',
  from: 'Kathmandu',
  to: 'Kakadvitta',
  departureDateAD,
  departureDateBS,
  departureTime: '03:00 PM',
  arrivalTime: '06:00 PM',
  basePrice: 2200,
  availableSeats: SEAT_LAYOUT_CONFIG.totalSeats,
  status: 'scheduled',
  createdAt: serverTimestamp(),
})
console.log('Created schedule:', scheduleRef.id, departureDateAD, '/', departureDateBS)

// 4. Seats subcollection (batch write)
const batch = writeBatch(db)
for (const seatId of SEAT_LAYOUT_CONFIG.allSeats) {
  const seatRef = doc(db, 'schedules', scheduleRef.id, 'seats', seatId)
  batch.set(seatRef, {
    seatId,
    status: 'available',
    bookedBy: null,
    bookingId: null,
    updatedAt: serverTimestamp(),
  })
}
await batch.commit()
console.log(`Created ${SEAT_LAYOUT_CONFIG.allSeats.length} seats for schedule ${scheduleRef.id}`)

console.log('\nSeed complete.')
console.log('Route ID:', routeRef.id)
console.log('Bus 1 ID:', bus1Ref.id)
console.log('Bus 2 ID:', bus2Ref.id)
console.log('Schedule ID:', scheduleRef.id)

process.exit(0)
