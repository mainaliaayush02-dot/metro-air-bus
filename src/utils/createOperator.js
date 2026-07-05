import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, firebaseConfig } from '../lib/firebase'

// Creating a user with the client SDK signs in as that new user on whichever
// auth instance performs the call. We use a throwaway secondary app instance
// so the superadmin's own session in the main app is never touched.
export async function createOperatorAccount({ name, email, phone, password }) {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`)
  const secondaryAuth = getAuth(secondaryApp)

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)

    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      phone,
      role: 'operator',
      isActive: true,
      createdAt: serverTimestamp(),
    })

    await signOut(secondaryAuth)
    return cred.user.uid
  } finally {
    await deleteApp(secondaryApp)
  }
}
