import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight, CheckCircle, Database, Eye, EyeOff, GraduationCap,
  LockKeyhole, LoaderCircle, Mail, Plus, Search, ShieldCheck, UserCheck, UserCog,
} from 'lucide-react'
import ITPulseLogo from '../../components/ITPulseLogo.jsx'
import Modal from '../../components/Modal.jsx'
import { useAuth } from '../../context/authContextValue.js'
import { getDepartments, saveStudent, searchStudents } from '../../services/studentService.js'
import { isSupabaseConfigured } from '../../lib/supabase.js'
import './Login.css'

const roles = [
  { id: 'student', label: 'STUDENT', Icon: GraduationCap, badge: 'Student Portal' },
  { id: 'staff', label: 'STAFF', Icon: UserCog, badge: 'Faculty Portal' },
  { id: 'admin', label: 'ADMIN', Icon: ShieldCheck, badge: 'Admin Portal' },
]

const dashboardPaths = {
  student: '/student/dashboard',
  staff: '/staff/dashboard',
  admin: '/admin/dashboard',
}

const inputClass = 'h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
}

export default function Login() {
  const navigate = useNavigate()
  const { login, currentUser } = useAuth()

  // Directly land on the user's dashboard if already logged in (never stay on /login)
  if (currentUser) {
    const destination = dashboardPaths[String(currentUser.role).toLowerCase()] || '/student/dashboard'
    return <Navigate to={destination} replace />
  }
  const [role, setRole] = useState('student')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [prn, setPrn] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [flipCount, setFlipCount] = useState(0)

  // Registration modal state
  const [registerOpen, setRegisterOpen] = useState(false)
  const [regName, setRegName] = useState('')
  const [regRoll, setRegRoll] = useState('')
  const [regDept, setRegDept] = useState('Information Technology')
  const [regYear, setRegYear] = useState('1st Year')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regError, setRegError] = useState('')

  const supabaseConnected = isSupabaseConfigured()
  const departments = getDepartments()

  // Search recommendations: ONLY when search query is typed
  const recommendations = useMemo(() => {
    const query = searchQuery.trim()
    if (!query) return []
    const list = searchStudents(query)
    return list.slice(0, 8)
  }, [searchQuery])

  function changeRole(nextRole) {
    if (nextRole === role) return
    setRole(nextRole)
    setFlipCount((prev) => prev + 1)
    setErrors({})
    setNotice('')
    setSearchQuery('')
    setSelectedStudent(null)
    setPrn('')
    setEmail('')
    setPassword('')
  }

  function handleChooseStudent(person) {
    setSelectedStudent(person)
    setFlipCount((prev) => prev + 1)
    setSearchQuery('')
    setPrn('')
    const autoEmail = person.email || `${String(person.prn || person.roll_no || 'student').toLowerCase()}@itpulse.edu`
    setEmail(autoEmail)
    setPassword('')
    setErrors({})
  }

  function handleResetStudent() {
    setSelectedStudent(null)
    setFlipCount((prev) => prev + 1)
    setSearchQuery('')
    setPrn('')
    setEmail('')
    setPassword('')
    setErrors({})
  }

  function handleRegisterStudent(e) {
    e.preventDefault()
    if (!regName.trim() || !regRoll.trim() || !regEmail.trim()) {
      setRegError('Please provide your name, roll number, and email address.')
      return
    }

    const created = saveStudent({
      name: regName.trim(),
      roll_no: regRoll.trim(),
      department: regDept,
      year: regYear,
      email: regEmail.trim(),
      phone: regPhone.trim(),
      status: 'Active',
    })

    setRegisterOpen(false)
    setRegName('')
    setRegRoll('')
    setRegEmail('')
    setRegPhone('')
    setRegError('')
    handleChooseStudent(created)
  }

  function executeLogin() {
    setLoading(true)
    window.setTimeout(() => {
      try {
        const user = login({
          role,
          email: email.trim(),
          password: password,
          prn: prn.trim(),
          student: role === 'student' ? selectedStudent : null,
          remember,
        })
        const destination = dashboardPaths[String(user?.role ?? role).toLowerCase()]
        if (!destination) throw new Error('Unknown role')
        navigate(destination, { replace: true })
      } catch (err) {
        setLoading(false)
        setErrors({ form: err?.message || 'Could not sign in to that portal. Please try again.' })
      }
    }, 350)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (role === 'student') {
      if (!selectedStudent) {
        nextErrors.student = 'Please search and select your student profile first.'
      }
      if (!prn.trim()) {
        nextErrors.prn = 'PRN number is compulsory for student sign in.'
      } else if (!/^[a-zA-Z0-9_\-]{4,25}$/.test(prn.trim())) {
        nextErrors.prn = 'Enter a valid PRN number (letters & numbers, 4–25 characters, e.g. PRN2024IT001 or 72214568K).'
      }
      if (!password) {
        nextErrors.password = 'Enter your password.'
      }
    } else {
      if (!email.trim()) {
        nextErrors.email = 'Enter your email address.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        nextErrors.email = 'Enter a valid email address.'
      }
      if (!password) {
        nextErrors.password = 'Enter your password.'
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    executeLogin()
  }

  return (
    <main className="login-scene relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div className="login-decoration login-decoration-teal" />
      <div className="login-decoration login-decoration-cyan" />
      <div className="login-decoration login-decoration-navy" />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Brand Side Panel */}
        <aside className="login-brand-panel relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex lg:p-12">
          <div className="brand-shape brand-shape-one" />
          <div className="brand-shape brand-shape-two" />
          
          <div className="relative z-10 flex items-center gap-3">
            <ITPulseLogo size={46} className="shrink-0 drop-shadow-md" />
            <div>
              <span className="block text-sm font-extrabold tracking-wide">IT Pulse</span>
              <span className="block text-[11px] text-indigo-200 tracking-wider">STUDENT ACTIVITY SYSTEM</span>
            </div>
          </div>

          <div className="relative z-10 my-8">
            <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
              Student Activity &amp; Achievement Platform
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-indigo-100/90">
              Collect, verify, and monitor student co-curricular, technical, and achievement portfolios with role-based faculty verification.
            </p>

            <div className="mt-8 space-y-3.5 text-sm text-slate-100">
              {[
                'Search & Track Student Activity Portfolios',
                'Faculty Coordinator Verification & Review',
                'Administrator Oversight & Activity Analytics',
              ].map((feature) => (
                <p key={feature} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-300 shrink-0" />
                  <span>{feature}</span>
                </p>
              ))}
            </div>
          </div>
        </aside>

        {/* Form Panel */}
        <section className="flex items-center justify-center px-5 py-8 sm:px-9 lg:px-12 lg:py-10">
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between lg:hidden">
                <div className="flex items-center gap-3">
                  <ITPulseLogo size={42} className="shrink-0" />
                  <div>
                    <span className="block text-sm font-bold text-slate-900">IT Pulse</span>
                    <span className="block text-xs text-slate-500">TRACK · VERIFY · GROW</span>
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Account Access</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Sign In to Your Account</h2>
              <p className="mt-1 text-sm text-slate-500">Select your role to access your dedicated dashboard.</p>
            </div>

            {/* Role Selection */}
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Select Role</legend>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {roles.map(({ id, label, Icon, badge }) => {
                  const selected = role === id
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => changeRole(id)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 sm:p-4 ${
                        selected
                          ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 shadow-md ring-2 ring-indigo-600/25 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.01]'
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                          selected ? 'bg-indigo-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon size={22} />
                      </span>
                      <span className="mt-2 text-xs font-bold tracking-wide">{label}</span>
                      <span className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">{badge}</span>
                      {selected && (
                        <CheckCircle size={16} className="absolute right-2.5 top-2.5 text-indigo-700 dark:text-indigo-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {/* Flip Card Viewport */}
            <div className="login-flip-viewport mt-6">
              <div
                key={`flip-card-${role}-${selectedStudent ? selectedStudent.id : 'search'}-${flipCount}`}
                className="login-flip-card rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm sm:p-6"
              >
              {/* STUDENT ROLE: Search first, and only after selection show login */}
              {role === 'student' && (
                <section className="mb-5 space-y-4" aria-label="Student name search">
                  {/* Search Input Box — hidden once student selected */}
                  {!selectedStudent && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="student-search-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Search Your Name
                        </label>
                        <button
                          type="button"
                          onClick={() => setRegisterOpen(true)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                        >
                          <Plus size={14} /> Register New Student
                        </button>
                      </div>
                      <div className="relative">
                        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                          id="student-search-input"
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`${inputClass} pl-10 pr-4`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Matching Recommendations */}
                  {!selectedStudent && searchQuery.trim().length > 0 && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 shadow-xs">
                      <div className="mb-2 flex items-center justify-between px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Matching Students ({recommendations.length}):
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Click name to select</span>
                      </div>

                      {recommendations.length > 0 ? (
                        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                          {recommendations.map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => handleChooseStudent(person)}
                              className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-left transition hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                                  {initials(person.name)}
                                </span>
                                <div className="min-w-0">
                                  <span className="block truncate text-sm font-bold text-slate-900 dark:text-slate-100">{person.name}</span>
                                  <span className="block text-xs text-slate-500 dark:text-slate-400">Roll: {person.roll_no} · {person.year}</span>
                                </div>
                              </div>
                              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                <UserCheck size={13} /> Select
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                          <p>No students found matching &quot;{searchQuery}&quot;.</p>
                          <button
                            type="button"
                            onClick={() => setRegisterOpen(true)}
                            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                          >
                            <Plus size={13} /> Register Your Student Profile
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Guidance message when not searched yet */}
                  {!selectedStudent && searchQuery.trim().length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      <Search size={22} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Search to select your student profile</p>
                      <p className="mt-1 text-slate-400 dark:text-slate-500">
                        Type your name or roll number above to find your account.
                      </p>
                    </div>
                  )}

                  {/* Selected Student Card */}
                  {selectedStudent && (
                    <div className="rounded-2xl border-2 border-indigo-500/40 dark:border-indigo-500/60 bg-indigo-50/60 dark:bg-indigo-950/40 p-3.5 shadow-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-sm font-bold text-white shadow-xs">
                            {initials(selectedStudent.name)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">{selectedStudent.name}</p>
                              <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                                Selected
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                              Class Roll No: <span className="font-bold text-slate-900 dark:text-slate-100">{selectedStudent.roll_no}</span> · {selectedStudent.year}
                            </p>
                            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold mt-0.5">
                              Enter your PRN number below to verify &amp; access account
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetStudent}
                          className="shrink-0 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.student && <p className="text-xs text-rose-600">{errors.student}</p>}
                </section>
              )}

              {/* STAFF & ADMIN: Clean banner */}
              {role !== 'student' && (
                <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-700 text-white font-bold">
                      {role === 'staff' ? <UserCog size={18} /> : <ShieldCheck size={18} />}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {role === 'staff' ? 'Staff Sign In' : 'Admin Sign In'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {role === 'staff'
                          ? 'Activity Verification & Review Portal'
                          : 'Institutional Administration & Analytics Portal'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Form */}
              {(role !== 'student' || selectedStudent) && (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {errors.form && (
                    <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {errors.form}
                    </p>
                  )}

                  {role === 'student' ? (
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label htmlFor="login-prn" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          PRN number <span className="text-rose-500 font-extrabold">*Compulsory</span>
                        </label>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">University / Institute PRN</span>
                      </div>
                      <div className="relative">
                        <GraduationCap size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                          id="login-prn"
                          type="text"
                          value={prn}
                          onChange={(e) => {
                            setPrn(e.target.value)
                            setErrors((curr) => ({ ...curr, prn: undefined }))
                          }}
                          className={`${inputClass} pl-10 pr-4 uppercase`}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Enter your unique PRN number</p>
                      {errors.prn && <p className="mt-1 text-xs text-rose-600">{errors.prn}</p>}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="login-email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        {role === 'staff' ? 'Faculty Email' : 'Administrator Email'}
                      </label>
                      <div className="relative">
                        <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setErrors((curr) => ({ ...curr, email: undefined }))
                          }}
                          className={`${inputClass} pl-10 pr-4`}
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                    </div>
                  )}

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Password <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setErrors((curr) => ({ ...curr, password: undefined }))
                        }}
                        className={`${inputClass} pl-10 pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 accent-indigo-700"
                      />
                      Remember this session
                    </label>
                    <button
                      type="button"
                      onClick={() => setNotice('To reset credentials, contact your system administrator or faculty coordinator.')}
                      className="font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {notice && (
                    <p role="status" className="rounded-lg border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-2 text-xs text-indigo-800 dark:text-indigo-300">
                      {notice}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-submit flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-75"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Signing in as {role.toUpperCase()}...
                      </>
                    ) : (
                      <>
                        Sign In as {role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : 'Student'}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Student Registration Modal */}
      <Modal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register Student Profile"
      >
        <form onSubmit={handleRegisterStudent} className="space-y-4">
          <p className="text-xs text-slate-500">
            Create a real student profile. Your records will be stored directly in the database.
          </p>
          {regError && <p className="text-xs text-rose-600">{regError}</p>}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Full Name</label>
            <input
              type="text"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Roll No / PRN</label>
              <input
                type="text"
                required
                value={regRoll}
                onChange={(e) => setRegRoll(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Year</label>
              <select
                value={regYear}
                onChange={(e) => setRegYear(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600"
              >
                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Department</label>
            <select
              value={regDept}
              onChange={(e) => setRegDept(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Email Address</label>
            <input
              type="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Phone (Optional)</label>
            <input
              type="tel"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRegisterOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Save &amp; Select
            </button>
          </div>
        </form>
      </Modal>
    </main>
  )
}
