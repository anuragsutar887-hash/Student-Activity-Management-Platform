import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Building2, Eye, FileText, UserRound, XCircle } from 'lucide-react'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import CertificateModal from '../../components/CertificateModal.jsx'
import StaffLayout from '../../layouts/StaffLayout.jsx'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import { useAuth } from '../../context/authContextValue.js'
import { getActivityById, getDocuments, verifyActivity, rejectActivity } from '../../services/activityService.js'

export default function VerifyActivity() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const isAdmin = String(currentUser?.role).toLowerCase() === 'admin'
  const [activity, setActivity] = useState(() => getActivityById(id))
  const [reason, setReason] = useState('')
  const [decision, setDecision] = useState(() => (['Verified', 'Rejected'].includes(searchParams.get('decision')) ? searchParams.get('decision') : ''))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [certModalOpen, setCertModalOpen] = useState(false)
  const documents = getDocuments().filter((doc) => String(doc.activityId) === String(id))
  const listPath = isAdmin
    ? window.location.pathname.startsWith('/admin/verification')
      ? '/admin/verification'
      : '/admin/activities'
    : '/staff/submissions'

  function confirmDecision() {
    if (decision === 'Rejected' && !reason.trim()) {
      setError('Enter a reason or instructions for revision.')
      return
    }
    const reviewerName = currentUser?.name || (isAdmin ? 'System Administrator' : 'Faculty Coordinator')
    const updated = decision === 'Verified'
      ? verifyActivity(id, reviewerName)
      : rejectActivity(id, reason, reviewerName)

    if (!updated) {
      setError('The activity could not be updated.')
      return
    }
    setActivity(updated)
    setNotice(`Activity ${decision.toLowerCase()} successfully.`)
    setDecision('')
    setReason('')
    setError('')
    window.setTimeout(() => navigate(listPath), 850)
  }

  const Layout = isAdmin ? AdminLayout : StaffLayout

  return (
    <Layout title="Activity Review & Verification">
      <main className="mx-auto max-w-5xl">
        <Link
          to={listPath}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft size={16} /> Back to activity queue
        </Link>

        {!activity ? (
          <section className="rounded-3xl bg-white dark:bg-slate-800/60 p-10 text-center border border-slate-200 dark:border-slate-700">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">Activity record not found</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This record may have been removed or updated.</p>
          </section>
        ) : (
          <>
            {notice && (
              <div role="status" className="mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {notice}
              </div>
            )}

            {/* Main Info */}
            <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Student Submission</p>
                  <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">{activity.name}</h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Submitted by {activity.student_name} on {activity.submitted_at || activity.date}
                  </p>
                </div>
                <StatusBadge status={activity.status} size="md" />
              </div>

              <dl className="mt-7 grid gap-x-8 gap-y-5 border-t border-slate-100 dark:border-slate-700 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                <Detail Icon={UserRound} label="Student & PRN" value={`${activity.student_name} (PRN: ${activity.student_id})`} />
                <Detail Icon={Building2} label="Department" value={activity.department || 'Information Technology'} />
                <Detail label="Academic Year" value={activity.year || '2nd Year'} />
                <Detail label="Category & Level" value={`${activity.category} · ${activity.level}`} />
                <Detail label="Date of Event" value={activity.date} />
                <Detail label="Organizer" value={activity.organizer} />
                <Detail label="Achievement" value={activity.achievement} />
                <Detail label="Description" value={activity.description} />
                {activity.verified_by && <Detail label="Verified By" value={`${activity.verified_by} on ${activity.verified_at || ''}`} />}
                {activity.status === 'Rejected' && (
                  <Detail
                    label="Rejection Reason"
                    value={activity.rejection_reason || activity.remarks || 'No reason specified'}
                  />
                )}
              </dl>
            </section>

            {/* Documents & Certificate */}
            <section className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Certificate &amp; Evidence Files</h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Supporting documents attached to this submission</p>
                </div>
              </div>

              {documents.length || activity.certificate ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-900/20 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <FileText size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-indigo-950 dark:text-indigo-200">
                          {activity.certificate || `${activity.name.toLowerCase().replaceAll(' ', '-')}-proof.pdf`}
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400">Official certificate document</p>
                      </div>
                    </div>
                    <Button onClick={() => setCertModalOpen(true)} className="gap-1.5 text-xs py-1.5">
                      <Eye size={14} /> View Certificate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 p-4 text-xs text-slate-500 dark:text-slate-400">
                  No certificate is attached to this activity.
                </div>
              )}
            </section>

            {/* Verification Actions Panel */}
            <section className="mt-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Verification Decision</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Review submitted proof and update the verification record.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button
                  onClick={() => setDecision('Verified')}
                  disabled={activity.status === 'Verified'}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <BadgeCheck size={17} /> Verify Activity
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setDecision('Rejected')}
                  disabled={activity.status === 'Rejected'}
                  className="gap-1.5"
                >
                  <XCircle size={17} /> Reject Activity
                </Button>
              </div>
            </section>

            {/* Decision Confirmation Modal */}
            <Modal
              open={Boolean(decision)}
              onClose={() => {
                setDecision('')
                setError('')
              }}
              title={decision === 'Rejected' ? 'Provide Reason for Rejection' : 'Confirm Activity Verification?'}
              actions={
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDecision('')
                      setError('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant={decision === 'Rejected' ? 'danger' : 'primary'} onClick={confirmDecision}>
                    {decision === 'Rejected' ? 'Submit Rejection' : 'Confirm & Verify'}
                  </Button>
                </>
              }
            >
              {decision === 'Rejected' ? (
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Enter the specific reason or missing document instruction so the student can revise their entry:
                  </p>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value)
                      setError('')
                    }}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
                  />
                  {error && <span role="alert" className="mt-1 block text-xs text-rose-600 font-medium">{error}</span>}
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Are you sure you want to approve and verify <strong>{activity.name}</strong> for {activity.student_name}? This credential will be marked as officially verified across institutional reports.
                </p>
              )}
            </Modal>

            {/* Certificate Modal */}
            <CertificateModal
              open={certModalOpen}
              onClose={() => setCertModalOpen(false)}
              activity={activity}
            />
          </>
        )}
      </main>
    </Layout>
  )
}

function Detail({ Icon, label, value }) {
  return (
    <div className="flex gap-2.5">
      {Icon && <Icon size={17} className="mt-0.5 shrink-0 text-indigo-600" />}
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{value || '—'}</dd>
      </div>
    </div>
  )
}
