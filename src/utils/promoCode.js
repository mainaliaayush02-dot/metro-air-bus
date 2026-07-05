import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export async function lookupPromoCode(code) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null

  const snap = await getDocs(
    query(collection(db, 'promoCodes'), where('code', '==', normalized), where('isActive', '==', true))
  )
  if (snap.empty) return null

  const doc = snap.docs[0]
  return { id: doc.id, ...doc.data() }
}
