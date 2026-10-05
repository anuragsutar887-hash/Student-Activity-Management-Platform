import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { registerStudentPrn } from './studentService.js'

// ==============================================================================
// AUTHORIZED SINGLE ACCOUNTS (Strict Single Credentials)
// These credentials are NOT displayed on the website.
// ==============================================================================
export const AUTHORIZED_STAFF = {
  id: 201,
  name: 'Prof. Faculty Coordinator',
  email: 'faculty@itpulse.edu',
  allowedEmails: ['faculty@itpulse.edu', 'teacher@itpulse.edu', 'staff@itpulse.edu'],
  password: 'Teacher@IT2026!',
  department: 'Information Technology',
  designation: 'Department Activity Coordinator',
  role: 'staff',
}

export const AUTHORIZED_ADMIN = {
  id: 1,
  name: 'System Administrator',
  email: 'admin@itpulse.edu',
  allowedEmails: ['admin@itpulse.edu'],
  password: 'Admin@IT2026!',
  department: 'Information Technology',
  designation: 'Head Administrator',
  role: 'admin',
}

/**
 * Async login flow (Supabase Auth fallback or portal session)
 */
export async function loginUser({ role, email, password, student, prn }) {
  const normalizedRole = (role || 'student').toLowerCase()

  // Supabase Auth verification if configured
  if (isSupabaseConfigured() && supabase && email && password) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!authError && authData.user) {
        if (normalizedRole === 'student') {
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .single()
          if (studentData) return { ...studentData, role: 'student', authId: authData.user.id }
        } else if (normalizedRole === 'staff') {
          const { data: staffData } = await supabase
            .from('staff')
            .select('*')
            .eq('email', email)
            .single()
          if (staffData) return { ...staffData, role: 'staff', authId: authData.user.id }
        }
      }
    } catch (err) {
      console.warn('Supabase Auth error, using local portal authentication:', err)
    }
  }

  // Use portal validation
  return mockLogin({ role, email, password, student, prn })
}

/**
 * Synchronous portal authentication with strict verification:
 * - Student: Compulsory PRN number verification + Password check
 * - Staff: Strictly only 1 authorized faculty account
 * - Admin: Strictly only 1 authorized admin account
 */
export function mockLogin(credentials) {
  const normalizedRole = (credentials.role || 'student').toLowerCase()

  // ── 1. STUDENT AUTHENTICATION ──────────────────────────────────────────
  if (normalizedRole === 'student') {
    const student = credentials.student
    if (!student) {
      throw new Error('Please search and select your student profile first.')
    }

    // Compulsory PRN number verification
    const enteredPrn = String(credentials.prn || '').trim().toUpperCase()
    if (!enteredPrn) {
      throw new Error('PRN number is compulsory for student sign in.')
    }

    // Must be a valid alphanumeric string (letters, numbers, hyphens, underscores)
    if (!/^[A-Z0-9_\-]{4,25}$/.test(enteredPrn)) {
      throw new Error('Please enter a valid PRN number (letters & numbers, 4–25 characters, e.g. PRN2024IT001 or 72214568K).')
    }

    const registeredPrn = String(student.prn || '').trim().toUpperCase()
    const defaultPrn = String(student.default_prn || `PRN2024IT${String(student.roll_no).replace(/\D/g, '').padStart(3, '0')}`).toUpperCase()

    let effectivePrn = registeredPrn || defaultPrn

    if (enteredPrn === registeredPrn || enteredPrn === defaultPrn) {
      effectivePrn = enteredPrn
    } else {
      // If student enters their custom institute/university PRN, bind it to their profile
      try {
        const updated = registerStudentPrn(student.roll_no, enteredPrn)
        effectivePrn = updated.prn
      } catch (err) {
        throw new Error(err.message || 'PRN validation failed.')
      }
    }

    // Password verification
    const enteredPassword = String(credentials.password || '')
    if (!enteredPassword) {
      throw new Error('Please enter your student password.')
    }

    if (student.password && enteredPassword !== student.password) {
      throw new Error('Incorrect password. Please enter your valid student password.')
    }

    return {
      ...student,
      id: student.roll_no,
      roll_no: student.roll_no,
      prn: effectivePrn,
      name: student.name,
      role: 'student',
      department: student.department || 'Information Technology',
      year: student.year || '2nd Year',
      email: student.email || `${effectivePrn.toLowerCase()}@itpulse.edu`,
    }
  }

  // ── 2. STAFF / TEACHER AUTHENTICATION (Single Authorized Account) ──────
  if (normalizedRole === 'staff') {
    const enteredEmail = String(credentials.email || '').trim().toLowerCase()
    const enteredPassword = String(credentials.password || '')

    if (!enteredEmail) {
      throw new Error('Please enter faculty email address.')
    }
    if (!enteredPassword) {
      throw new Error('Please enter faculty password.')
    }

    const isEmailValid = AUTHORIZED_STAFF.allowedEmails.some((e) => e.toLowerCase() === enteredEmail)
    const isPasswordValid = enteredPassword === AUTHORIZED_STAFF.password

    if (!isEmailValid || !isPasswordValid) {
      throw new Error('Invalid teacher credentials. Access is restricted to authorized faculty only.')
    }

    return {
      ...AUTHORIZED_STAFF,
      email: enteredEmail,
    }
  }

  // ── 3. ADMIN AUTHENTICATION (Single Authorized Account) ────────────────
  if (normalizedRole === 'admin') {
    const enteredEmail = String(credentials.email || '').trim().toLowerCase()
    const enteredPassword = String(credentials.password || '')

    if (!enteredEmail) {
      throw new Error('Please enter administrator email address.')
    }
    if (!enteredPassword) {
      throw new Error('Please enter administrator password.')
    }

    const isEmailValid = AUTHORIZED_ADMIN.allowedEmails.some((e) => e.toLowerCase() === enteredEmail)
    const isPasswordValid = enteredPassword === AUTHORIZED_ADMIN.password

    if (!isEmailValid || !isPasswordValid) {
      throw new Error('Invalid administrator credentials. Access is restricted to authorized administrator only.')
    }

    return {
      ...AUTHORIZED_ADMIN,
      email: enteredEmail,
    }
  }

  throw new Error('Unknown portal role requested.')
}

export function clearMockSession() {
  try {
    localStorage.removeItem('student-activity-user')
    sessionStorage.removeItem('student-activity-user')
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.signOut().catch(() => {})
    }
  } catch {
    // storage catch
  }
}
