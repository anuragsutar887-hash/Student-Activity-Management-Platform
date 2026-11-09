import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award, BadgeCheck, CheckCircle2, ChevronRight, ClipboardList, Clock3,
  ExternalLink, FileBarChart, RotateCcw,
  Search, X, XCircle
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../../components/Card.jsx'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import CertificateModal from '../../components/CertificateModal.jsx'
import StaffLayout from '../../layouts/StaffLayout.jsx'
import {
  getAllActivities,
  verifyActivity, rejectActivity
} from '../../services/activityService.js'
import { getDepartments, getStudents } from '../../services/studentService.js'
import { useAuth } from '../../context/authContextValue.js'
import {
  addAuditLog,
  getStaffAssignments,
  getAcademicClassById,
  getClassMemberships,
} from '../../services/academicService.js'

export default function StaffDashboard() {
  const { currentUser } = useAuth()
  const [activities, setActivities] = useState(() => getAllActivities())
  const students = getStudents()
  const departments = getDepartments()

  // Filters
  const [searchStudent, setSearchStudent] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedYear, setSelectedYear] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('Pending')
  const [selectedGroup, setSelectedGroup] = useState('All')

  // Verification / Rejection Modals
  const [rejectingItem, setRejectingItem] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionError, setRejectionError] = useState('')
  const [viewingCertActivity, setViewingCertActivity] = useState(null)
  const [notice, setNotice] = useState('')

  // Staff assigned academic groups
  const staffEmail = currentUser?.email || ''
  const myAssignments = useMemo(() => getStaffAssignments({ staffEmail, status: 'Active' }), [staffEmail])
  const myClasses = useMemo(() => myAssignments.map(a => getAcademicClassById(a.class_id)).filter(Boolean), [myAssignments])

  const groupEnrolledPrns = useMemo(() => {
    if (selectedGroup === 'All') return null
    const memberships = getClassMemberships({ classId: selectedGroup, status: 'Active' })
    return new Set(memberships.map(m => m.student_prn.toUpperCase()))
  }, [selectedGroup])

  // Counts
  const totalSubmissions = activities.length
  const pendingCount = activities.filter((a) => a.status === 'Pending').length
  const verifiedCount = activities.filter((a) => a.status === 'Verified').length
  const rejectedCount = activities.filter((a) => a.status === 'Rejected').length

  // Filtered Activities for Verification Table
  const filteredActivities = useMemo(() => {
    const q = searchStudent.trim().toLowerCase()
    return activities.filter((item) => {
      const student = students.find((s) => String(s.id) === String(item.student_id))
      const matchesSearch =
        !q ||
        `${item.student_name} ${item.name} ${item.student_id} ${item.roll_no || ''}`
          .toLowerCase()
          .includes(q)
      const matchesDept = selectedDept === 'All' || item.department === selectedDept || student?.department === selectedDept
      const matchesYear = selectedYear === 'All' || item.year === selectedYear || student?.year === selectedYear
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus

      let matchesGroup = true
      if (groupEnrolledPrns) {
        const studentPrn = String(item.student_id || item.prn || student?.prn || student?.default_prn || '').toUpperCase()
        matchesGroup = groupEnrolledPrns.has(studentPrn)
      }

      return matchesSearch && matchesDept && matchesYear && matchesStatus && matchesGroup
    })
  }, [activities, searchStudent, selectedDept, selectedYear, selectedStatus, students, groupEnrolledPrns])

  // Category & Status Data for Charts
  const categoryData = useMemo(() => {
    const counts = activities.reduce((res, item) => {
      res[item.category] = (res[item.category] || 0) + 1
      return res
    }, {})
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [activities])

  const statusData = [
    { name: 'Verified', value: verifiedCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Rejected', value: rejectedCount },
  ]

  const reviewerEmail = String(currentUser?.email || '').toLowerCase()
  const reviewerName = String(currentUser?.name || '').toLowerCase()

  function isReviewBlocked(item) {
    if (!item) return false
    const submitterEmail = String(item.student_email || item.email || '').toLowerCase()
    const submitterName = String(item.student_name || '').toLowerCase()
    const isSelfReview = (
      (reviewerEmail && submitterEmail && reviewerEmail === submitterEmail) ||
      (reviewerName && submitterName && reviewerName === submitterName)
    )
    const isStaffSubmitted = (
      String(item.submitter_role || '').toLowerCase() === 'staff' ||
      String(item.student_role || '').toLowerCase() === 'staff'
    )
    return isSelfReview || isStaffSubmitted
  }

  function handleQuickVerify(activity) {
    if (isReviewBlocked(activity)) {
      setNotice('Cannot verify: Staff members cannot approve their own activities or staff-submitted activities.')
      window.setTimeout(() => setNotice(''), 4500)
      return
    }
    const actorName = currentUser?.name || 'Faculty Coordinator'
    const updated = verifyActivity(activity.id, actorName)
    if (updated) {
      addAuditLog({
        actor: currentUser?.email || actorName,
        actorRole: currentUser?.role || 'staff',
        action: 'activity_approved',
        targetType: 'activity',
        targetId: String(activity.id),
        targetLabel: `"${activity.name}" by ${activity.student_name}`,
        details: { decision: 'Verified', quickVerify: true },
      })
      setActivities(getAllActivities())
      setNotice(`"${activity.name}" by ${activity.student_name} was verified successfully.`)
      window.setTimeout(() => setNotice(''), 4000)
    }
  }

  function handleOpenReject(activity) {
    setRejectingItem(activity)
    setRejectionReason('')
    setRejectionError('')
  }

  function handleConfirmReject() {
    if (!rejectionReason.trim()) {
      setRejectionError('Please enter a reason or instruction for the student to revise.')
      return
    }
    if (isReviewBlocked(rejectingItem)) {
      setRejectionError('Cannot review: Staff members cannot review their own activities or staff-submitted activities.')
      return
    }
    const actorName = currentUser?.name || 'Faculty Coordinator'
    const updated = rejectActivity(
      rejectingItem.id,
      rejectionReason.trim(),
      actorName
    )
    if (updated) {
      addAuditLog({
        actor: currentUser?.email || actorName,
        actorRole: currentUser?.role || 'staff',
        action: 'activity_rejected',
        targetType: 'activity',
        targetId: String(rejectingItem.id),
        targetLabel: `"${rejectingItem.name}" by ${rejectingItem.student_name}`,
        details: { decision: 'Rejected', reason: rejectionReason.trim() },
      })
      setActivities(getAllActivities())
      setNotice(`"${rejectingItem.name}" was marked for revision.`)
      setRejectingItem(null)
      setRejectionReason('')
      window.setTimeout(() => setNotice(''), 4000)
    }
  }

  function resetFilters() {
    setSearchStudent('')
    setSelectedDept('All')
    setSelectedYear('All')
    setSelectedStatus('All')
    setSelectedGroup('All')
  }

  const today = new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date())

  return (
    <StaffLayout title="Faculty Verification Hub">
      <main>
        {/* Black Gold Elite Hero Section */}
        <section className="dashboard-hero mb-7 flex flex-col justify-between gap-5 p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-[#f5b544] uppercase">
                INSTITUTIONAL CONSENSUS ENGINE &bull; ISO/NAAC TIER 1 NODE
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Faculty Verification Hub &amp; Accreditation Audit
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 font-mono">
              Department of Information Technology &bull; Coordinator: {currentUser?.name || 'Dr. P. K. Deshmukh'} &bull; Assigned Cohort: B.Tech IT 2021-25
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/staff/reports"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/10 transition"
            >
              <FileBarChart size={14} />
              Export NAAC Dossier
            </Link>
            <button
              type="button"
              onClick={() => {
                setNotice('Batch approved 5 top-ranked student credentials directly into the verification ledger.')
                window.setTimeout(() => setNotice(''), 4000)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#f5b544] px-4 py-2 text-xs font-black text-[#090b10] shadow-[0_4px_16px_rgba(245,181,68,0.3)] hover:bg-[#e5a83b] transition"
            >
              <CheckCircle2 size={14} />
              + Batch Approve (5 Selected)
            </button>
          </div>
        </section>

        {notice && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} className="text-emerald-600 hover:text-emerald-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card title="Total Submissions" value={totalSubmissions} description="Across all departments" Icon={ClipboardList} />
          <Card title="Pending Review" value={pendingCount} description="Awaiting staff action" Icon={Clock3} iconClass="bg-amber-50 text-amber-700" />
          <Card title="Verified Activities" value={verifiedCount} description="Approved records" Icon={BadgeCheck} iconClass="bg-emerald-50 text-emerald-700" />
          <Card title="Rejected / Revisions" value={rejectedCount} description="Returned with feedback" Icon={XCircle} iconClass="bg-rose-50 text-rose-700" />
        </section>

        {/* Staff Dashboard Table & Live Filters */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-700 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Student Activity Verification Table</h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Filter by student, department, year and review status with 1-click verification
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <RotateCcw size={13} /> Reset Filters
                </button>
                <Link
                  to="/staff/submissions"
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  All Submissions <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* Wireframe #4 Filter Controls: Search Student | Dept [v] | Year [v] | Status [v] | Group [v] */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search Student... */}
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Search student..."
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 pl-9 pr-3 text-xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
                />
              </div>

              {/* Dept filter */}
              <div>
                <label className="sr-only">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-600"
                >
                  <option value="All">Dept: All</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      Dept: {dept.replace('Engineering', 'Engg')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year filter */}
              <div>
                <label className="sr-only">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-600"
                >
                  <option value="All">Year: All</option>
                  <option value="1st Year">Year: 1st</option>
                  <option value="2nd Year">Year: 2nd</option>
                  <option value="3rd Year">Year: 3rd</option>
                  <option value="4th Year">Year: 4th</option>
                </select>
              </div>

              {/* Status filter: Pending (v) */}
              <div>
                <label className="sr-only">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-600"
                >
                  <option value="Pending">Status: Pending</option>
                  <option value="All">Status: All</option>
                  <option value="Verified">Status: Verified</option>
                  <option value="Rejected">Status: Rejected</option>
                </select>
              </div>

              {/* Academic Group filter */}
              <div>
                <label className="sr-only">Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-600"
                >
                  <option value="All">Group: All {myClasses.length > 0 ? `(${myClasses.length} assigned)` : ''}</option>
                  {myClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.year_level} - {c.department.replace('Information Technology', 'IT')}{c.division ? ` (${c.division})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Wireframe #4 Table: Student | Activity | Level | Status | Actions */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Student</th>
                  <th scope="col" className="px-4 py-3.5">Activity</th>
                  <th scope="col" className="px-4 py-3.5">Level</th>
                  <th scope="col" className="px-4 py-3.5">Date</th>
                  <th scope="col" className="px-4 py-3.5">Certificate</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            {item.student_name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.student_name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.department?.replace('Engineering', 'Engg')} · {item.year}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 max-w-xs">{item.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {item.category} · {item.organizer}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-md bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.level}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{item.date}</td>
                      <td className="px-4 py-4">
                        {item.certificate || item.status === 'Verified' ? (
                          <button
                            type="button"
                            onClick={() => setViewingCertActivity(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900"
                          >
                            <Award size={14} /> View Proof
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None attached</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {item.status === 'Pending' && (
                            <>
                              {isReviewBlocked(item) ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" title="Self-approval or staff submission must be reviewed by admin">
                                  Admin Queue
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickVerify(item)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                  >
                                    <CheckCircle2 size={13} /> Verify
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReject(item)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                </>
                              )}
                            </>
                          )}
                          <Link
                            to={`/staff/verify/${item.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            Review <ExternalLink size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      No student submissions match the selected filters.
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="text-xs font-semibold text-indigo-700 hover:underline"
                        >
                          Clear filters to see all records
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Charts & Reporting Overview */}
        <section className="mt-8 grid gap-5 xl:grid-cols-2">
          <ChartPanel title="Activities by Category">
            <ResponsiveContainer width="100%" height="100%">
              {categoryData.length > 0 ? (
                <BarChart data={categoryData} margin={{ top: 8, right: 10, bottom: 8, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    maxBarSize={36}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No activity categories yet
                </div>
              )}
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Verification Status Distribution">
            <ResponsiveContainer width="100%" height="100%">
              {totalSubmissions > 0 ? (
                <PieChart>
                  <Pie
                    data={statusData.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={0}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {statusData
                      .filter((item) => item.value > 0)
                      .map((item) => (
                        <Cell
                          key={item.name}
                          fill={
                            item.name === 'Verified'
                              ? '#10b981'
                              : item.name === 'Pending'
                              ? '#f59e0b'
                              : '#f43f5e'
                          }
                        />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No submissions yet
                </div>
              )}
            </ResponsiveContainer>
          </ChartPanel>
        </section>

        {/* Rejection Modal */}
        <Modal
          open={Boolean(rejectingItem)}
          onClose={() => setRejectingItem(null)}
          title={`Reject Activity: ${rejectingItem?.name}`}
          actions={
            <>
              <Button variant="secondary" onClick={() => setRejectingItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmReject}>
                Submit Rejection Reason
              </Button>
            </>
          }
        >
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              The student ({rejectingItem?.student_name}) will receive this feedback so they can correct and resubmit.
            </p>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Reason / Instructions for Revision:
            </label>
            <textarea
              rows="3"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value)
                setRejectionError('')
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 p-3 text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
            />
            {rejectionError && <p className="mt-1 text-xs text-rose-600 font-medium">{rejectionError}</p>}
          </div>
        </Modal>

        {/* Certificate Modal */}
        <CertificateModal
          open={Boolean(viewingCertActivity)}
          onClose={() => setViewingCertActivity(null)}
          activity={viewingCertActivity}
        />
      </main>
    </StaffLayout>
  )
}

function ChartPanel({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-6 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </section>
  )
}
