import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"><Compass size={26} /></span><p className="mt-5 text-sm font-semibold text-indigo-700">404 · PAGE NOT FOUND</p><h1 className="mt-2 text-2xl font-bold text-slate-900">This page isn’t here</h1><p className="mt-2 text-sm text-slate-500">The address may be incorrect or the page may have moved.</p><Link to="/student/dashboard" className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">Back to Dashboard</Link></section></main>
}

