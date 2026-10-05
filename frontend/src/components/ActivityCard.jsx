import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

export default function ActivityCard({ activity, showStudent = false }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3">{showStudent && <p className="text-sm font-semibold text-indigo-700">{activity.student_name}</p>}<StatusBadge status={activity.status} /></div><h3 className="mt-3 font-semibold text-slate-900">{activity.name}</h3><p className="mt-1 text-sm text-slate-500">{activity.category} · {activity.level}</p><p className="mt-4 text-sm text-slate-600">{activity.date} · {activity.organizer}</p><Link to={`/student/activity/${activity.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">View details <ArrowUpRight size={15} /></Link></article>
}
