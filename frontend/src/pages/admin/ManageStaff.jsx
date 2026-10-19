import { useMemo, useState } from 'react'
import {
  BookOpen, Building2, Calendar, Check, ChevronDown, Edit2, Plus, Search,
  ShieldCheck, ShieldOff, Trash2, UserCheck, UserCog, UserPlus, X,
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { useAuth } from '../../context/authContextValue.js'
import {
  getAllStaffList, addExtraStaff, updateExtraStaff, deactivateExtraStaff,
  getAllStaffAssignments, assignStaff, revokeStaffAssignment, reassignStaff,
  getAcademicClasses,
} from '../../services/academicService.js'
import { getDepartments } from '../../services/studentService.js'

const YEAR_LEVELS = ['FY', 'SY', 'TY', 'Final Year']
const SESSIONS = ['2024-25', '2025-26', '2026-27', '2027-28']

function classLabel(c) {
  return `${c.academic_session} - ${c.year_level} - ${c.department}${c.division ? ` (${c.division})` : ''}`
}

export default function ManageStaff() {
  const { currentUser } = useAuth()
  const adminEmail = currentUser?.email || 'admin@itpulse.edu'

  const [staffList, setStaffList] = useState(() => getAllStaffList())
  const [assignments, setAssignments] = useState(() => getAllStaffAssignments())
  const classes = getAcademicClasses()
  const departments = getDepartments()

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('success')

  // Modals
  const [addStaffOpen, setAddStaffOpen] = useState(false)
  const [editStaffOpen, setEditStaffOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)

  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  // Forms
  const [form, setForm] = useState({ name: '', email: '', department: 'Information Technology', designation: 'Faculty' })
  const [assignForm, setAssignForm] = useState({ classId: '', notes: '' })
  const [formError, setFormError] = useState('')

  function showNotice(msg, type = 'success') {
    setNotice(msg); setNoticeType(type)
    window.setTimeout(() => setNotice(''), 4500)
  }

  function refreshStores() {
    setStaffList(getAllStaffList())
    setAssignments(getAllStaffAssignments())
  }

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return staffList.filter(s => {
      const matchesQuery = !q || `${s.name} ${s.email} ${s.department} ${s.designation || ''}`.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [staffList, searchQuery, statusFilter])

  function getStaffAssignments(email) {
    return assignments.filter(a => a.staff_email.toLowerCase() === email.toLowerCase() && a.status === 'Active')
  }

  function handleAddStaff(e) {
    e.preventDefault(); setFormError('')
    if (!form.name.trim()) { setFormError('Name is required.'); return }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setFormError('Valid email is required.'); return }
    try {
      addExtraStaff({ name: form.name.trim(), email: form.email.trim().toLowerCase(), department: form.department, designation: form.designation }, adminEmail)
      refreshStores()
      setAddStaffOpen(false)
      setForm({ name: '', email: '', department: 'Information Technology', designation: 'Faculty' })
      showNotice(`Staff member "${form.name.trim()}" added successfully.`)
    } catch (err) { setFormError(err.message) }
  }

  function handleEditStaff(e) {
    e.preventDefault(); setFormError('')
    if (!selectedStaff?.id) return
    try {
      updateExtraStaff(selectedStaff.id, { name: form.name.trim(), department: form.department, designation: form.designation }, adminEmail)
      refreshStores()
      setEditStaffOpen(false)
      showNotice(`Staff member "${form.name.trim()}" updated successfully.`)
    } catch (err) { setFormError(err.message) }
  }

  function handleDeactivate() {
    if (!selectedStaff?.id) return
    try {
      deactivateExtraStaff(selectedStaff.id, adminEmail)
      refreshStores()
      setDeactivateOpen(false)
      showNotice(`${selectedStaff.name} has been deactivated.`, 'warning')
    } catch (err) { showNotice(err.message, 'error') }
  }

  function handleAssign(e) {
    e.preventDefault(); setFormError('')
    if (!assignForm.classId) { setFormError('Please select an academic group.'); return }
    if (!selectedStaff) return
    try {
      assignStaff({ staffEmail: selectedStaff.email, staffName: selectedStaff.name, classId: Number(assignForm.classId), notes: assignForm.notes || null }, adminEmail)
      refreshStores()
      setAssignOpen(false)
      setAssignForm({ classId: '', notes: '' })
      showNotice(`${selectedStaff.name} assigned successfully.`)
    } catch (err) { setFormError(err.message) }
  }

  function handleRevoke() {
    if (!selectedAssignment) return
    try {
      revokeStaffAssignment(selectedAssignment.id, adminEmail)
      refreshStores()
      setRevokeOpen(false)
      showNotice('Assignment revoked. Staff member no longer has access to this group.', 'warning')
    } catch (err) { showNotice(err.message, 'error') }
  }

  function openAssign(staff) {
    setSelectedStaff(staff); setAssignForm({ classId: '', notes: '' }); setFormError(''); setAssignOpen(true)
  }

  function openRevoke(assignment) {
    setSelectedAssignment(assignment); setRevokeOpen(true)
  }

  function openEdit(staff) {
    setSelectedStaff(staff)
    setForm({ name: staff.name, email: staff.email, department: staff.department || 'Information Technology', designation: staff.designation || 'Faculty' })
    setFormError(''); setEditStaffOpen(true)
  }

  function openDeactivate(staff) { setSelectedStaff(staff); setDeactivateOpen(true) }

  const inputClass = 'mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

  return (
    <AdminLayout title="Staff & Permissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Staff & Permissions</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage faculty accounts and authorize academic group access</p>
          </div>
          <button
            id="btn-add-staff"
            type="button"
            onClick={() => { setForm({ name: '', email: '', department: 'Information Technology', designation: 'Faculty' }); setFormError(''); setAddStaffOpen(true) }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            <UserPlus size={16} /> Add Staff Member
          </button>
        </div>

        {/* Notice */}
        {notice && (
          <div role="status" className={`rounded-2xl p-4 text-sm font-semibold border ${noticeType === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : noticeType === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'}`}>
            {notice}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="staff-search"
              type="text"
              placeholder="Search by name, email, department…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Staff Cards */}
        {filteredStaff.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-12 text-center">
            <UserCog className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="text-slate-500 dark:text-slate-400">No staff members found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredStaff.map(staff => {
              const activeAssignments = getStaffAssignments(staff.email)
              const isBuiltin = staff.id === 201
              return (
                <div key={staff.email} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-lg font-bold text-indigo-700 dark:text-indigo-300">
                        {staff.name.trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{staff.name}</h3>
                          {isBuiltin && <span className="rounded-full bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">Built-in</span>}
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${staff.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'}`}>{staff.status}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{staff.email}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{staff.department} · {staff.designation || 'Faculty'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        id={`btn-assign-${staff.id}`}
                        type="button"
                        onClick={() => openAssign(staff)}
                        disabled={staff.status === 'Inactive'}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <UserCheck size={13} /> Assign Group
                      </button>
                      {!isBuiltin && (
                        <>
                          <button id={`btn-edit-${staff.id}`} type="button" onClick={() => openEdit(staff)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition">
                            <Edit2 size={13} /> Edit
                          </button>
                          {staff.status === 'Active' && (
                            <button id={`btn-deactivate-${staff.id}`} type="button" onClick={() => openDeactivate(staff)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition">
                              <ShieldOff size={13} /> Deactivate
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Active Assignments */}
                  {activeAssignments.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Active Group Assignments</p>
                      <div className="flex flex-col gap-2">
                        {activeAssignments.map(a => {
                          const ac = classes.find(c => String(c.id) === String(a.class_id))
                          return (
                            <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/40 px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <BookOpen size={14} className="text-indigo-500" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{ac ? classLabel(ac) : `Group #${a.class_id}`}</span>
                                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Active</span>
                              </div>
                              <button
                                id={`btn-revoke-${a.id}`}
                                type="button"
                                onClick={() => openRevoke(a)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-800 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                              >
                                <X size={11} /> Revoke
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal open={addStaffOpen} onClose={() => setAddStaffOpen(false)} title="Add Staff Member">
        <form id="form-add-staff" onSubmit={handleAddStaff} className="space-y-4 p-4">
          {formError && <p className="rounded-xl bg-rose-50 dark:bg-rose-900/20 p-3 text-sm text-rose-700 dark:text-rose-300">{formError}</p>}
          <div>
            <label htmlFor="add-staff-name" className={labelClass}>Full Name *</label>
            <input id="add-staff-name" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prof. Jane Smith" required />
          </div>
          <div>
            <label htmlFor="add-staff-email" className={labelClass}>Email Address *</label>
            <input id="add-staff-email" type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane.smith@itpulse.edu" required />
          </div>
          <div>
            <label htmlFor="add-staff-dept" className={labelClass}>Department</label>
            <select id="add-staff-dept" className={inputClass} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="add-staff-desig" className={labelClass}>Designation</label>
            <input id="add-staff-desig" className={inputClass} value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="Department Activity Coordinator" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAddStaffOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" id="btn-confirm-add-staff" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">Add Staff</button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal open={editStaffOpen} onClose={() => setEditStaffOpen(false)} title={`Edit — ${selectedStaff?.name}`}>
        <form id="form-edit-staff" onSubmit={handleEditStaff} className="space-y-4 p-4">
          {formError && <p className="rounded-xl bg-rose-50 dark:bg-rose-900/20 p-3 text-sm text-rose-700 dark:text-rose-300">{formError}</p>}
          <div>
            <label htmlFor="edit-staff-name" className={labelClass}>Full Name *</label>
            <input id="edit-staff-name" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>Email (read-only)</label>
            <input className={`${inputClass} opacity-60 cursor-not-allowed`} value={form.email} disabled />
          </div>
          <div>
            <label htmlFor="edit-staff-dept" className={labelClass}>Department</label>
            <select id="edit-staff-dept" className={inputClass} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="edit-staff-desig" className={labelClass}>Designation</label>
            <input id="edit-staff-desig" className={inputClass} value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditStaffOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Assign Group Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title={`Assign Group — ${selectedStaff?.name}`}>
        <form id="form-assign-group" onSubmit={handleAssign} className="space-y-4 p-4">
          {formError && <p className="rounded-xl bg-rose-50 dark:bg-rose-900/20 p-3 text-sm text-rose-700 dark:text-rose-300">{formError}</p>}
          <div>
            <label htmlFor="assign-class-select" className={labelClass}>Academic Group *</label>
            <select id="assign-class-select" className={inputClass} value={assignForm.classId} onChange={e => setAssignForm(f => ({ ...f, classId: e.target.value }))}>
              <option value="">Select academic group…</option>
              {classes.map(c => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="assign-notes" className={labelClass}>Notes (optional)</label>
            <textarea id="assign-notes" rows={2} className={`${inputClass} h-auto py-2`} value={assignForm.notes} onChange={e => setAssignForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any context for this assignment…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAssignOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="submit" id="btn-confirm-assign" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Assign</button>
          </div>
        </form>
      </Modal>

      {/* Revoke Modal */}
      <Modal open={revokeOpen} onClose={() => setRevokeOpen(false)} title="Revoke Assignment">
        <div className="space-y-4 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to revoke this staff assignment? The staff member will immediately lose access to activities in this group. Historical review records are preserved.
          </p>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <strong>{selectedAssignment?.staff_name}</strong> — Group #{selectedAssignment?.class_id}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setRevokeOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="button" id="btn-confirm-revoke" onClick={handleRevoke} className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition">Revoke Access</button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Modal */}
      <Modal open={deactivateOpen} onClose={() => setDeactivateOpen(false)} title="Deactivate Staff Account">
        <div className="space-y-4 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This will deactivate <strong>{selectedStaff?.name}</strong>. All active group assignments will be preserved but should be manually revoked if needed.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDeactivateOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="button" id="btn-confirm-deactivate" onClick={handleDeactivate} className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700">Deactivate</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}