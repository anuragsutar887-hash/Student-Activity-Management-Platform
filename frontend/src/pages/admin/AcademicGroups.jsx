import { useMemo, useState } from 'react'
import {
  BookOpen, Calendar, ChevronRight, Edit2, Plus, Search,
  Trash2, Users, X, Building2, GraduationCap
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import Modal from '../../components/Modal.jsx'
import { useAuth } from '../../context/authContextValue.js'
import {
  getAcademicClasses, getAllAcademicClasses, createAcademicClass, updateAcademicClass,
  getActiveAssignmentsForClass, getClassMemberships, enrollStudent, removeStudentFromClass,
} from '../../services/academicService.js'
import { getStudents, getDepartments } from '../../services/studentService.js'

const YEAR_LEVELS = ['FY', 'SY', 'TY', 'Final Year']
const SESSIONS = ['2024-25', '2025-26', '2026-27', '2027-28']

function classLabel(c) {
  return `${c.academic_session} - ${c.year_level} - ${c.department}${c.division ? ` (${c.division})` : ''}`
}

export default function AcademicGroups() {
  const { currentUser } = useAuth()
  const adminEmail = currentUser?.email || 'admin@itpulse.edu'

  const [classes, setClasses] = useState(() => getAllAcademicClasses())
  const [selectedClass, setSelectedClass] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [assignments, setAssignments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState(null)

  const [createForm, setCreateForm] = useState({ academic_session: '2026-27', year_level: 'FY', department: 'Information Technology', division: '' })
  const [enrollSearch, setEnrollSearch] = useState('')
  const [enrollSelected, setEnrollSelected] = useState(null)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const departments = getDepartments()
  const allStudents = getStudents()

  function showNotice(msg) { setNotice(msg); window.setTimeout(() => setNotice(''), 4500) }

  function refreshClass(c) {
    if (!c) return
    setMemberships(getClassMemberships({ classId: c.id, status: 'Active' }))
    setAssignments(getActiveAssignmentsForClass(c.id))
    setClasses(getAllAcademicClasses())
  }

  function selectClass(c) {
    setSelectedClass(c)
    setMemberships(getClassMemberships({ classId: c.id, status: 'Active' }))
    setAssignments(getActiveAssignmentsForClass(c.id))
  }

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return classes.filter(c => !q || classLabel(c).toLowerCase().includes(q))
  }, [classes, searchQuery])

  const enrollSuggestions = useMemo(() => {
    const q = enrollSearch.trim().toLowerCase()
    if (!q) return []
    const enrolled = new Set(memberships.map(m => m.student_prn.toLowerCase()))
    return allStudents.filter(s => {
      const prn = String(s.prn || s.default_prn || '').toLowerCase()
      const match = `${s.name} ${s.email} ${prn} ${s.roll_no}`.toLowerCase().includes(q)
      return match && !enrolled.has(prn)
    }).slice(0, 8)
  }, [enrollSearch, memberships, allStudents])

  function handleCreateClass(e) {
    e.preventDefault(); setFormError('')
    try {
      createAcademicClass({ academic_session: createForm.academic_session, year_level: createForm.year_level, department: createForm.department, division: createForm.division || null }, adminEmail)
      setClasses(getAllAcademicClasses())
      setCreateOpen(false)
      showNotice('Academic group created successfully.')
    } catch (err) { setFormError(err.message) }
  }

  function handleEnroll(e) {
    e.preventDefault(); setFormError('')
    if (!enrollSelected) { setFormError('Please search and select a student.'); return }
    if (!selectedClass) return
    try {
      const prn = String(enrollSelected.prn || enrollSelected.default_prn || enrollSelected.roll_no || '')
      enrollStudent({ studentPrn: prn, studentName: enrollSelected.name, studentEmail: enrollSelected.email, classId: selectedClass.id }, adminEmail)
      refreshClass(selectedClass)
      setEnrollOpen(false)
      setEnrollSearch(''); setEnrollSelected(null)
      showNotice(`${enrollSelected.name} enrolled successfully.`)
    } catch (err) { setFormError(err.message) }
  }

  function handleRemove() {
    if (!selectedMembership) return
    try {
      removeStudentFromClass(selectedMembership.id, adminEmail)
      refreshClass(selectedClass)
      setRemoveOpen(false)
      showNotice(`${selectedMembership.student_name} removed from this group.`)
    } catch (err) { showNotice(err.message) }
  }

  const inputClass = 'mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

  return (
    <AdminLayout title="Academic Groups">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Academic Groups</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage academic classes, enroll students, and view assignments</p>
          </div>
          <button id="btn-create-group" type="button" onClick={() => { setFormError(''); setCreateOpen(true) }} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            <Plus size={16} /> Create Group
          </button>
        </div>

        {notice && <div role="status" className="rounded-2xl p-4 text-sm font-semibold border bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">{notice}</div>}

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Classes List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search groups…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500" />
            </div>
            {filteredClasses.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-8 text-center text-sm text-slate-400">No groups found.</div>
            ) : (
              filteredClasses.map(c => (
                <button key={c.id} type="button" onClick={() => selectClass(c)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selectedClass?.id === c.id ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-indigo-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.year_level} — {c.department}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{c.academic_session}{c.division ? ` · Div ${c.division}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Group Detail */}
          <div className="lg:col-span-3">
            {!selectedClass ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-12 text-center">
                <BookOpen className="mx-auto mb-3 text-slate-300" size={40} />
                <p className="text-slate-500 dark:text-slate-400">Select an academic group to see details</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{classLabel(selectedClass)}</h2>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3">
                      <p className="text-xs text-slate-400">Enrolled Students</p>
                      <p className="text-2xl font-bold text-indigo-600">{memberships.length}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3">
                      <p className="text-xs text-slate-400">Assigned Staff</p>
                      <p className="text-2xl font-bold text-emerald-600">{assignments.length}</p>
                    </div>
                  </div>
                  {assignments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-400 mb-1">Authorized Staff</p>
                      {assignments.map(a => (
                        <span key={a.id} className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mr-2 mb-1">{a.staff_name}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Students */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Students ({memberships.length})</h3>
                    <button id="btn-enroll-student" type="button" onClick={() => { setEnrollSearch(''); setEnrollSelected(null); setFormError(''); setEnrollOpen(true) }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition">
                      <UserPlus size={13} /> Enroll Student
                    </button>
                  </div>
                  {memberships.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No students enrolled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {memberships.map(m => (
                        <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/40 px-4 py-2.5">
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.student_name}</p>
                            <p className="text-xs text-slate-400">{m.student_prn} · {m.student_email}</p>
                          </div>
                          <button id={`btn-remove-${m.id}`} type="button" onClick={() => { setSelectedMembership(m); setRemoveOpen(true) }}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-800 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 transition">
                            <X size={11} /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Academic Group">
        <form id="form-create-group" onSubmit={handleCreateClass} className="space-y-4 p-4">
          {formError && <p className="rounded-xl bg-rose-50 dark:bg-rose-900/20 p-3 text-sm text-rose-700 dark:text-rose-300">{formError}</p>}
          <div>
            <label htmlFor="create-session" className={labelClass}>Academic Session *</label>
            <select id="create-session" className={inputClass} value={createForm.academic_session} onChange={e => setCreateForm(f => ({ ...f, academic_session: e.target.value }))}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="create-year" className={labelClass}>Academic Year *</label>
            <select id="create-year" className={inputClass} value={createForm.year_level} onChange={e => setCreateForm(f => ({ ...f, year_level: e.target.value }))}>
              {YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="create-dept" className={labelClass}>Department *</label>
            <select id="create-dept" className={inputClass} value={createForm.department} onChange={e => setCreateForm(f => ({ ...f, department: e.target.value }))}>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="create-division" className={labelClass}>Division (optional)</label>
            <input id="create-division" className={inputClass} value={createForm.division} onChange={e => setCreateForm(f => ({ ...f, division: e.target.value }))} placeholder="A, B, C…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="submit" id="btn-confirm-create-group" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Create Group</button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal open={enrollOpen} onClose={() => setEnrollOpen(false)} title="Enroll Student">
        <form id="form-enroll-student" onSubmit={handleEnroll} className="space-y-4 p-4">
          {formError && <p className="rounded-xl bg-rose-50 dark:bg-rose-900/20 p-3 text-sm text-rose-700 dark:text-rose-300">{formError}</p>}
          <div>
            <label className={labelClass}>Search Student</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Name, PRN, email, roll no…" value={enrollSearch} onChange={e => { setEnrollSearch(e.target.value); setEnrollSelected(null) }}
                className={`${inputClass} pl-9`} />
            </div>
            {enrollSuggestions.length > 0 && (
              <div className="mt-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
                {enrollSuggestions.map(s => (
                  <button key={s.roll_no} type="button" onClick={() => { setEnrollSelected(s); setEnrollSearch(s.name) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {s.name.trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.prn || s.default_prn} · {s.roll_no} · {s.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {enrollSelected && (
              <div className="mt-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Selected: <strong>{enrollSelected.name}</strong> ({enrollSelected.prn || enrollSelected.default_prn})
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEnrollOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="submit" id="btn-confirm-enroll" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Enroll</button>
          </div>
        </form>
      </Modal>

      {/* Remove Student Modal */}
      <Modal open={removeOpen} onClose={() => setRemoveOpen(false)} title="Remove Student">
        <div className="space-y-4 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Remove <strong>{selectedMembership?.student_name}</strong> from this group? Their activity history is preserved.</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setRemoveOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="button" id="btn-confirm-remove" onClick={handleRemove} className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700">Remove</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}

// Missing import fix
function UserPlus({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  )
}