import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3, ClipboardList, FileCheck2, FileText,
  LayoutDashboard, LogOut, PlusCircle, Search, Settings, Tags, User, UserCog, Users, X,
} from 'lucide-react'
import ITPulseLogo from './ITPulseLogo.jsx'
import { useAuth } from '../context/authContextValue.js'

const navByRole = {
  student: [
    { label: 'Dashboard', to: '/student/dashboard', Icon: LayoutDashboard },
    { label: 'Add Activity', to: '/student/activity/add', Icon: PlusCircle },
    { label: 'My Activities', to: '/student/activities', Icon: ClipboardList },
  ],
  staff: [
    { label: 'Dashboard', to: '/staff/dashboard', Icon: LayoutDashboard },
    { label: 'Student Submissions', to: '/staff/submissions', Icon: ClipboardList },
    { label: 'Pending Verification', to: '/staff/pending', Icon: PlusCircle },
    { label: 'Verified Activities', to: '/staff/verified', Icon: FileCheck2 },
    { label: 'Rejected Activities', to: '/staff/rejected', Icon: FileText },
    { label: 'Search Students', to: '/staff/students', Icon: Search },
    { label: 'Certificates / Documents', to: '/staff/documents', Icon: FileCheck2 },
    { label: 'Reports & Analytics', to: '/staff/reports', Icon: BarChart3 },
    { label: 'Profile', to: '/staff/profile', Icon: UserCog },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', Icon: LayoutDashboard },
    { label: 'Students', to: '/admin/students', Icon: Users },
    { label: 'Staff', to: '/admin/staff', Icon: UserCog },
    { label: 'Categories', to: '/admin/categories', Icon: Tags },
    { label: 'All Activities', to: '/admin/activities', Icon: ClipboardList },
    { label: 'Verification', to: '/admin/verification', Icon: FileCheck2 },
    { label: 'Documents', to: '/admin/documents', Icon: FileText },
    { label: 'Reports & Analytics', to: '/admin/reports', Icon: BarChart3 },
    { label: 'Profile', to: '/admin/profile', Icon: User },
    { label: 'Settings', to: '/admin/settings', Icon: Settings },
  ],
}

export default function Sidebar({ role = 'student', isOpen = false, onClose = () => {} }) {
  const { logout, currentUser } = useAuth()
  const [helpOpen, setHelpOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const links = navByRole[role] ?? navByRole.student

  return (
    <>
      {isOpen && <button type="button" aria-label="Close navigation menu" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <NavLink to={`/${role}/dashboard`} onClick={onClose} className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <ITPulseLogo size={40} className="shrink-0" />
            <span className="text-base font-bold leading-tight text-slate-900">IT Pulse<span className="block text-[10px] font-medium tracking-wide text-slate-500">IT DEPT · TRACK · VERIFY</span></span>
          </NavLink>
          <button type="button" aria-label="Close navigation menu" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"><X size={20} /></button>
        </div>

        <nav aria-label={`${role} navigation`} className="mt-6 flex-1 space-y-1 overflow-y-auto pb-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">IT Workspace</p>
          {links.map(({ label, to, Icon }) => (
            <NavLink key={label} to={to} end={label === 'Dashboard'} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Icon size={19} strokeWidth={1.8} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          {role !== 'student' && currentUser && (
            <NavLink to={`/${role}/profile`} onClick={onClose} className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {(currentUser.name || (role === 'staff' ? 'Faculty Member' : 'Administrator'))
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0] || '')
                  .join('')
                  .toUpperCase() || 'U'}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800">{currentUser.name || (role === 'staff' ? 'Faculty Member' : 'Administrator')}</span>
                <span className="block text-xs capitalize text-slate-500">{role} account</span>
              </span>
            </NavLink>
          )}
          <button type="button" onClick={() => setHelpOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Settings size={19} />Help & Support</button>
          <button type="button" onClick={() => setLogoutOpen(true)} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><LogOut size={19} />Logout</button>
        </div>
      </aside>
      {helpOpen && <div role="dialog" aria-modal="true" aria-labelledby="help-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"><section className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 id="help-title" className="font-semibold text-slate-900">Help & Support</h2><p className="mt-2 text-sm text-slate-500">For account or activity questions, contact your college activity coordinator.</p></div><button type="button" aria-label="Close help" onClick={() => setHelpOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><button type="button" onClick={() => setHelpOpen(false)} className="mt-5 w-full rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">Got it</button></section></div>}
      {logoutOpen && <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"><section className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"><h2 id="logout-title" className="font-semibold text-slate-900">Log out?</h2><p className="mt-2 text-sm text-slate-500">Are you sure you want to log out of your session?</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setLogoutOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><NavLink to="/login" onClick={() => { logout(); onClose() }} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Logout</NavLink></div></section></div>}
    </>
  )
}



