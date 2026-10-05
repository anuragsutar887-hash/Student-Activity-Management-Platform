import { useState } from 'react'
import {
  CheckCircle2, RotateCcw, ShieldCheck, SlidersHorizontal, Tags
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'
import { getCategories, resetAllStudentServiceData } from '../../services/studentService.js'
import { resetActivities } from '../../services/activityService.js'

const defaultPermissions = {
  student: {
    add_activity: true,
    edit_activity: true,
    delete_activity: true,
    upload_documents: true,
    view_all_submissions: false,
    verify_activity: false,
    reject_activity: false,
    manage_students: false,
    manage_staff: false,
    manage_categories: false,
    generate_reports: false,
    system_config: false,
  },
  staff: {
    add_activity: false,
    edit_activity: false,
    delete_activity: false,
    upload_documents: true,
    view_all_submissions: true,
    verify_activity: true,
    reject_activity: true,
    manage_students: false,
    manage_staff: false,
    manage_categories: false,
    generate_reports: true,
    system_config: false,
  },
  admin: {
    add_activity: true,
    edit_activity: true,
    delete_activity: true,
    upload_documents: true,
    view_all_submissions: true,
    verify_activity: true,
    reject_activity: true,
    manage_students: true,
    manage_staff: true,
    manage_categories: true,
    generate_reports: true,
    system_config: true,
  },
}

const permissionLabels = [
  { key: 'add_activity', label: 'Add / Submit Activities', desc: 'Create new activity entries' },
  { key: 'edit_activity', label: 'Edit Activity Records', desc: 'Modify drafted or revision submissions' },
  { key: 'delete_activity', label: 'Delete Activities', desc: 'Remove own draft entries' },
  { key: 'upload_documents', label: 'Upload Documents & Proof', desc: 'Attach certificate files (PDF/images)' },
  { key: 'view_all_submissions', label: 'View All Submissions', desc: 'Access submissions across all students' },
  { key: 'verify_activity', label: 'Verify / Approve Activities', desc: 'Certify valid student submissions' },
  { key: 'reject_activity', label: 'Reject / Request Revisions', desc: 'Return submissions with feedback' },
  { key: 'manage_students', label: 'Manage Student Profiles', desc: 'Create, update, deactivate students' },
  { key: 'manage_staff', label: 'Manage Staff Accounts', desc: 'Create, update, deactivate staff' },
  { key: 'manage_categories', label: 'Manage Activity Categories', desc: 'Add or edit activity categories' },
  { key: 'generate_reports', label: 'Export Reports (PDF/Excel)', desc: 'Generate institutional analytics' },
  { key: 'system_config', label: 'System Configuration', desc: 'Configure application-wide settings' },
]

const initialToggles = [
  ['Require certificate document for verification', 'Flag submissions without attached evidence', true],
  ['Allow students to revise rejected submissions', 'Students can edit and resubmit returned activities', true],
  ['Email Notifications', 'Send updates to student when submission status changes', true],
  ['Staff Review Alerts', 'Notify department coordinators when student submits an activity', true],
  ['Accreditation placement reporting ready', 'Format report fields for NAAC / NBA audit requirements', true],
]

export default function AdminSettings() {
  const [permissions, setPermissions] = useState(() => {
    try {
      const stored = localStorage.getItem('student-activity-permissions-v1')
      return stored ? JSON.parse(stored) : defaultPermissions
    } catch {
      return defaultPermissions
    }
  })

  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(initialToggles.map(([name, , def]) => [name, def]))
  )
  const [message, setMessage] = useState('')
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const categories = getCategories()

  function togglePermission(role, permKey) {
    setPermissions((prev) => {
      const next = {
        ...prev,
        [role]: {
          ...prev[role],
          [permKey]: !prev[role][permKey],
        },
      }
      try {
        localStorage.setItem('student-activity-permissions-v1', JSON.stringify(next))
      } catch (err) {
        void err
      }
      return next
    })
    setMessage(`Updated ${role.toUpperCase()} permissions. Changes saved.`)
    window.setTimeout(() => setMessage(''), 3000)
  }

  function handleResetAllData() {
    resetActivities()
    resetAllStudentServiceData()
    setPermissions(defaultPermissions)
    localStorage.removeItem('student-activity-permissions-v1')
    setResetModalOpen(false)
    setMessage('All activity records, student data, and settings have been restored to defaults.')
    window.setTimeout(() => {
      setMessage('')
      window.location.reload()
    }, 1200)
  }

  return (
    <AdminLayout title="Settings & User Permissions">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Administration</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Platform Settings &amp; User Permissions
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Role-based access control (RBAC), verification rules, and system data management.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
          >
            <RotateCcw size={14} />
            Reset Database
          </button>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-850 bg-emerald-50 dark:bg-emerald-950/60 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            {message}
          </div>
        )}

        {/* User Permissions Section (Role-Based Access Control) */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-8">
          <div className="border-b border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">User Permissions Matrix</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure role privileges for Student, Staff, and Admin</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Capability / Permission</th>
                  <th className="px-4 py-3.5 text-center">Student</th>
                  <th className="px-4 py-3.5 text-center">Staff</th>
                  <th className="px-4 py-3.5 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissionLabels.map(({ key, label, desc }) => (
                  <tr key={key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">{label}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{desc}</span>
                    </td>
                    {['student', 'staff', 'admin'].map((r) => (
                      <td key={r} className="px-4 py-3.5 text-center">
                        <label className="inline-flex cursor-pointer items-center justify-center">
                          <input
                            type="checkbox"
                            checked={Boolean(permissions[r]?.[key])}
                            disabled={r === 'admin' && key === 'system_config'}
                            onChange={() => togglePermission(r, key)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-700"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* System Policies */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <SlidersHorizontal size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Verification Policies &amp; Preferences</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure global workflow and verification behaviors</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {initialToggles.map(([name, description]) => (
              <div key={name} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={toggles[name]}
                  aria-label={name}
                  onClick={() => {
                    setToggles({ ...toggles, [name]: !toggles[name] })
                    setMessage(`Policy "${name}" preference saved.`)
                    window.setTimeout(() => setMessage(''), 3000)
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    toggles[name] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                      toggles[name] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Categories Preview */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <Tags size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Active Activity Categories</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configured taxonomy for student submissions</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-950/50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* Reset Confirmation Modal */}
        <Modal
          open={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title="Restore Default Application Data?"
          actions={
            <>
              <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleResetAllData}>
                Confirm Reset
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This will clear all student activities, departments, categories, and role permissions, restoring the system to its initial empty state.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60">
              ⚠️ This action cannot be undone. All records will be permanently removed.
            </p>
          </div>
        </Modal>
      </main>
    </AdminLayout>
  )
}
