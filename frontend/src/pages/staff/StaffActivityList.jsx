import { useMemo } from 'react'
import { BadgeCheck, Clock3, XCircle } from 'lucide-react'
import Card from '../../components/Card.jsx'
import ActivityBrowser from '../../components/ActivityBrowser.jsx'
import StaffLayout from '../../layouts/StaffLayout.jsx'
import { getAllActivities } from '../../services/activityService.js'

export default function StaffActivityList({ status }) {
  const all = getAllActivities()
  const activities = useMemo(() => all.filter((item) => status === 'All' ? item.status !== 'Draft' : item.status === status), [all, status])
  const title = status === 'All' ? 'Pending Verification' : `${status} Activities`
  const Icon = status === 'Verified' ? BadgeCheck : status === 'Rejected' ? XCircle : Clock3
  const mostCommon = (key) => Object.entries(activities.reduce((counts,item)=>({...counts,[item[key]]:(counts[item[key]]||0)+1}),{})).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'
  return <StaffLayout title={title}><main><div className="mb-6"><p className="text-sm font-semibold text-indigo-700">Staff workspace</p><h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">Review student activity records with searchable filters.</p></div><div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title={`${status === 'All' ? 'Awaiting review' : `${status} total`}`} value={activities.length} description="Matching activity records" Icon={Icon}/>{status==='Verified'&&<><Card title="Verified this month" value={activities.filter((a)=>a.verified_at?.slice(0,7)===new Date().toISOString().slice(0,7)).length} description="Approved during this month" Icon={BadgeCheck} iconClass="bg-emerald-50 text-emerald-700"/><Card title="Top category" value={mostCommon('category')} description="Most common among verified" Icon={BadgeCheck}/><Card title="Top student" value={mostCommon('student_name')} description="Most verified entries" Icon={BadgeCheck}/></>}{status==='All'&&<Card title="Students represented" value={new Set(activities.map((a)=>a.student_id)).size} description="Unique student records" Icon={Icon}/>}</div><ActivityBrowser activities={activities} title={status==='All'?'Pending activities':`${status} activities`} showReason={status==='Rejected'} reviewActions={status==='All'}/></main></StaffLayout>
}
