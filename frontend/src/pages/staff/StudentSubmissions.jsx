import { useState } from 'react'
import { Search, ClipboardList } from 'lucide-react'
import StaffLayout from '../../layouts/StaffLayout.jsx'
import ActivityBrowser from '../../components/ActivityBrowser.jsx'
import { getAllActivities } from '../../services/activityService.js'

export default function StudentSubmissions() {
  const [query, setQuery] = useState('')
  const activities = getAllActivities().filter((activity) => activity.status !== 'Draft')
  const searched = activities.filter((activity) => `${activity.student_name} ${activity.name} ${activity.student_id} ${activity.roll_no || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <StaffLayout title="Student Submissions"><main>
    <div className="mb-6"><p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Staff workspace</p><h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Student Submissions</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review submitted activity records from every student.</p></div>
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3"><Search size={17} className="text-slate-400"/><label className="flex-1"><span className="sr-only">Search by student, activity, PRN or roll number</span><input value={query} onChange={(event)=>setQuery(event.target.value)} className="h-11 w-full border-0 bg-transparent text-sm dark:text-slate-200 dark:placeholder:text-slate-500 outline-none"/></label><span className="hidden items-center gap-1 text-xs text-slate-500 dark:text-slate-400 sm:flex"><ClipboardList size={15}/>{searched.length} results</span></div>
    <ActivityBrowser activities={searched} title="Submitted activities" basePath="/staff/verify" reviewActions/>
  </main></StaffLayout>
}
