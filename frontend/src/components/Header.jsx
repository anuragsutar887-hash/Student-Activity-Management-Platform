import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Tags,
  User,
  UserCog,
  Users,
  X,
  Moon,
} from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContextValue.js'
import { useTheme } from '../context/ThemeContext.jsx'
import ITPulseLogo from './ITPulseLogo.jsx'

const NAV_ITEMS_BY_ROLE = {
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Add Activity', to: '/student/activity/add', icon: PlusCircle },
    { label: 'My Activities', to: '/student/activities', icon: ClipboardList },
  ],
  staff: [
    { label: 'Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Submissions', to: '/staff/submissions', icon: ClipboardList },
    { label: 'Pending', to: '/staff/pending', icon: PlusCircle },
    { label: 'Verified', to: '/staff/verified', icon: FileCheck2 },
    { label: 'Students', to: '/staff/students', icon: Search },
    { label: 'Documents', to: '/staff/documents', icon: FileText },
    { label: 'Reports', to: '/staff/reports', icon: BarChart3 },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', to: '/admin/students', icon: Users },
    { label: 'Staff', to: '/admin/staff', icon: UserCog },
    { label: 'Categories', to: '/admin/categories', icon: Tags },
    { label: 'Activities', to: '/admin/activities', icon: ClipboardList },
    { label: 'Verification', to: '/admin/verification', icon: FileCheck2 },
    { label: 'Documents', to: '/admin/documents', icon: FileText },
    { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ],
}

export default function Header({ title = 'Dashboard' }) {
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const profileRef = useRef(null)

  const [readNotifications, setReadNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('student-activity-read-notifications') ?? '[]') }
    catch { return [] }
  })

  // Automatically close mobile menu when changing route
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const role = String(currentUser?.role ?? 'student').toLowerCase()
  const navLinks = NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.student
  const name = currentUser?.name ?? (role === 'student' ? 'Student' : role === 'staff' ? 'Faculty Member' : 'Administrator')
  const prn = currentUser?.prn || ''
  const rollNo = currentUser?.roll_no || ''
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
  const profilePath = role === 'student' ? '/student/profile' : `/${role}/profile`
  
  const notifications = []
  const unreadCount = notifications.filter((item) => !readNotifications.includes(item.id)).length

  function saveReadNotifications(next) {
    setReadNotifications(next)
    try { localStorage.setItem('student-activity-read-notifications', JSON.stringify(next)) } catch { /* Storage fallback */ }
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Optional Page Title */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to={`/${role}/dashboard`}
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <ITPulseLogo size={36} className="shrink-0" />
              <div className="leading-tight">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">IT Pulse</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  IT Dept
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Right: Navigation Options (Top-Right Placement) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
              {navLinks.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to.endsWith('/dashboard')}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 lg:block" />

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon size={18} className="text-slate-600 dark:text-slate-300 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen((open) => !open)
                  setProfileOpen(false)
                }}
                className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Bell size={19} />
                {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => saveReadNotifications([...readNotifications, ...notifications.map((item) => item.id)])}
                          className="whitespace-nowrap text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        aria-label="Close notifications"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                  {unreadCount === 0 && <p className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">You’re all caught up. No new notifications.</p>}
                </div>
              )}
            </div>

            {/* User Profile Button & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-label="Open user profile menu"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((prev) => !prev)
                  setNotificationsOpen(false)
                }}
                className="flex items-center gap-2 rounded-xl p-1 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-xs font-bold text-white shadow-xs" aria-hidden="true">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block truncate text-xs font-bold leading-tight text-slate-800 dark:text-slate-200 max-w-[120px]">{name}</span>
                  <span className="block text-[10px] capitalize font-medium text-slate-500 dark:text-slate-400">
                    {role === 'student' ? 'Student' : role}
                  </span>
                </span>
                <ChevronDown size={13} className={`hidden text-slate-400 transition-transform duration-200 sm:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown — always rendered, animated open/close */}
              <div
                className={`absolute right-0 top-13 z-50 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 origin-top-right ${
                  profileOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
                style={{ top: '3.5rem' }}
              >
                  {/* User Header */}
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-700 text-base font-bold text-white shadow-xs">
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{name}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                        {role === 'student' ? <GraduationCap size={11} /> : role === 'staff' ? <UserCog size={11} /> : <ShieldCheck size={11} />}
                        {role}
                      </span>
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="mt-2.5 space-y-1.5 px-2 py-1 text-xs text-slate-600 dark:text-slate-300">
                    {role === 'student' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 dark:text-slate-500 font-semibold">PRN number</span>
                          <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded">{prn || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 dark:text-slate-500 font-semibold">Department</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{currentUser?.department || 'Information Technology'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 dark:text-slate-500 font-semibold">Year</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{currentUser?.year || '2nd Year'}</span>
                        </div>
                      </>
                    )}

                    {role === 'staff' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 dark:text-slate-500 font-semibold">Designation</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{currentUser?.designation || 'Faculty Coordinator'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 dark:text-slate-500 font-semibold">Department</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{currentUser?.department || 'Information Technology'}</span>
                        </div>
                      </>
                    )}

                    {role === 'admin' && (
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Access Level</span>
                        <span className="font-medium text-indigo-700 dark:text-indigo-400 font-bold">Full System Control</span>
                      </div>
                    )}
                  </div>

                  {/* View Profile Link */}
                  <Link
                    to={profilePath}
                    onClick={() => setProfileOpen(false)}
                    className="mt-2 flex items-center justify-between rounded-xl bg-indigo-50/70 dark:bg-indigo-950/60 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <User size={14} /> View Complete Profile
                    </span>
                    <ArrowRight size={13} />
                  </Link>

                  {/* Help & Support Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      setHelpOpen(true)
                    }}
                    className="mt-1 flex w-full items-center gap-1.5 rounded-xl px-3 py-1.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <HelpCircle size={14} /> Help & Support
                  </button>

                  {/* Divider & Logout */}
                  <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 transition hover:bg-rose-100 dark:hover:bg-rose-900/40"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>{/* end dropdown */}
            </div>{/* end profileRef */}

            {/* Mobile / Tablet Menu Button (Visible below lg screens) */}
            <button
              type="button"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>

        {/* Mobile / Tablet Top Navigation Options Dropdown */}
        {mobileNavOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 shadow-md lg:hidden animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {role} Navigation Options
              </p>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </div>
            <nav className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {navLinks.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to.endsWith('/dashboard')}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Help Modal */}
      {helpOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="help-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <section className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="help-modal-title" className="font-bold text-slate-900 dark:text-slate-100">Help & Support</h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  For assistance regarding activity verification, certificate validation, or account details, please reach out to your faculty coordinator or the Department of Information Technology administration.
                </p>
              </div>
              <button type="button" aria-label="Close help" onClick={() => setHelpOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <button type="button" onClick={() => setHelpOpen(false)} className="mt-5 w-full rounded-xl bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 transition">
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  )
}
