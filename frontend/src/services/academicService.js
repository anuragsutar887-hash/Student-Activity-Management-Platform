/**
 * IT Pulse - Academic Service
 * Manages academic classes, staff assignments, class memberships, and audit logs.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const CLASSES_KEY = 'itpulse-academic-classes-v1'
const ASSIGNMENTS_KEY = 'itpulse-staff-assignments-v1'
const MEMBERSHIPS_KEY = 'itpulse-class-memberships-v1'
const AUDIT_KEY = 'itpulse-audit-logs-v1'
const EXTRA_STAFF_KEY = 'itpulse-extra-staff-v1'

function nextId(items) {
  const max = items.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0)
  return max + 1
}

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    const parsed = v ? JSON.parse(v) : null
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function persist(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* in-memory */ }
}

const SEED_CLASSES = [
  { id: 1, academic_session: '2026-27', year_level: 'FY', department: 'Information Technology', division: null, status: 'Active', created_at: new Date().toISOString() },
  { id: 2, academic_session: '2026-27', year_level: 'SY', department: 'Information Technology', division: null, status: 'Active', created_at: new Date().toISOString() },
  { id: 3, academic_session: '2026-27', year_level: 'TY', department: 'Information Technology', division: null, status: 'Active', created_at: new Date().toISOString() },
  { id: 4, academic_session: '2026-27', year_level: 'Final Year', department: 'Information Technology', division: null, status: 'Active', created_at: new Date().toISOString() },
]

let classStore = read(CLASSES_KEY, null)
if (!classStore) { classStore = SEED_CLASSES; persist(CLASSES_KEY, classStore) }

let assignmentStore = read(ASSIGNMENTS_KEY, [])
let membershipStore = read(MEMBERSHIPS_KEY, [])
let auditStore = read(AUDIT_KEY, [])

// AUDIT LOG
export function addAuditLog({ actor, actorRole = null, action, targetType = null, targetId = null, targetLabel = null, details = {} }) {
  const entry = {
    id: nextId(auditStore),
    actor,
    actor_role: actorRole,
    action,
    target_type: targetType,
    target_id: String(targetId ?? ''),
    target_label: targetLabel ?? '',
    details,
    created_at: new Date().toISOString(),
  }
  auditStore = [entry, ...auditStore].slice(0, 500)
  persist(AUDIT_KEY, auditStore)
  if (isSupabaseConfigured() && supabase) {
    supabase.from('audit_logs').insert([{ actor: entry.actor, actor_role: entry.actor_role, action: entry.action, target_type: entry.target_type, target_id: entry.target_id, target_label: entry.target_label, details: entry.details }]).then(({ error }) => { if (error) console.warn('Audit sync error:', error.message) })
  }
  return entry
}

export function getAuditLogs({ limit = 200 } = {}) { return auditStore.slice(0, limit) }

// ACADEMIC CLASSES
export function getAcademicClasses() { return classStore.filter(c => c.status === 'Active') }
export function getAllAcademicClasses() { return [...classStore] }
export function getAcademicClassById(id) { return classStore.find(c => String(c.id) === String(id)) ?? null }

function classLabel(c) { return `${c.academic_session} - ${c.year_level} - ${c.department}${c.division ? ` (${c.division})` : ''}` }

export function createAcademicClass({ academic_session, year_level, department, division = null }, actorEmail = 'admin') {
  const exists = classStore.find(c => c.academic_session === academic_session && c.year_level === year_level && c.department === department && (c.division ?? null) === (division ?? null))
  if (exists) throw new Error(`Academic group already exists: ${academic_session} - ${year_level} - ${department}`)
  const entry = { id: nextId(classStore), academic_session, year_level, department, division: division || null, status: 'Active', created_at: new Date().toISOString() }
  classStore = [...classStore, entry]
  persist(CLASSES_KEY, classStore)
  addAuditLog({ actor: actorEmail, actorRole: 'admin', action: 'academic_class_created', targetType: 'academic_class', targetId: entry.id, targetLabel: classLabel(entry) })
  if (isSupabaseConfigured() && supabase) { supabase.from('academic_classes').insert([{ academic_session, year_level, department, division: division || null }]).then(({ error }) => { if (error) console.warn('academic_classes sync error:', error.message) }) }
  return entry
}

export function updateAcademicClass(id, updates, actorEmail = 'admin') {
  let updated = null
  classStore = classStore.map(c => { if (String(c.id) !== String(id)) return c; updated = { ...c, ...updates }; return updated })
  if (updated) { persist(CLASSES_KEY, classStore); addAuditLog({ actor: actorEmail, actorRole: 'admin', action: 'academic_class_updated', targetType: 'academic_class', targetId: id }) }
  return updated
}

// STAFF ASSIGNMENTS
export function getStaffAssignments({ classId = null, staffEmail = null, status = 'Active' } = {}) {
  return assignmentStore.filter(a => {
    if (status && a.status !== status) return false
    if (classId != null && String(a.class_id) !== String(classId)) return false
    if (staffEmail && a.staff_email.toLowerCase() !== staffEmail.toLowerCase()) return false
    return true
  })
}
export function getAllStaffAssignments() { return [...assignmentStore] }
export function getAuthorizedClassIds(staffEmail) {
  return assignmentStore.filter(a => a.status === 'Active' && a.staff_email.toLowerCase() === staffEmail.toLowerCase()).map(a => Number(a.class_id))
}
export function getActiveAssignmentsForClass(classId) {
  return assignmentStore.filter(a => a.status === 'Active' && String(a.class_id) === String(classId))
}

export function assignStaff({ staffEmail, staffName, classId, notes = null }, actorEmail = 'admin') {
  const existing = assignmentStore.find(a => a.status === 'Active' && a.staff_email.toLowerCase() === staffEmail.toLowerCase() && String(a.class_id) === String(classId))
  if (existing) throw new Error(`${staffName} is already assigned to this academic group.`)
  const ac = getAcademicClassById(classId)
  const groupLabel = ac ? classLabel(ac) : `Group #${classId}`
  const entry = { id: nextId(assignmentStore), staff_email: staffEmail, staff_name: staffName, class_id: Number(classId), status: 'Active', assigned_by: actorEmail, assigned_at: new Date().toISOString(), revoked_at: null, revoked_by: null, notes: notes || null }
  assignmentStore = [...assignmentStore, entry]
  persist(ASSIGNMENTS_KEY, assignmentStore)
  addAuditLog({ actor: actorEmail, actorRole: 'admin', action: 'staff_assigned', targetType: 'staff_assignment', targetId: entry.id, targetLabel: `${staffName} -> ${groupLabel}`, details: { staffEmail, classId, groupLabel } })
  if (isSupabaseConfigured() && supabase) { supabase.from('staff_assignments').insert([{ staff_email: staffEmail, staff_name: staffName, class_id: Number(classId), assigned_by: actorEmail, notes: notes || null }]).then(({ error }) => { if (error) console.warn('staff_assignments sync error:', error.message) }) }
  return entry
}

export function revokeStaffAssignment(assignmentId, actorEmail = 'admin') {
  let revoked = null
  assignmentStore = assignmentStore.map(a => { if (String(a.id) !== String(assignmentId)) return a; revoked = { ...a, status: 'Revoked', revoked_at: new Date().toISOString(), revoked_by: actorEmail }; return revoked })
  if (revoked) {
    persist(ASSIGNMENTS_KEY, assignmentStore)
    const ac = getAcademicClassById(revoked.class_id)
    const groupLabel = ac ? classLabel(ac) : `Group #${revoked.class_id}`
    addAuditLog({ actor: actorEmail, actorRole: 'admin', action: 'staff_assignment_revoked', targetType: 'staff_assignment', targetId: assignmentId, targetLabel: `${revoked.staff_name} <- ${groupLabel}`, details: { staffEmail: revoked.staff_email, classId: revoked.class_id } })
    if (isSupabaseConfigured() && supabase) { supabase.from('staff_assignments').update({ status: 'Revoked', revoked_at: revoked.revoked_at, revoked_by: actorEmail }).eq('id', assignmentId).then(({ error }) => { if (error) console.warn('revoke sync error:', error.message) }) }
  }
  return revoked
}

export function reassignStaff({ classId, newStaffEmail, newStaffName, notes = null }, actorEmail = 'admin') {
  const activeForClass = assignmentStore.filter(a => a.status === 'Active' && String(a.class_id) === String(classId))
  for (const a of activeForClass) { revokeStaffAssignment(a.id, actorEmail) }
  return assignStaff({ staffEmail: newStaffEmail, staffName: newStaffName, classId, notes }, actorEmail)
}

// CLASS MEMBERSHIPS
export function getClassMemberships({ classId = null, studentPrn = null, status = 'Active' } = {}) {
  return membershipStore.filter(m => {
    if (status && m.status !== status) return false
    if (classId != null && String(m.class_id) !== String(classId)) return false
    if (studentPrn && m.student_prn.toLowerCase() !== studentPrn.toLowerCase()) return false
    return true
  })
}

export function enrollStudent({ studentPrn, studentName, studentEmail = null, classId, notes = null }, actorEmail = 'admin') {
  const existing = membershipStore.find(m => m.status === 'Active' && m.student_prn.toLowerCase() === studentPrn.toLowerCase() && String(m.class_id) === String(classId))
  if (existing) throw new Error(`${studentName} is already enrolled in this academic group.`)
  const ac = getAcademicClassById(classId)
  const groupLabel = ac ? classLabel(ac) : `Group #${classId}`
  const entry = { id: nextId(membershipStore), student_prn: studentPrn, student_name: studentName, student_email: studentEmail || null, class_id: Number(classId), status: 'Active', enrolled_by: actorEmail, enrolled_at: new Date().toISOString(), removed_at: null, removed_by: null, notes: notes || null }
  membershipStore = [...membershipStore, entry]
  persist(MEMBERSHIPS_KEY, membershipStore)
  addAuditLog({ actor: actorEmail, action: 'student_enrolled', targetType: 'class_membership', targetId: entry.id, targetLabel: `${studentName} (${studentPrn}) -> ${groupLabel}`, details: { studentPrn, classId, groupLabel } })
  if (isSupabaseConfigured() && supabase) { supabase.from('class_memberships').insert([{ student_prn: studentPrn, student_name: studentName, student_email: studentEmail, class_id: Number(classId), enrolled_by: actorEmail, notes: notes || null }]).then(({ error }) => { if (error) console.warn('membership enroll sync error:', error.message) }) }
  return entry
}

export function removeStudentFromClass(membershipId, actorEmail = 'admin') {
  let removed = null
  membershipStore = membershipStore.map(m => { if (String(m.id) !== String(membershipId)) return m; removed = { ...m, status: 'Removed', removed_at: new Date().toISOString(), removed_by: actorEmail }; return removed })
  if (removed) {
    persist(MEMBERSHIPS_KEY, membershipStore)
    addAuditLog({ actor: actorEmail, action: 'student_removed_from_class', targetType: 'class_membership', targetId: membershipId, targetLabel: `${removed.student_name} removed from group #${removed.class_id}`, details: { studentPrn: removed.student_prn, classId: removed.class_id } })
    if (isSupabaseConfigured() && supabase) { supabase.from('class_memberships').update({ status: 'Removed', removed_at: removed.removed_at, removed_by: actorEmail }).eq('id', membershipId).then(({ error }) => { if (error) console.warn('remove membership sync error:', error.message) }) }
  }
  return removed
}

export function getStudentClasses(studentPrn) {
  const active = membershipStore.filter(m => m.status === 'Active' && m.student_prn.toLowerCase() === studentPrn.toLowerCase())
  return active.map(m => getAcademicClassById(m.class_id)).filter(Boolean)
}

export function isStaffAuthorizedForStudent(staffEmail, studentPrn) {
  const authorizedClassIds = getAuthorizedClassIds(staffEmail)
  if (!authorizedClassIds.length) return false
  const studentMemberships = membershipStore.filter(m => m.status === 'Active' && m.student_prn.toLowerCase() === studentPrn.toLowerCase())
  return studentMemberships.some(m => authorizedClassIds.includes(Number(m.class_id)))
}

export function getStudentsForStaff(staffEmail) {
  const authorizedClassIds = getAuthorizedClassIds(staffEmail)
  if (!authorizedClassIds.length) return []
  return membershipStore.filter(m => m.status === 'Active' && authorizedClassIds.includes(Number(m.class_id)))
}

// EXTRA STAFF (multi-staff support beyond the hardcoded single account)
export function getExtraStaff() { return read(EXTRA_STAFF_KEY, []) }

export function addExtraStaff({ name, email, department = 'Information Technology', designation = 'Faculty' }, actorEmail = 'admin') {
  const existing = getExtraStaff()
  if (existing.find(s => s.email.toLowerCase() === email.toLowerCase())) throw new Error(`Staff member with email ${email} already exists.`)
  const entry = { id: nextId(existing), name, email, department, designation, role: 'staff', status: 'Active', created_at: new Date().toISOString() }
  persist(EXTRA_STAFF_KEY, [...existing, entry])
  addAuditLog({ actor: actorEmail, actorRole: 'admin', action: 'staff_account_created', targetType: 'staff', targetId: entry.id, targetLabel: `${name} (${email})` })
  return entry
}

export function updateExtraStaff(id, updates, actorEmail = 'admin') {
  const existing = getExtraStaff()
  let updated = null
  const next = existing.map(s => { if (String(s.id) !== String(id)) return s; updated = { ...s, ...updates }; return updated })
  persist(EXTRA_STAFF_KEY, next)
  if (updated) addAuditLog({ actor: actorEmail, actorRole: 'admin', action: 'staff_account_updated', targetType: 'staff', targetId: id, targetLabel: updated.name })
  return updated
}

export function deactivateExtraStaff(id, actorEmail = 'admin') { return updateExtraStaff(id, { status: 'Inactive' }, actorEmail) }

export function getAllStaffList() {
  const extra = getExtraStaff()
  const builtin = [{ id: 201, name: 'Prof. Faculty Coordinator', email: 'faculty@itpulse.edu', department: 'Information Technology', designation: 'Department Activity Coordinator', role: 'staff', status: 'Active' }]
  const extraEmails = new Set(extra.map(s => s.email.toLowerCase()))
  return [...builtin.filter(s => !extraEmails.has(s.email.toLowerCase())), ...extra]
}