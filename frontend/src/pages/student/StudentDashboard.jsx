import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Award, BadgeCheck, CalendarDays, CheckCircle2, ClipboardList,
  Clock3, ExternalLink, FileCheck, PlusCircle, UserRound, Users, XCircle
} from 'lucide-react'
import Card from '../../components/Card.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import CertificateModal from '../../components/CertificateModal.jsx'
import StudentLayout from '../../layouts/StudentLayout.jsx'
import { useAuth } from '../../context/authContextValue.js'
import { getActivitiesForStudent, getRecentApprovedActivitiesForStudent } from '../../services/activityService.js'

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
}

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${date}T00:00:00Z`))
  } catch {
    return date
  }
}

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  // Collect all possible student identifiers so activities are always found
  const studentIds = [
    currentUser?.prn,
    currentUser?.roll_no,
    currentUser?.id,
  ].filter(Boolean)
  const studentPrn = currentUser?.prn || currentUser?.roll_no || currentUser?.id || 'C1'
  const studentName = currentUser?.name ?? 'Student'
  const myActivities = getActivitiesForStudent(studentIds)
  const peerApprovedActivities = getRecentApprovedActivitiesForStudent(studentPrn)
  const [selectedCertActivity, setSelectedCertActivity] = useState(null)

  const myStats = {
    total: myActivities.length,
    verified: myActivities.filter((activity) => activity.status === 'Verified').length,
    pending: myActivities.filter((activity) => activity.status === 'Pending').length,
    rejected: myActivities.filter((activity) => activity.status === 'Rejected').length,
  }

  const statCards = [
    {
      key: 'total',
      title: 'Total Activities',
      value: myStats.total,
      description: 'Submitted activity records',
      Icon: ClipboardList,
      iconClass: 'bg-blue-50 text-blue-700',
    },
    {
      key: 'verified',
      title: 'Verified Activities',
      value: myStats.verified,
      description: 'Approved credentials',
      Icon: BadgeCheck,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      key: 'pending',
      title: 'Pending Review',
      value: myStats.pending,
      description: 'Awaiting coordinator review',
      Icon: Clock3,
      iconClass: 'bg-amber-50 text-amber-700',
    },
    {
      key: 'rejected',
      title: 'Rejected / Action Needed',
      value: myStats.rejected,
      description: 'Requires student revision',
      Icon: XCircle,
      iconClass: 'bg-rose-50 text-rose-700',
    },
  ]

  const quickActions = [
    { to: '/student/activity/add', title: 'Add Activity', detail: 'Submit new co-curricular / technical record', Icon: PlusCircle },
    { to: '/student/activities', title: 'My Activities', detail: 'Manage and filter all your submissions', Icon: ClipboardList },
    { to: '/student/activities?status=Verified', title: 'Verified Credentials', detail: 'Review faculty-approved certifications', Icon: BadgeCheck },
  ]

  return (
    <StudentLayout title="Student Dashboard">
      <main className="space-y-8">
        {/* Welcome Greeting Header */}
        <section className="dashboard-hero flex flex-col justify-between gap-4 p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Hello, {studentName}! <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-sm text-white/85 sm:text-base">
              Department of Information Technology · Track activities, view peer achievements &amp; upload certificates.
            </p>
          </div>
        </section>

        {/* 1. FIRST SECTION: Recent Approved Activities by Other Students */}
        <section aria-label="Peer approved activities" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <Users size={18} />
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Recent Approved Activities by IT Students
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Explore recognized accomplishments, hackathons, and certifications completed by your peers in the IT Department.
              </p>
            </div>
            <Link
              to="/student/all-activities"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Browse all activities <ArrowRight size={14} />
            </Link>
          </div>

          {peerApprovedActivities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No approved activities by peers to show yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {peerApprovedActivities.slice(0, 6).map((activity) => (
                <article
                  key={activity.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4.5 shadow-xs transition hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md"
                >
                  <div>
                    {/* Student Info Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {getInitials(activity.student_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">{activity.student_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {activity.roll_no ? `Roll: ${activity.roll_no}` : ''} {activity.prn ? `· PRN: ${activity.prn}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    </div>

                    {/* Activity Title & Tags */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                      {activity.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="rounded bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 font-semibold text-indigo-700 dark:text-indigo-300">
                        {activity.category}
                      </span>
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-600 dark:text-slate-300">
                        {activity.level} Level
                      </span>
                    </div>

                    {/* Details */}
                    <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {activity.achievement && (
                        <p className="flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-400">
                          <Award size={14} className="shrink-0 text-amber-500" />
                          <span className="truncate">{activity.achievement}</span>
                        </p>
                      )}
                      {activity.organizer && (
                        <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                          Org: {activity.organizer}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                      <CalendarDays size={13} /> {formatDate(activity.date)}
                    </span>
                    <div className="flex items-center gap-2">
                      {activity.certificate && (
                        <button
                          type="button"
                          onClick={() => setSelectedCertActivity(activity)}
                          title="View Proof Certificate"
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                        >
                          <FileCheck size={13} />
                          Proof
                        </button>
                      )}
                      <Link
                        to={`/student/activity/${activity.id}`}
                        className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400"
                      >
                        Details <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 2. SECOND SECTION: My Activity Statistics */}
        <section aria-label="Activity statistics">
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">My Activity Summary</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Overview of your submitted records and review statuses</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map(({ key, title, value, description, Icon, iconClass }) => (
              <Card key={key} title={title} value={value} description={description} Icon={Icon} iconClass={iconClass} />
            ))}
          </div>
        </section>

        {/* Certificate Viewer Modal */}
        <CertificateModal
          open={Boolean(selectedCertActivity)}
          onClose={() => setSelectedCertActivity(null)}
          activity={selectedCertActivity}
        />
      </main>
    </StudentLayout>
  )
}
