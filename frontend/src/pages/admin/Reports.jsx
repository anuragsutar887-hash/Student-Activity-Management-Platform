import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, FileBarChart, FileSpreadsheet, Printer, RotateCcw, Users } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import StaffLayout from '../../layouts/StaffLayout.jsx'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import { getAllActivities } from '../../services/activityService.js'
import { getDepartments, getStudents } from '../../services/studentService.js'
import { getReportSummary, getStudentActivityDistribution } from '../../services/reportService.js'
import { useAuth } from '../../context/authContextValue.js'

const statusColors = {
  Verified: 'var(--success)',
  Pending: 'var(--achievement-gold)',
  Rejected: 'var(--danger)',
  Draft: '#94a3b8',
}

const levels = ['College', 'University', 'State', 'National', 'International']

export default function Reports({ role: roleProp }) {
  const { currentUser } = useAuth()
  const role = roleProp || currentUser?.role || 'admin'
  const isStaff = role === 'staff'
  const Layout = isStaff ? StaffLayout : AdminLayout

  const [filters, setFilters] = useState({
    department: 'All',
    year: 'All',
    category: 'All',
    level: 'All',
    status: 'All',
    from: '',
    to: '',
  })
  const [message, setMessage] = useState('')

  const all = getAllActivities()
  const students = getStudents()
  const departments = getDepartments()

  const set = (key, value) => setFilters((current) => ({ ...current, [key]: value }))

  const activities = useMemo(() => {
    return all.filter((activity) => {
      const student = students.find((item) => String(item.id) === String(activity.student_id))
      return (
        (filters.department === 'All' || activity.department === filters.department || student?.department === filters.department) &&
        (filters.year === 'All' || activity.year === filters.year || student?.year === filters.year) &&
        (filters.category === 'All' || activity.category === filters.category) &&
        (filters.level === 'All' || activity.level === filters.level) &&
        (filters.status === 'All' || activity.status === filters.status) &&
        (!filters.from || activity.date >= filters.from) &&
        (!filters.to || activity.date <= filters.to)
      )
    })
  }, [all, students, filters])

  const summary = getReportSummary(activities)
  const categoryData = Object.entries(summary.categoryCounts).map(([name, value]) => ({ name, value }))
  const statusData = Object.entries(summary.statusCounts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
  const levelData = levels
    .map((name) => ({ name, value: activities.filter((activity) => activity.level === name).length }))
    .filter((item) => item.value)
  const distribution = getStudentActivityDistribution(activities)

  function resetFilters() {
    setFilters({
      department: 'All',
      year: 'All',
      category: 'All',
      level: 'All',
      status: 'All',
      from: '',
      to: '',
    })
  }

  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function rowsForExport() {
    const columns = [
      'Student Name',
      'PRN / ID',
      'Department',
      'Year',
      'Activity Name',
      'Category',
      'Level',
      'Date',
      'Organizer',
      'Achievement',
      'Status',
      'Verified By',
      'Rejection Remarks',
    ]
    const rows = activities.map((activity) => {
      const student = students.find((item) => String(item.id) === String(activity.student_id))
      return [
        activity.student_name,
        activity.student_id,
        activity.department || student?.department || '—',
        activity.year || student?.year || '—',
        activity.name,
        activity.category,
        activity.level,
        activity.date,
        activity.organizer,
        activity.achievement,
        activity.status,
        activity.verified_by || '—',
        activity.remarks || activity.rejection_reason || '—',
      ]
    })
    return [columns, ...rows]
  }

  function csvValue(rows) {
    return rows
      .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n')
  }

  function exportCsv() {
    download('student-activity-report.csv', csvValue(rowsForExport()), 'text/csv;charset=utf-8')
    setMessage('CSV Activity Report downloaded successfully.')
    window.setTimeout(() => setMessage(''), 4000)
  }

  function exportExcel() {
    const table = rowsForExport()
      .map(
        (row, idx) =>
          `<tr style="${idx === 0 ? 'background:#4338ca;color:#fff;font-weight:bold;' : 'border-bottom:1px solid #e2e8f0;'}">${row
            .map((value) => `<td style="padding:8px 12px;">${String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</td>`)
            .join('')}</tr>`
      )
      .join('')
    download(
      'student-activity-report.xls',
      `<html><meta charset="utf-8"><body><h2>Student Activity Management - Comprehensive Report</h2><table>${table}</table></body></html>`,
      'application/vnd.ms-excel'
    )
    setMessage('Excel Activity Report downloaded successfully.')
    window.setTimeout(() => setMessage(''), 4000)
  }

  function exportPdf() {
    setMessage('Print dialog opened. Select "Save as PDF" to generate the PDF report.')
    window.print()
    window.setTimeout(() => setMessage(''), 5000)
  }

  return (
    <Layout title="Reports & Analytics">
      <main className="printable-report">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              {isStaff ? 'Staff Workspace' : 'Institution Administration'} · Analytics
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Reports &amp; Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Category-wise, event level, and student-wise records with export options.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={exportCsv} className="gap-1.5 text-xs py-2">
              <Download size={14} /> Export CSV
            </Button>
            <Button variant="secondary" onClick={exportExcel} className="gap-1.5 text-xs py-2">
              <FileSpreadsheet size={14} /> Export Excel
            </Button>
            <Button onClick={exportPdf} className="gap-1.5 text-xs py-2">
              <Printer size={14} /> Export PDF
            </Button>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            {message}
          </div>
        )}

        {/* Filters */}
        <section
          aria-label="Report filters"
          className={`mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 ${departments.length > 1 ? 'lg:grid-cols-4 xl:grid-cols-7' : 'lg:grid-cols-3 xl:grid-cols-6'}`}
        >
          {departments.length > 1 && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Department
              </label>
              <select
                aria-label="Department filter"
                value={filters.department}
                onChange={(e) => set('department', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium outline-none focus:border-indigo-600"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Year
            </label>
            <select
              aria-label="Year filter"
              value={filters.year}
              onChange={(e) => set('year', e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium outline-none focus:border-indigo-600"
            >
              <option value="All">All Years</option>
              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Category
            </label>
            <select
              aria-label="Category filter"
              value={filters.category}
              onChange={(e) => set('category', e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium outline-none focus:border-indigo-600"
            >
              <option value="All">All Categories</option>
              {[...new Set(all.map((a) => a.category))].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Level
            </label>
            <select
              aria-label="Level filter"
              value={filters.level}
              onChange={(e) => set('level', e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium outline-none focus:border-indigo-600"
            >
              <option value="All">All Levels</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Status
            </label>
            <select
              aria-label="Status filter"
              value={filters.status}
              onChange={(e) => set('status', e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold outline-none focus:border-indigo-600"
            >
              <option value="All">All Statuses</option>
              {['Verified', 'Pending', 'Rejected', 'Draft'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => set('from', e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-2 text-xs outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          </div>
        </section>

        {/* Metrics Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card title="Filtered Activities" value={summary.total} description="Matching current filters" Icon={FileBarChart} />
          <Card title="Verified Activities" value={summary.statusCounts.Verified || 0} description="Approved credentials" Icon={FileBarChart} iconClass="bg-emerald-50 text-emerald-700" />
          <Card title="Pending Review" value={summary.statusCounts.Pending || 0} description="In verification queue" Icon={FileBarChart} iconClass="bg-amber-50 text-amber-700" />
          <Card title="Rejected / Revisions" value={summary.statusCounts.Rejected || 0} description="Returned for updates" Icon={FileBarChart} iconClass="bg-rose-50 text-rose-700" />
          <Card title="Students Active" value={new Set(activities.map((a) => a.student_id)).size} description="Unique students" Icon={Users} iconClass="bg-violet-50 text-violet-700" />
        </section>

        {/* Charts Grid */}
        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          {/* Category-wise report */}
          <Chart title="Category-wise Activity Breakdown">
            <ResponsiveContainer width="100%" height="100%">
              {categoryData.length > 0 ? (
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#94a3b8" />
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
                    dataKey="value"
                    fill="#6366f1"
                    maxBarSize={36}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No category data
                </div>
              )}
            </ResponsiveContainer>
          </Chart>

          {/* Level-wise report */}
          <Chart title="Event Level Distribution">
            <ResponsiveContainer width="100%" height="100%">
              {levelData.some((l) => l.value > 0) ? (
                <BarChart data={levelData}>
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
                    dataKey="value"
                    fill="#f97316"
                    maxBarSize={36}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No level data
                </div>
              )}
            </ResponsiveContainer>
          </Chart>

          {/* Status Breakdown */}
          <Chart title="Verification Status Ratio">
            <ResponsiveContainer width="100%" height="100%">
              {statusData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={statusData.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={86}
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
                              : item.name === 'Rejected'
                              ? '#f43f5e'
                              : '#64748b'
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
                  No status data
                </div>
              )}
            </ResponsiveContainer>
          </Chart>
        </section>

        {/* Student-wise report Table */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student-wise Activity Distribution</h2>
              <p className="mt-0.5 text-xs text-slate-500">Summary count of activities submitted per student</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {distribution.length} Students Listed
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3 text-right">Activities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {distribution.length > 0 ? (
                  distribution.map((item) => {
                    const student = students.find((s) => s.name === item.name)
                    return (
                      <tr key={item.name} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-slate-600">{student?.department || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{student?.year || '—'}</td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-700">{item.count}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      No matching student activity records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </Layout>
  )
}

function Chart({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-slate-900">{title}</h3>
      <div className="h-72">{children}</div>
    </section>
  )
}
