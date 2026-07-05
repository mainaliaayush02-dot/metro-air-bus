import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        const data = snap.exists() ? snap.data() : null
        if (data && data.isActive === false) {
          await signOut(auth)
          setUser(null)
          setUserDoc(null)
          setLoading(false)
          return
        }
        setUser(firebaseUser)
        setUserDoc(data)
      } else {
        setUser(null)
        setUserDoc(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const role = userDoc?.role || 'passenger'
  const isOperator = role === 'operator' || role === 'superadmin'
  const isSuperAdmin = role === 'superadmin'

  return (
    <AuthContext.Provider value={{ user, userDoc, role, isOperator, isSuperAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
