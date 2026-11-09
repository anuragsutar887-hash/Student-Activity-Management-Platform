import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Award, BarChart3, CheckCircle, Eye, EyeOff, GraduationCap,
  Hash, Lock, LoaderCircle, Mail, Moon, Plus, Search, ShieldCheck, Sun, Trophy, UserCheck, UserCog, Building2,
} from 'lucide-react'
import ITPulseLogo from '../../components/ITPulseLogo.jsx'
import Modal from '../../components/Modal.jsx'
import { useAuth } from '../../context/authContextValue.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { getDepartments, getStudents, saveStudent, searchStudents } from '../../services/studentService.js'
import './Login.css'

const roles = [
  { id: 'student', label: 'Student', sub: 'PRN Auth', Icon: GraduationCap, badge: 'STUDENT PORTAL' },
  { id: 'staff', label: 'Staff', sub: 'Faculty / Coord', Icon: Building2, badge: 'FACULTY PORTAL' },
  { id: 'admin', label: 'Admin', sub: 'Dean / HOD', Icon: ShieldCheck, badge: 'ADMIN PORTAL' },
]

const dashboardPaths = {
  student: '/student/dashboard',
  staff: '/staff/dashboard',
  admin: '/admin/dashboard',
}

const inputClass = 'h-11 w-full rounded-xl border border-slate-200 dark:border-[#232940] bg-white dark:bg-[#141828] text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'

export default function Login() {
  const navigate = useNavigate()
  const { login, currentUser } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [role, setRole] = useState('student')
  const [searchQuery, setSearchQuery] = useState('')
  const [studentPickerOpen, setStudentPickerOpen] = useState(false)
  
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [prn, setPrn] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  // Registration modal state
  const [registerOpen, setRegisterOpen] = useState(false)
  const [regName, setRegName] = useState('')
  const [regRoll, setRegRoll] = useState('')
  const [regDept, setRegDept] = useState('Information Technology')
  const [regYear, setRegYear] = useState('1st Year')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regError, setRegError] = useState('')

  const allStudents = useMemo(() => getStudents(), [])
  const departments = getDepartments()

  // Search recommendations for student selection
  const recommendations = useMemo(() => {
    const query = searchQuery.trim()
    if (!query) return []
    return searchStudents(query).slice(0, 6)
  }, [searchQuery])

  // Directly land on the user's dashboard if already logged in
  if (currentUser) {
    const destination = dashboardPaths[String(currentUser.role).toLowerCase()] || '/student/dashboard'
    return <Navigate to={destination} replace />
  }

  function changeRole(nextRole) {
    if (nextRole === role) return
    setRole(nextRole)
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
    setStudentPickerOpen(false)
    setSearchQuery('')
    const effectivePrn = person.prn || person.default_prn || `PRN2024IT${String(person.roll_no).replace(/\D/g, '').padStart(3, '0')}`
    setPrn(effectivePrn)
    const autoEmail = person.email || `${String(person.prn || person.roll_no || 'student').toLowerCase()}@itpulse.edu`
    setEmail(autoEmail)
    setPassword(person.password || `Pass@${String(person.roll_no).replace(/\D/g, '').padStart(2, '0')}`)
    setErrors({})
  }

  function handlePrnChange(val) {
    setPrn(val)
    setErrors((curr) => ({ ...curr, prn: undefined }))
    
    // Automatically match student if PRN corresponds to a known student
    const clean = val.trim().toUpperCase()
    if (clean) {
      const match = allStudents.find((s) => 
        String(s.prn || '').toUpperCase() === clean || 
        String(s.default_prn || '').toUpperCase() === clean ||
        String(s.roll_no || '').toUpperCase() === clean ||
        (clean === '112103060' && String(s.roll_no).toUpperCase() === 'C60')
      )
      if (match) {
        setSelectedStudent(match)
        if (!password) {
          setPassword(match.password || `Pass@${String(match.roll_no).replace(/\D/g, '').padStart(2, '0')}`)
        }
      }
    }
  }

  // 1-Click Auto Fill Demo Accounts
  function autoFillDemo(type) {
    setErrors({})
    setNotice('')
    if (type === 'student') {
      setRole('student')
      const anurag = allStudents.find((s) => String(s.roll_no).toUpperCase() === 'C60') || {
        roll_no: 'C60',
        name: 'Sutar Anurag Dhanyakumar',
        email: 'c60@itpulse.edu',
        password: 'Pass@60',
        default_prn: 'PRN2024IT060',
      }
      setSelectedStudent(anurag)
      setPrn('112103060')
      setPassword('Pass@60')
    } else if (type === 'staff') {
      setRole('staff')
      setSelectedStudent(null)
      setEmail('faculty@itpulse.edu')
      setPassword('Teacher@IT2026!')
    } else if (type === 'admin') {
      setRole('admin')
      setSelectedStudent(null)
      setEmail('admin@itpulse.edu')
      setPassword('Admin@IT2026!')
    }
  }

  function executeLogin(targetStudent = selectedStudent) {
    setLoading(true)
    window.setTimeout(() => {
      try {
        const user = login({
          role,
          email: email.trim(),
          password: password,
          prn: prn.trim(),
          student: role === 'student' ? targetStudent : null,
          remember,
        })
        const destination = dashboardPaths[String(user?.role ?? role).toLowerCase()]
        if (!destination) throw new Error('Unknown role')
        navigate(destination, { replace: true })
      } catch (err) {
        setLoading(false)
        const msg = err?.message || 'Could not sign in to that portal. Please try again.'
        if (/prn/i.test(msg)) {
          setErrors({ prn: msg })
        } else if (/password/i.test(msg)) {
          setErrors({ password: msg })
        } else {
          setErrors({ form: msg })
        }
      }
    }, 300)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    let effectiveStudent = selectedStudent

    if (role === 'student') {
      const cleanPrn = prn.trim().toUpperCase()
      if (!cleanPrn) {
        nextErrors.prn = 'Permanent Registration Number (PRN) is compulsory.'
      } else if (!/^[A-Z0-9_-]{4,25}$/.test(cleanPrn)) {
        nextErrors.prn = 'Enter a valid alphanumeric PRN number (4–25 characters).'
      }

      // If no student explicitly selected from picker, resolve student by entered PRN / Roll
      if (!effectiveStudent && cleanPrn) {
        effectiveStudent = allStudents.find((s) => 
          String(s.prn || '').toUpperCase() === cleanPrn || 
          String(s.default_prn || '').toUpperCase() === cleanPrn ||
          String(s.roll_no || '').toUpperCase() === cleanPrn ||
          (cleanPrn === '112103060' && String(s.roll_no).toUpperCase() === 'C60')
        )
        if (effectiveStudent) {
          setSelectedStudent(effectiveStudent)
        } else {
          nextErrors.student = 'No student record found matching this PRN. Search or register your profile below.'
        }
      }

      if (!password) {
        nextErrors.password = 'Enter your student password.'
      }
    } else {
      if (!email.trim()) {
        nextErrors.email = 'Enter your institutional email address.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        nextErrors.email = 'Enter a valid institutional email address.'
      }
      if (!password) {
        nextErrors.password = 'Enter your password.'
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    executeLogin(effectiveStudent)
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

  const currentRoleConfig = roles.find((r) => r.id === role) || roles[0]

  return (
    <main className="login-scene relative min-h-screen px-4 py-6 sm:px-6 sm:py-8 flex flex-col justify-between">
      {/* Top Header Bar */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <ITPulseLogo size={32} className="shrink-0" />
          <span className="font-extrabold tracking-wider text-xs sm:text-sm text-slate-800 dark:text-slate-100">
            IT VERTEX <span className="text-[#d99a28] dark:text-[#f5b544]">&bull; PULSE</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-[#232940] bg-white/80 dark:bg-[#121524] px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] tracking-wide">NBA CRITERIA 9 VAULT</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-[#232940] bg-white dark:bg-[#121524] px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-amber-400/50 shadow-xs transition"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={13} className="text-amber-400" />
                <span className="text-[11px] text-amber-400 font-bold">Dark Mode</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-slate-600" />
                <span className="text-[11px] text-slate-700 font-bold">Light Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Authentication Card */}
      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#202538] bg-white dark:bg-[#111420] shadow-2xl shadow-slate-900/15 lg:grid-cols-[0.9fr_1.1fr]">
        
        {/* Left Side: Brand & Innovation Panel */}
        <aside className="login-brand-panel relative flex flex-col justify-between overflow-hidden p-8 text-white sm:p-10 lg:p-12">
          <div className="login-constellation" />

          <div className="relative z-10">
            {/* Top Logo Frame & Badge */}
            <div className="flex items-center gap-3">
              <ITPulseLogo size={46} className="shrink-0 drop-shadow-md" />
              <div>
                <span className="block text-sm font-black tracking-wider text-white uppercase">IT VERTEX</span>
                <span className="inline-block mt-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#f5b544] uppercase">
                  ACCREDITATION &bull; ACTIVITY ENGINE
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="mt-8">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black leading-[1.12] tracking-tight text-white">
                Where Innovation<br />
                Meets<br />
                <span className="text-[#f5b544]">Achievement.</span>
              </h1>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300/90 max-w-md">
                The unified academic management and activity verification portal for the Department of Information Technology. Built to seamlessly record, validate, and audit student milestones.
              </p>
            </div>

            {/* 3 Feature Showcase Cards */}
            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-[#f5b544]">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-bold text-white">Student Achievement Tracking</h2>
                      <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">AICTE / NBA</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-300/80 leading-normal">
                      Autonomous ledger tracking B.Tech Honors credits, hackathon wins, research papers, and technical certifications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Faculty Verification Hub</h2>
                    <p className="mt-0.5 text-[11px] text-slate-300/80 leading-normal">
                      Cryptographic hash verification and coordinator scrutiny rubrics with instantaneous 1-click batch accreditation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Institutional Analytics</h2>
                    <p className="mt-0.5 text-[11px] text-slate-300/80 leading-normal">
                      Real-time Criteria 9 compliance matrices, automated NAAC dossiers, and cohort activity telemetry exports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer */}
          <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <span className="tracking-widest uppercase font-semibold text-slate-300">CONNECT &bull; INNOVATE &bull; EXCEL</span>
            <span>&copy; 2025 IT VERTEX &bull; Dept. of IT</span>
          </div>
        </aside>

        {/* Right Side: Authentication Form */}
        <section className="flex flex-col justify-between p-6 sm:p-10 bg-white dark:bg-[#111420]">
          <div>
            {/* Form Top Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d99a28] dark:text-[#f5b544]">
                INSTITUTIONAL SECURITY
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-[#1b2034] px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {currentRoleConfig.badge}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Sign in to your IT VERTEX account to access your activity records.
              </p>
            </div>

            {/* Role Selection Grid */}
            <div className="mt-6">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                SELECT YOUR ROLE
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {roles.map(({ id, label, sub, Icon }) => {
                  const isSelected = role === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => changeRole(id)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                        isSelected
                          ? 'border-[#f5b544] bg-amber-50/70 dark:bg-amber-400/10 text-slate-900 dark:text-white shadow-xs ring-1 ring-amber-400/40'
                          : 'border-slate-200 dark:border-[#202538] bg-white dark:bg-[#141828] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#f5b544] shadow-[0_0_6px_rgba(245,181,68,0.8)]" />
                      )}
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        isSelected ? 'bg-[#f5b544] text-[#090b10] shadow-xs' : 'bg-slate-100 dark:bg-[#1e2338] text-slate-500 dark:text-slate-300'
                      }`}>
                        <Icon size={18} />
                      </span>
                      <span className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100">{label}</span>
                      <span className="text-[10px] text-slate-400">{sub}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Notification */}
            {errors.form && (
              <div role="alert" className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                {errors.form}
              </div>
            )}

            {/* Main Form Fields */}
            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              {role === 'student' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="login-prn" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Permanent Registration Number (PRN) <span className="text-rose-500 font-extrabold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setStudentPickerOpen((prev) => !prev)}
                      className="text-[11px] font-semibold text-[#d99a28] dark:text-[#f5b544] hover:underline"
                    >
                      {studentPickerOpen ? 'Hide Student List' : 'Search / Pick Student'}
                    </button>
                  </div>

                  <div className="relative">
                    <Hash size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-prn"
                      type="text"
                      placeholder="e.g. 112103060 or PRN2024IT060"
                      value={prn}
                      onChange={(e) => handlePrnChange(e.target.value)}
                      className={`${inputClass} pl-10 pr-4 uppercase font-mono`}
                    />
                  </div>

                  {/* Student Search Picker Drawer */}
                  {studentPickerOpen && (
                    <div className="mt-2 rounded-2xl border border-slate-200 dark:border-[#232940] bg-slate-50 dark:bg-[#141828] p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pick From 68 Enrolled Students:</span>
                        <button
                          type="button"
                          onClick={() => setRegisterOpen(true)}
                          className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1"
                        >
                          <Plus size={12} /> Register New
                        </button>
                      </div>
                      <div className="relative mb-2">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          placeholder="Search roll, name, or PRN..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 w-full rounded-lg border border-slate-200 dark:border-[#232940] bg-white dark:bg-[#0c0e17] pl-8 pr-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                        {(recommendations.length > 0 ? recommendations : allStudents.slice(0, 10)).map((s) => (
                          <button
                            key={s.roll_no}
                            type="button"
                            onClick={() => handleChooseStudent(s)}
                            className="flex w-full items-center justify-between rounded-lg p-1.5 text-left text-xs hover:bg-white dark:hover:bg-[#1c2238] transition"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                            <span className="text-[10px] font-mono text-amber-500">{s.roll_no}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-1 text-[10px] text-slate-400">
                    Validating against Department of Information Technology Cohort 2021-25.
                  </p>
                  {errors.prn && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.prn}</p>}
                  {errors.student && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.student}</p>}
                </div>
              ) : (
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {role === 'staff' ? 'Faculty Email' : 'Administrator Email'} <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder={role === 'staff' ? 'faculty@itpulse.edu' : 'admin@itpulse.edu'}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setErrors((curr) => ({ ...curr, email: undefined }))
                      }}
                      className={`${inputClass} pl-10 pr-4`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.email}</p>}
                </div>
              )}

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNotice('For password reset or credentials access, contact your Department Coordinator.')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-amber-500"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors((curr) => ({ ...curr, password: undefined }))
                    }}
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.password}</p>}
              </div>

              {notice && (
                <p className="rounded-lg border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                  {notice}
                </p>
              )}

              {/* Session / SSL Row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Remember my session (30 days)</span>
                </label>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={14} /> 256-bit SSL
                </span>
              </div>

              {/* Big CTA Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="login-submit flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Authenticating credentials...
                  </>
                ) : (
                  <>
                    Sign In to IT VERTEX &rarr;
                  </>
                )}
              </button>
            </form>

            {/* DEMO ACCOUNTS FOR TESTING (1-Click Auto Fill) */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#1f2538]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  DEMO ACCOUNTS FOR TESTING
                </span>
                <span className="text-[10px] font-bold text-[#d99a28] dark:text-[#f5b544]">
                  1-Click Auto Fill
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => autoFillDemo('student')}
                  className="demo-card rounded-xl border border-slate-200 dark:border-[#202538] bg-slate-50/70 dark:bg-[#141828] p-2.5 text-left focus:outline-none"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Anurag Sutar</p>
                  <p className="text-[10px] font-mono text-[#d99a28] dark:text-[#f5b544] truncate">PRN: 112103060</p>
                  <p className="text-[9px] text-slate-400 truncate">B.Tech IT &bull; Div C</p>
                </button>

                <button
                  type="button"
                  onClick={() => autoFillDemo('staff')}
                  className="demo-card rounded-xl border border-slate-200 dark:border-[#202538] bg-slate-50/70 dark:bg-[#141828] p-2.5 text-left focus:outline-none"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Dr. Deshmukh</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">deshmukh.pk@it...</p>
                  <p className="text-[9px] text-slate-400 truncate">Dept. Coordinator</p>
                </button>

                <button
                  type="button"
                  onClick={() => autoFillDemo('admin')}
                  className="demo-card rounded-xl border border-slate-200 dark:border-[#202538] bg-slate-50/70 dark:bg-[#141828] p-2.5 text-left focus:outline-none"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Dean Office</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">admin.hod@it...</p>
                  <p className="text-[9px] text-slate-400 truncate">Admin Authority</p>
                </button>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1f2538] flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="hover:text-amber-500 transition"
            >
              Trouble logging in? Contact <span className="font-semibold underline">IT Helpdesk</span>
            </button>
            <span className="font-mono text-[10px]">v4.2.0 &bull; Supabase Auth v2</span>
          </div>
        </section>
      </div>

      {/* Help Modal */}
      {helpOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="help-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#121522] border border-[#232940] p-6 shadow-2xl text-slate-100">
            <h3 id="help-dialog-title" className="text-base font-bold text-white">IT Helpdesk &amp; Account Support</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              For assistance with your PRN number, student record binding, password resets, or department credentials:
            </p>
            <div className="mt-3 rounded-xl bg-[#161b2e] p-3 text-xs space-y-1 font-mono text-slate-300">
              <p>Email: <span className="text-amber-400">helpdesk.it@itpulse.edu</span></p>
              <p>Coordinator: <span className="text-amber-400">Dr. P. K. Deshmukh</span></p>
              <p>Office: IT Department Room 304</p>
            </div>
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="mt-5 w-full rounded-xl bg-[#f5b544] text-[#090b10] py-2 text-xs font-bold hover:bg-[#e5a83b]"
            >
              Close Helpdesk
            </button>
          </div>
        </div>
      )}

      {/* Student Self-Registration Modal */}
      <Modal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register Student Profile"
      >
        <form onSubmit={handleRegisterStudent} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add your profile to the Department of Information Technology database.
          </p>
          {regError && <p className="text-xs text-rose-600 font-semibold">{regError}</p>}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Anurag Sutar"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Roll No / PRN</label>
              <input
                type="text"
                required
                placeholder="e.g. C69 or 112103069"
                value={regRoll}
                onChange={(e) => setRegRoll(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Academic Year</label>
              <select
                value={regYear}
                onChange={(e) => setRegYear(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-400"
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
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-400"
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
              placeholder="student@itpulse.edu"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Phone (Optional)</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-400"
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
              className="rounded-xl bg-[#f5b544] text-[#090b10] px-4 py-2 text-xs font-bold hover:bg-[#e5a83b]"
            >
              Save &amp; Select
            </button>
          </div>
        </form>
      </Modal>
    </main>
  )
}
