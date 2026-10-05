import { LoaderCircle } from 'lucide-react'

export default function Loading({ label = 'Loading…' }) {
  return <div role="status" className="flex min-h-40 items-center justify-center gap-3 text-sm font-medium text-slate-500"><LoaderCircle className="animate-spin text-indigo-600" size={20} />{label}</div>
}
