import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-2.5 font-semibold text-slate-900"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-white"><GraduationCap size={20} /></span>Student Activity Management</Link>
        <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Sign in <ArrowRight size={16} /></Link>
      </div>
    </header>
  )
}
