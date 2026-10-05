import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle, ArrowLeft, Award, CalendarDays, CheckCircle2,
  Clock3, Edit3, FileBadge2, FileText, Globe, MapPin, User, XCircle
} from 'lucide-react'
import Button from '../../components/Button.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import CertificateModal from '../../components/CertificateModal.jsx'
import StudentLayout from '../../layouts/StudentLayout.jsx'
import { getActivityById } from '../../services/activityService.js'

export default function ActivityDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const activity = getActivityById(id)
  const [certModalOpen, setCertModalOpen] = useState(false)

  return (
    <StudentLayout title="Activity Details">
      <main className="mx-auto max-w-4xl">
        <Link
          to="/student/activities"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-700 transition"
        >
          <ArrowLeft size={16} /> Back to My Activities
        </Link>

        {!activity ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <FileBadge2 className="mx-auto text-slate-300" size={36} />
            <h2 className="mt-3 text-lg font-bold text-slate-900">Activity not found</h2>
            <p className="mt-1 text-sm text-slate-500">This record may have been removed.</p>
            <div className="mt-4">
              <Button onClick={() => navigate('/student/activities')}>Return to activities</Button>
            </div>
          </section>
        ) : (
          <>
            {/* Main Details Card */}
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {activity.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{activity.level} Level</span>
                  </div>
                  <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">
                    {activity.name}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Submitted on {activity.submitted_at || activity.date} by {activity.student_name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={activity.status} size="md" />
                  {(activity.status === 'Draft' || activity.status === 'Rejected' || activity.status === 'Pending') && (
                    <Link
                      to={`/student/activity/add?edit=${activity.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-700 transition"
                    >
                      <Edit3 size={13} /> Edit Activity
                    </Link>
                  )}
                </div>
              </div>

              {/* Rejection Alert if applicable */}
              {activity.status === 'Rejected' && (
                <div className="mt-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 text-rose-600 dark:text-rose-400 shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-rose-900 dark:text-rose-200">Review Feedback / Revision Needed</p>
                      <p className="mt-1 text-xs text-rose-800 dark:text-rose-300">
                        {activity.remarks || activity.rejection_reason || 'Please provide updated documentation.'}
                      </p>
                      <div className="mt-3">
                        <Link
                          to={`/student/activity/add?edit=${activity.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
                        >
                          <Edit3 size={12} /> Revise &amp; Resubmit Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detail Items Grid */}
              <dl className="mt-8 grid gap-6 border-t border-slate-100 dark:border-slate-800 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Activity Category" value={activity.category} />
                <Detail label="Competition / Event Level" value={activity.level} Icon={Globe} />
                <Detail label="Date of Event" value={activity.date} Icon={CalendarDays} />
                <Detail label="Organizer / Institution" value={activity.organizer} Icon={MapPin} />
                <Detail label="Achievement / Award" value={activity.achievement} Icon={Award} />
                <Detail label="Student PRN" value={activity.student_id ? `PRN-${activity.student_id}` : '—'} Icon={User} />
              </dl>

              {/* Description */}
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Activity Description</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {activity.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Certificate Proof Box */}
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Supporting Certificate &amp; Proof</h3>
                {activity.certificate || activity.status === 'Verified' ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                        <FileText size={20} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                          {activity.certificate || `${activity.name.toLowerCase().replaceAll(' ', '-')}-certificate.pdf`}
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">Official authenticated achievement document</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setCertModalOpen(true)} className="gap-1.5 text-xs py-2">
                        <Award size={14} /> View Certificate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-xs text-slate-500 dark:text-slate-400">
                    No certificate was uploaded for this activity. You can edit this record to attach one.
                  </div>
                )}
              </div>
            </section>

            {/* Review Timeline */}
            <section className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Verification Timeline</h2>
              <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                <Timeline
                  title="1. Activity Submitted"
                  detail={activity.status === 'Draft' ? 'Saved as draft' : activity.submitted_at || activity.date}
                  complete={activity.status !== 'Draft'}
                  active={activity.status !== 'Draft'}
                />
                <Timeline
                  title="2. Coordinator Review"
                  detail={
                    activity.status === 'Pending'
                      ? 'In review queue'
                      : activity.status === 'Draft'
                      ? 'Awaiting submission'
                      : 'Review finished'
                  }
                  complete={activity.status === 'Verified' || activity.status === 'Rejected'}
                  active={activity.status === 'Pending'}
                />
                <Timeline
                  title={activity.status === 'Rejected' ? '3. Revision Needed' : '3. Final Verification'}
                  detail={
                    activity.status === 'Verified'
                      ? `Approved by ${activity.verified_by || 'Staff'}`
                      : activity.status === 'Rejected'
                      ? 'Returned with feedback'
                      : 'Pending evaluation'
                  }
                  complete={activity.status === 'Verified'}
                  failed={activity.status === 'Rejected'}
                />
              </ol>
            </section>

            {/* Certificate Modal */}
            <CertificateModal
              open={certModalOpen}
              onClose={() => setCertModalOpen(false)}
              activity={activity}
            />
          </>
        )}
      </main>
    </StudentLayout>
  )
}

function Detail({ label, value, Icon }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {Icon && <Icon size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
        {value || '—'}
      </dd>
    </div>
  )
}

function Timeline({ title, detail, complete, active, failed }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 p-4">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          failed
            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            : complete
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            : active
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
            : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
        }`}
      >
        {failed ? <XCircle size={15} /> : complete ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
      </span>
      <div>
        <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{detail}</span>
      </div>
    </li>
  )
}
