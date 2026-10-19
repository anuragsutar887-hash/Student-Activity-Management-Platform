import { useMemo, useState } from 'react'
import { Activity, Building2, Calendar, ChevronDown, Clock, Filter, Search, Shield, User } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import { getAuditLogs } from '../../services/academicService.js'

const ACTION_LABELS = {
  staff_assigned: 'Staff Assigned',
  staff_assignment_revoked: 'Assignment Revoked',
  staff_account_created: 'Staff Account Created',
  staff_account_updated: 'Staff Account Updated',
  academic_class_created: 'Academic Group Created',
  academic_class_updated: 'Academic Group Updated',
  student_enrolled: 'Student Enrolled',
  student_removed_from_class: 'Student Removed',
  activity_approved: 'Activity Approved',
  activity_rejected: 'Activity Rejected',
  activity_resubmitted: 'Activity Resubmitted',
}

const ACTION_COLORS = {
  staff_assigned: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  staff_assignment_revoked: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  staff_account_created: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  staff_account_updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  academic_class_created: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  academic_class_updated: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  student_enrolled: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  student_removed_from_class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  activity_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  activity_rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  activity_resubmitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

function timeAgo(dateStr) {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

export default function AuditLog() {
  const [logs] = useState(() => getAuditLogs({ limit: 300 }))
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')
  const [page, setPage] = useState(1)
  const PER_PAGE = 25

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return logs.filter(log => {
      const matchesQuery = !q || `${log.actor} ${log.action} ${log.target_label}`.toLowerCase().includes(q)
      const matchesAction = actionFilter === 'All' || log.action === actionFilter
      const matchesRole = roleFilter === 'All' || log.actor_role === roleFilter
      return matchesQuery && matchesAction && matchesRole
    })
  }, [logs, searchQuery, actionFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const uniqueActions = [...new Set(logs.map(l => l.action))]

  return (
    <AdminLayout title="Audit Log">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Audit Log</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track all administrative and system actions. Records are read-only.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
            <p className="text-xs text-slate-400">Total Records</p>
            <p className="text-2xl font-bold text-indigo-600">{logs.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
            <p className="text-xs text-slate-400">Staff Events</p>
            <p className="text-2xl font-bold text-violet-600">{logs.filter(l => l.action.startsWith('staff')).length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
            <p className="text-xs text-slate-400">Activity Reviews</p>
            <p className="text-2xl font-bold text-emerald-600">{logs.filter(l => l.action.startsWith('activity')).length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
            <p className="text-xs text-slate-400">Enrollment Events</p>
            <p className="text-2xl font-bold text-teal-600">{logs.filter(l => l.action.startsWith('student')).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="audit-search"
              type="text"
              placeholder="Search by actor, action, or target…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1) }}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }}
            className="h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500">
            <option value="All">All Actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>)}
          </select>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
            className="h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500">
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="student">Student</option>
          </select>
        </div>

        {/* Log Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
          {paginated.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="mx-auto mb-3 text-slate-300" size={40} />
              <p className="text-slate-500 dark:text-slate-400">No audit records found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginated.map(log => (
                <div key={log.id} className="flex flex-col gap-1 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 sm:flex-row sm:items-start sm:gap-4">
                  <div className="shrink-0 text-xs text-slate-400 pt-0.5 min-w-[80px]">{timeAgo(log.created_at)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      {log.actor_role && (
                        <span className="rounded-full border border-slate-200 dark:border-slate-600 px-2 py-0.5 text-xs capitalize text-slate-500 dark:text-slate-400">{log.actor_role}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.target_label || '—'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">by {log.actor}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">Previous</button>
              <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}