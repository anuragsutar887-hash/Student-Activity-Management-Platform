import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, BadgeCheck, Clock3, Download, FileBarChart,
  FileSpreadsheet, Printer, UserCog, Users, XCircle
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import Card from '../../components/Card.jsx'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'
import RecentActivities from '../../components/RecentActivities.jsx'
import { getAllActivities, getRecentApprovedActivities } from '../../services/activityService.js'
import { getStaff, getStudents } from '../../services/studentService.js'
import { getReportSummary } from '../../services/reportService.js'

const statusColors = ['var(--success)', 'var(--achievement-gold)', 'var(--danger)', '#94a3b8']

const categoryColors = {
  Technical: 'bg-indigo-600',
  Workshop: 'bg-blue-600',
  Sports: 'bg-emerald-600',
  Cultural: 'bg-pink-600',
  Research: 'bg-purple-600',
  'Social Service': 'bg-teal-600',
  Social: 'bg-teal-600',
  Hackathon: 'bg-amber-600',
  Competition: 'bg-orange-600',
  Certification: 'bg-cyan-600',
  Academic: 'bg-violet-600',
  Innovation: 'bg-rose-600',
  Other: 'bg-slate-500',
}

const levels = ['College', 'University', 'State', 'National', 'International']

export default function AdminDashboard() {
  const activities = getAllActivities()
  const students = getStudents()
  const staff = getStaff()
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const summary = useMemo(() => getReportSummary(activities), [activities])

  // Category counts and progress bars
  const categoryCounts = summary.categoryCounts
  const maxCategoryCount = Math.max(1, ...Object.values(categoryCounts))

  const statusData = Object.entries(summary.statusCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value)

  const levelData = levels.map((name) => ({
    name,
    value: activities.filter((activity) => activity.level === name).length,
  }))

  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function exportCsv() {
    const columns = ['Student', 'PRN', 'Department', 'Activity', 'Category', 'Level', 'Date', 'Status']
    const rows = activities.map((a) => [a.student_name, a.student_id, a.department, a.name, a.category, a.level, a.date, a.status])
    const csv = [columns, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    download('admin-institutional-activity-report.csv', csv, 'text/csv;charset=utf-8')
    setNotice('CSV report exported successfully.')
    setExportModalOpen(false)
    window.setTimeout(() => setNotice(''), 4000)
  }

  function exportExcel() {
    const columns = ['Student', 'PRN', 'Department', 'Activity', 'Category', 'Level', 'Date', 'Status']
    const rows = activities.map((a) => [a.student_name, a.student_id, a.department, a.name, a.category, a.level, a.date, a.status])
    const table = [columns, ...rows]
      .map(
        (r, idx) =>
          `<tr style="${idx === 0 ? 'background:#4338ca;color:#fff;font-weight:bold;' : 'border-bottom:1px solid #ddd;'}">${r
            .map((c) => `<td style="padding:6px 10px;">${String(c ?? '')}</td>`)
            .join('')}</tr>`
      )
      .join('')
    download(
      'admin-institutional-activity-report.xls',
      `<html><meta charset="utf-8"><body><h2>Institution Activities Report</h2><table>${table}</table></body></html>`,
      'application/vnd.ms-excel'
    )
    setNotice('Excel report exported successfully.')
    setExportModalOpen(false)
    window.setTimeout(() => setNotice(''), 4000)
  }

  function exportPdf() {
    setExportModalOpen(false)
    setNotice('Opening print dialog. Select "Save as PDF" to save the report.')
    window.print()
    window.setTimeout(() => setNotice(''), 5000)
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <main>
        {/* Hero Section */}
        <section className="dashboard-hero mb-7 flex flex-col justify-between gap-4 p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Institution Overview &amp; Control
            </h1>
            <p className="mt-1 text-sm text-white/85">
              Comprehensive student activity database, verified credentials, level metrics, and institutional reports.
            </p>
          </div>
        </section>

        {notice && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300">
            {notice}
          </div>
        )}

        {/* Stat Cards: Total Students | Staff | Activities | Verified | Pending | Rejected */}
        <section aria-label="Institution stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card title="Total Students" value={students.length} description="Registered student accounts" Icon={Users} />
          <Card title="Total Staff" value={staff.length} description="Active faculty coordinators" Icon={UserCog} iconClass="bg-violet-50 text-violet-700" />
          <Card title="Total Activities" value={activities.length} description="All submitted records" Icon={Activity} />
          <Card title="Verified Activities" value={summary.statusCounts.Verified || 0} description="Approved credentials" Icon={BadgeCheck} iconClass="bg-emerald-50 text-emerald-700" />
          <Card title="Pending Review" value={summary.statusCounts.Pending || 0} description="Awaiting coordinator review" Icon={Clock3} iconClass="bg-amber-50 text-amber-700" />
          <Card title="Rejected / Revisions" value={summary.statusCounts.Rejected || 0} description="Returned for updates" Icon={XCircle} iconClass="bg-rose-50 text-rose-700" />
        </section>

        {/* Activities by Category (Visual Progress Bars & Export Report Button) */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Activities by Category</h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Co-curricular, extracurricular, technical and research activity distribution
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                <Download size={14} />
                Export Report
              </button>
              <Link
                to="/admin/reports"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Full Analytics <FileBarChart size={14} />
              </Link>
            </div>
          </div>

          {/* Category Progress Bars */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categoryCounts).map(([catName, count]) => {
              const percentage = Math.round((count / (activities.length || 1)) * 100)
              const barWidth = Math.max(10, Math.round((count / maxCategoryCount) * 100))
              const colorClass = categoryColors[catName] || 'bg-indigo-600'

              return (
                <div key={catName} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{catName}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {count} <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                    <div
                      className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Charts Grid: Verification Status & Event Level */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Chart title="Verification Status Ratio">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={84} paddingAngle={4}>
                  {statusData.map((item, index) => (
                    <Cell key={item.name} fill={statusColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Chart>

          <Chart title="Activities by Event Level">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Activities" fill="var(--brand-primary)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Chart>
        </section>

        {/* Recent Approved Activities */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Approved Activities</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Latest verified credentials across IT department</p>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-indigo-700 hover:underline dark:text-indigo-400">
              View All Reports →
            </Link>
          </div>
          <RecentActivities activities={getRecentApprovedActivities().slice(0, 4)} showStudent showDetails={false} />
        </section>

        {/* Export Report Modal */}
        <Modal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          title="Export Institutional Activity Report"
          actions={
            <Button variant="secondary" onClick={() => setExportModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download complete activity records, student PRNs, departments, categories, and verification status for accreditation and placement audits.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={exportCsv}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Download size={20} />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Export CSV</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Raw tabular format</span>
              </button>

              <button
                type="button"
                onClick={exportExcel}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/50 transition dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <FileSpreadsheet size={20} />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Excel</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Styled spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={exportPdf}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center hover:border-violet-300 hover:bg-violet-50/50 transition dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Printer size={20} />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Export PDF</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Printable document</span>
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </AdminLayout>
  )
}

function Chart({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <div className="h-64">{children}</div>
    </section>
  )
}
