import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3, BookOpen, ClipboardList, FileCheck2, FileText, History,
  LayoutDashboard, LogOut, PlusCircle, Search, Settings, Shield, Tags, User, UserCog, Users, X, Award,
} from 'lucide-react'
import ITPulseLogo from './ITPulseLogo.jsx'
import { useAuth } from '../context/authContextValue.js'

const navByRole = {
  student: [
    { label: 'Dashboard', to: '/student/dashboard', Icon: LayoutDashboard },
    { label: 'My Activities', to: '/student/activities', Icon: ClipboardList },
    { label: 'Add Achievement', to: '/student/activity/add', Icon: PlusCircle },
    { label: 'Activity Ledger & Audits', to: '/student/all-activities', Icon: History },
    { label: 'Department Leaderboard', to: '/student/activities?status=Verified', Icon: Award },
    { label: 'Accreditation & Profile', to: '/student/profile', Icon: User },
  ],
  staff: [
    { label: 'Dashboard', to: '/staff/dashboard', Icon: LayoutDashboard },
    { label: 'Student Submissions', to: '/staff/submissions', Icon: ClipboardList },
    { label: 'Pending Verification', to: '/staff/pending', Icon: PlusCircle },
    { label: 'Verified Activities', to: '/staff/verified', Icon: FileCheck2 },
    { label: 'Rejected Activities', to: '/staff/rejected', Icon: FileText },
    { label: 'My Academic Groups', to: '/staff/groups', Icon: BookOpen },
    { label: 'Search Students', to: '/staff/students', Icon: Search },
    { label: 'Certificates / Documents', to: '/staff/documents', Icon: FileCheck2 },
    { label: 'Reports & Analytics', to: '/staff/reports', Icon: BarChart3 },
    { label: 'Profile', to: '/staff/profile', Icon: UserCog },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', Icon: LayoutDashboard },
    { label: 'Students', to: '/admin/students', Icon: Users },
    { label: 'Staff & Permissions', to: '/admin/staff', Icon: UserCog },
    { label: 'Academic Groups', to: '/admin/groups', Icon: BookOpen },
    { label: 'Categories', to: '/admin/categories', Icon: Tags },
    { label: 'All Activities', to: '/admin/activities', Icon: ClipboardList },
    { label: 'Verification', to: '/admin/verification', Icon: FileCheck2 },
    { label: 'Documents', to: '/admin/documents', Icon: FileText },
    { label: 'Reports & Analytics', to: '/admin/reports', Icon: BarChart3 },
    { label: 'Audit Log', to: '/admin/audit', Icon: Shield },
    { label: 'Profile', to: '/admin/profile', Icon: User },
    { label: 'Settings', to: '/admin/settings', Icon: Settings },
  ],
}

export default function Sidebar({ role = 'student', isOpen = false, onClose = () => {} }) {
  const { logout, currentUser } = useAuth()
  const [helpOpen, setHelpOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const links = navByRole[role] ?? navByRole.student

  const roleLabel = role === 'student' ? 'Student' : role === 'staff' ? 'Faculty Coord' : 'Administrator'
  const userDisplay = currentUser?.name ? `${currentUser.name} (${roleLabel})` : `${roleLabel}`

  return (
    <>
      {isOpen && <button type="button" aria-label="Close navigation menu" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#1f2538] bg-[#0c0e17] text-slate-200 px-4 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-1">
          <NavLink to={`/${role}/dashboard`} onClick={onClose} className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <ITPulseLogo size={38} className="shrink-0" />
            <div className="leading-tight">
              <span className="text-sm font-extrabold tracking-wider text-white block">IT PULSE</span>
              <span className="text-[10px] font-bold tracking-widest text-[#f5b544] uppercase">BLACK GOLD ELITE</span>
            </div>
          </NavLink>
          <button type="button" aria-label="Close navigation menu" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"><X size={20} /></button>
        </div>

        {/* Role Context Pill */}
        <div className="mt-4 rounded-xl bg-[#141724] border border-[#232940] p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#f5b544] shadow-[0_0_8px_rgba(245,181,68,0.6)]" />
            <div className="min-w-0">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[#f5b544]/90">ROLE CONTEXT</span>
              <span className="block text-xs font-semibold text-slate-100 truncate">
                {userDisplay}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">v4.2</span>
        </div>

        <nav aria-label={`${role} navigation`} className="mt-5 flex-1 space-y-1.5 overflow-y-auto pb-4 scrollbar-thin">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">PLATFORM &bull; TELEMETRY</p>
          {links.map(({ label, to, Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to.endsWith('/dashboard')}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isActive
                    ? 'bg-[#f5b544] text-[#090b10] font-bold shadow-[0_4px_16px_rgba(245,181,68,0.25)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.4 : 1.8} className={isActive ? 'text-[#090b10]' : 'text-slate-400'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Institutional Node Footprint */}
        <div className="mt-auto pt-3 border-t border-[#1f2538]">
          <div className="rounded-xl border border-[#232940] bg-[#141724]/90 p-3 mb-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">INSTITUTIONAL NODE</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            </div>
            <p className="mt-1 text-xs font-mono font-bold text-[#f5b544] truncate">
              PRN: {currentUser?.prn || (currentUser?.roll_no ? `PRN2024IT${String(currentUser.roll_no).replace(/\D/g, '').padStart(3, '0')}` : '112103060')}
            </p>
            <p className="text-[10px] text-slate-400">Department of IT &bull; Vault Active</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition"
            >
              <Settings size={15} /> Help
            </button>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {helpOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="help-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <section className="w-full max-w-sm rounded-2xl bg-[#121522] border border-[#232940] p-6 shadow-2xl text-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="help-title" className="font-bold text-white text-base">IT Pulse Help &amp; Support</h2>
                <p className="mt-2 text-xs text-slate-400">For account issues, PRN bindings, or activity verification queries, contact your Department Activity Coordinator.</p>
              </div>
              <button type="button" aria-label="Close help" onClick={() => setHelpOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
            </div>
            <button type="button" onClick={() => setHelpOpen(false)} className="mt-5 w-full rounded-xl bg-[#f5b544] text-[#090b10] py-2.5 text-xs font-bold hover:bg-[#e5a83b]">
              Understood
            </button>
          </section>
        </div>
      )}

      {logoutOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <section className="w-full max-w-sm rounded-2xl bg-[#121522] border border-[#232940] p-6 shadow-2xl text-slate-100">
            <h2 id="logout-title" className="font-bold text-white text-base">Confirm Session Logout</h2>
            <p className="mt-2 text-xs text-slate-400">Are you sure you want to end your active authenticated portal session?</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setLogoutOpen(false)} className="rounded-xl border border-[#232940] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
              <NavLink to="/login" onClick={() => { logout(); onClose() }} className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700">Logout Now</NavLink>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
  )
}



