import { useMemo, useState } from 'react'
import { AuthContext } from './authContextValue.js'
import { clearMockSession, mockLogin } from '../services/authService.js'

const storageKey = 'student-activity-user'

function readStoredUser() {
  try {
    // Always prefer localStorage (persistent across browser sessions)
    const value = localStorage.getItem(storageKey)
    if (!value) return null;
    try {
      const u = JSON.parse(value);
      if (u && u.year === '3rd Year') {
        u.year = '2nd Year';
        localStorage.setItem(storageKey, JSON.stringify(u));
      }
      return u;
    } catch { return null; }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readStoredUser)

  function login(credentials) {
    const user = mockLogin(credentials)
    setCurrentUser(user)
    try {
      // Always persist to localStorage — session stays until explicit logout
      localStorage.setItem(storageKey, JSON.stringify(user))
      sessionStorage.removeItem(storageKey)
    } catch {
      // In-memory fallback when storage is unavailable
    }
    return user
  }

  function updateUser(updates) {
    setCurrentUser((prev) => {
      if (!prev) return null
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch (err) {
        void err
      }
      return next
    })
  }

  function logout() {
    setCurrentUser(null)
    clearMockSession()
  }

  const value = useMemo(() => ({
    currentUser,
    role: currentUser?.role ?? null,
    selectedStudent: currentUser?.role === 'student' ? currentUser : null,
    login,
    updateUser,
    logout,
    getCurrentUser: () => currentUser,
  }), [currentUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
