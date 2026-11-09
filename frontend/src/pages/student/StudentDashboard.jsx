import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, Award, BadgeCheck, BookOpen, CalendarDays, CheckCircle2,
  ChevronRight, ClipboardList, Clock3, Download, ExternalLink, FileCheck, FileText,
  GraduationCap, Hourglass, PlusCircle, ShieldCheck, Sparkles, Trophy, Users, XCircle
} from 'lucide-react'
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
  const studentIds = [
    currentUser?.prn,
    currentUser?.roll_no,
    currentUser?.id,
  ].filter(Boolean)
  const studentPrn = currentUser?.prn || currentUser?.roll_no || currentUser?.id || 'C60'
  const studentName = currentUser?.name ?? 'Anurag Sutar'
  const myActivities = getActivitiesForStudent(studentIds)
  const peerApprovedActivities = getRecentApprovedActivitiesForStudent(studentPrn)
  const [selectedCertActivity, setSelectedCertActivity] = useState(null)
  const [alertDismissed, setAlertDismissed] = useState(false)

  const myStats = {
    total: Math.max(14, myActivities.length),
    verified: Math.max(9, myActivities.filter((a) => a.status === 'Verified').length),
    pending: Math.max(3, myActivities.filter((a) => a.status === 'Pending').length),
    rejected: Math.max(2, myActivities.filter((a) => a.status === 'Rejected').length),
  }

  const categoryWeights = [
    { name: 'Industry Certifications (5)', pct: 35 },
    { name: 'Hackathons & Sprints (3)', pct: 25 },
    { name: 'Conferences & Seminars (3)', pct: 20 },
    { name: 'Tech Competitions (2)', pct: 10 },
    { name: 'Industry Internships (1)', pct: 10 },
  ]

  const telemetryEvents = [
    { title: 'SIH 2024 Verified by Dept Chair', desc: 'Today, 11:20 &bull; +4.0 credits added to vault', color: 'bg-emerald-400' },
    { title: 'Clarification Flagged by Audit Node', desc: 'Yesterday &bull; NPTEL score card low-res attachment', color: 'bg-amber-400' },
    { title: 'New Submission Logged', desc: '3 days ago &bull; Docker Enterprise Ops Bootcamp', color: 'bg-cyan-400' },
    { title: 'Quarterly Audit Export Generated', desc: 'Nov 12 &bull; Official interim dossier dispatched', color: 'bg-slate-400' },
  ]

  return (
    <StudentLayout title="Student Dashboard">
      <main className="space-y-6">
        
        {/* Black Gold Elite Hero Banner */}
        <section className="dashboard-hero p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-[#f5b544] uppercase">
              INSTITUTIONAL STUDENT NODE
            </span>
            <span className="text-[11px] text-slate-300 font-mono">Academic Year 2024-25</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Vault Sync Active
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Welcome back, {studentName}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 font-mono">
                PRN: {currentUser?.prn || '112103060'} &bull; Div C &bull; B.Tech Information Technology &bull; COEP Tech / SPPU
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition"
              >
                <Download size={14} /> Export Transcript
              </button>
              <Link
                to="/student/activity/add"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f5b544] hover:bg-[#e5a83b] px-4 py-2.5 text-xs font-black text-[#090b10] shadow-[0_4px_20px_rgba(245,181,68,0.35)] transition"
              >
                <PlusCircle size={15} /> + Add New Achievement
              </Link>
            </div>
          </div>
        </section>

        {/* Accreditation Audit Resolution Action Banner */}
        {!alertDismissed && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 via-[#181219] to-transparent p-4 text-xs text-rose-200">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-black text-sm">
                !
              </span>
              <div>
                <span className="block font-bold tracking-wider uppercase text-[10px] text-rose-400">
                  ACCREDITATION AUDIT RESOLUTION ACTION
                </span>
                <p className="text-slate-300 text-xs">
                  2 verification flags require your response: Clarify your participation stamp for NPTEL IoT certificate before accreditation audit cutoff.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/student/activities?status=Rejected"
                className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 transition"
              >
                Resolve Issues &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setAlertDismissed(true)}
                className="text-slate-400 hover:text-white px-1.5 py-1"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* 4 Primary Metric Stat Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-[#202538] bg-white dark:bg-[#111420] p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-widest">TOTAL SUBMISSIONS</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                <ClipboardList size={15} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{myStats.total}</span>
              <span className="text-xs text-slate-400">records logged</span>
            </div>
            <p className="mt-2 text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
              <span>&nearr;</span> +3 new logged this term
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/30 dark:border-amber-400/30 bg-amber-50/40 dark:bg-[#151722] p-5 shadow-sm">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-[10px] font-extrabold uppercase tracking-widest">APPROVED CREDENTIALS</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-[#f5b544]">
                <BadgeCheck size={16} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#d99a28] dark:text-[#f5b544]">
                0{myStats.verified}
              </span>
              <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-[#f5b544]">+18 Pts</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              64.3% Clearance (9 of 14 valid)
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-[#202538] bg-white dark:bg-[#111420] p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-widest">UNDER FACULTY REVIEW</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Clock3 size={15} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">0{myStats.pending}</span>
              <span className="text-xs text-slate-400">in queue</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Turnaround: ~48 hrs
            </p>
          </div>

          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#111420] p-5 shadow-sm">
            <div className="flex items-center justify-between text-rose-500">
              <span className="text-[10px] font-extrabold uppercase tracking-widest">ACTION REQUIRED</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle size={15} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-500">0{myStats.rejected}</span>
              <span className="text-xs text-rose-400">deficiencies</span>
            </div>
            <p className="mt-2 text-[11px] text-rose-400 font-semibold">
              Resubmission due in 3d
            </p>
          </div>
        </section>

        {/* Main Grid: Left Activities & Charts (2/3) vs Right Executive Rail (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Approved Institutional Activities & Telemetry */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Approved Institutional Activities List */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#202538] bg-white dark:bg-[#111420] p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#1f2538]">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Approved Institutional Activities &bull;
                    <span className="text-xs font-normal text-slate-400">Verified by Dept Coord Dr. P. K. Deshmukh</span>
                  </h2>
                </div>
                <Link
                  to="/student/all-activities"
                  className="text-xs font-bold text-[#d99a28] dark:text-[#f5b544] hover:underline"
                >
                  View Activity Ledger &rarr;
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {peerApprovedActivities.slice(0, 4).map((activity, idx) => {
                  const pts = idx === 0 ? '+4.0 PTS' : idx === 1 ? '+2.0 PTS' : '+3.0 PTS'
                  return (
                    <div
                      key={activity.id}
                      className="rounded-xl border border-slate-100 dark:border-[#1c2236] bg-slate-50/60 dark:bg-[#141828] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400/40 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-[#f5b544]">
                          {idx === 0 ? <Trophy size={16} /> : idx === 1 ? <Award size={16} /> : <FileCheck size={16} />}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">{activity.name}</h3>
                            <span className="rounded bg-emerald-400/10 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2">
                              {activity.achievement || 'National Finalist'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Category: {activity.category} &bull; Issued by {activity.organizer || 'Ministry of Education, GoI'}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500">
                            {formatDate(activity.date)} &bull; Doc ID: #SIH-{activity.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-mono font-bold text-[#f5b544]">
                          {pts}
                        </span>
                        {activity.certificate && (
                          <button
                            type="button"
                            onClick={() => setSelectedCertActivity(activity)}
                            className="rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-amber-400 hover:text-black px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
                          >
                            Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category Weightage & Audit Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category Weightage */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#202538] bg-white dark:bg-[#111420] p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1f2538]">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Category Weightage</span>
                  <span className="text-[10px] text-slate-400 font-mono">Domain balance</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {categoryWeights.map((c) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                        <span>{c.name}</span>
                        <span className="font-mono text-amber-500">{c.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#1e2338] overflow-hidden">
                        <div
                          style={{ width: `${c.pct}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#f5b544]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-slate-400">
                  &bull; Min. 3 distinct domains required for Honors pathway
                </p>
              </div>

              {/* Audit Telemetry Donut Gauge */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#202538] bg-white dark:bg-[#111420] p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1f2538]">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Audit Telemetry</span>
                    <span className="rounded bg-emerald-400/10 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5">Grade A+</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 font-mono">NBA Criterion 9 Compliance</p>
                </div>

                <div className="my-4 flex items-center justify-center">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-400/30 border-t-[#f5b544] border-r-[#f5b544] shadow-[0_0_20px_rgba(245,181,68,0.15)]">
                    <div className="text-center">
                      <span className="block text-2xl font-black text-white">14</span>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">AUDITED</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 text-center text-[10px] pt-2 border-t border-slate-100 dark:border-[#1f2538]">
                  <div>
                    <span className="block font-bold text-emerald-400">64%</span>
                    <span className="text-slate-400">Approved</span>
                  </div>
                  <div>
                    <span className="block font-bold text-amber-400">21%</span>
                    <span className="text-slate-400">Review</span>
                  </div>
                  <div>
                    <span className="block font-bold text-rose-400">14%</span>
                    <span className="text-slate-400">Deficit</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Rail: Accreditation Target, Tools, & Telemetry Stream */}
          <div className="space-y-6">
            
            {/* Accreditation Target Card */}
            <div className="rounded-2xl border border-amber-400/30 bg-white dark:bg-[#111420] p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">ACCREDITATION TARGET</span>
                <span className="text-[10px] font-mono">Sem 7 Gateway</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-4xl font-black text-[#d99a28] dark:text-[#f5b544]">68</span>
                  <span className="text-slate-400 text-sm font-bold"> / 100</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">Target: 80 Pts</span>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-[#1e2338] overflow-hidden">
                <div style={{ width: '68%' }} className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#f5b544]" />
              </div>

              <div className="mt-4 rounded-xl border border-white/5 bg-slate-50 dark:bg-[#141828] p-3 text-xs text-slate-300">
                <p className="font-bold text-[#f5b544] flex items-center gap-1 text-[11px]">
                  <Sparkles size={13} /> NEXT MILESTONE
                </p>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                  Level-3 Research Co-author: Earn 12 more activity credits before Semester 7 to unlock Dean&apos;s Citation honorifics.
                </p>
              </div>
            </div>

            {/* Student Executive Tools */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#202538] bg-white dark:bg-[#111420] p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Student Executive Tools
              </h3>
              <div className="space-y-2">
                <Link
                  to="/student/activities"
                  className="flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-[#161a2c] border border-transparent hover:border-slate-200 dark:hover:border-[#232940] transition text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList size={15} className="text-[#f5b544]" />
                    <span>View My Activities</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-500" />
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-[#161a2c] border border-transparent hover:border-slate-200 dark:hover:border-[#232940] transition text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} className="text-emerald-400" />
                    <span>Degree Transcript PDF</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-500" />
                </button>

                <a
                  href="#coordinator"
                  onClick={(e) => { e.preventDefault(); alert('Coordinator Office Hours: Thursdays 15:00 - 17:00 IST in Room 304.') }}
                  className="flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-[#161a2c] border border-transparent hover:border-slate-200 dark:hover:border-[#232940] transition text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock3 size={15} className="text-cyan-400" />
                    <span>Coordinator Office Hours</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-500" />
                </a>
              </div>
            </div>

            {/* Telemetry Stream Live */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#202538] bg-white dark:bg-[#111420] p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1f2538]">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Telemetry Stream &bull; LIVE
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="mt-3 space-y-3">
                {telemetryEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${ev.color}`} />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">{ev.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5" dangerouslySetInnerHTML={{ __html: ev.desc }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Certificate Modal */}
        <CertificateModal
          open={Boolean(selectedCertActivity)}
          onClose={() => setSelectedCertActivity(null)}
          activity={selectedCertActivity}
        />
      </main>
    </StudentLayout>
  )
}
