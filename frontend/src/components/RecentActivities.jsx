import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, CalendarDays } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`))
}

export default function RecentActivities({
  activities = [],
  title = 'Recent Approved Activities',
  subtitle,
  showStudent = true,
  detailPath = '/student/activity',
  showDetails = true,
}) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800/60"><div className="mb-5"><h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>{subtitle&&<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}</div>{activities.length===0?<div className="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No approved activities to show yet.</div>:<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">{activities.map((activity)=><article key={activity.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:border-slate-700 dark:bg-slate-800">{showStudent&&<div className="mb-4 flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" aria-hidden="true">{getInitials(activity.student_name)}</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activity.student_name}</span></div>}<div className="flex items-start justify-between gap-3"><div className="min-w-0">{!showStudent&&<p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{activity.student_name}</p>}<h3 className="font-semibold leading-5 text-slate-900 dark:text-slate-100">{activity.name}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.category} · {activity.level}</p></div><StatusBadge status={activity.status}/></div><dl className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2 dark:border-slate-700"><div className="min-w-0"><dt className="text-xs font-medium text-slate-400">Organizer</dt><dd className="mt-1 truncate text-slate-700 dark:text-slate-300">{activity.organizer||'—'}</dd></div><div className="min-w-0"><dt className="text-xs font-medium text-slate-400">Achievement</dt><dd className="mt-1 flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><Award size={14} className="shrink-0 text-amber-600"/>{activity.achievement||'—'}</dd></div></dl><div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-700"><span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><CalendarDays size={15}/>{formatDate(activity.date)}</span>{showDetails&&<Link to={`${detailPath}/${activity.id}`} className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/30">View Details <ArrowUpRight size={15}/></Link>}</div></article>)}</div>}</section>
}
