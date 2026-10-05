import { Fragment, useMemo, useState } from 'react'
import { Building2, Download, Eye, Pencil, Plus, Search, Tags, Trash2, UserCog, Users } from 'lucide-react'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import { getAllActivities } from '../../services/activityService.js'
import {
  deactivateStaff, deactivateStudent, getCategories, getDepartments, getStaff, getStudents, removeCategory,
  removeDepartment, saveCategory, saveDepartment,
  saveStaff, saveStudent,
} from '../../services/studentService.js'

const definitions = {
  students: { title: 'Manage Students', singular: 'Student', Icon: Users, idLabel: 'PRN', fields: [['name', 'Full name'], ['roll_no', 'Roll No'], ['email', 'Email'], ['department', 'Department'], ['year', 'Year'], ['phone', 'Phone'], ['status', 'Status']] },
  staff: { title: 'Manage Staff', singular: 'Staff Member', Icon: UserCog, idLabel: 'Staff ID', fields: [['name', 'Full name'], ['email', 'Email'], ['department', 'Department'], ['designation', 'Designation'], ['phone', 'Phone'], ['status', 'Status']] },
  departments: { title: 'Manage Departments', singular: 'Department', Icon: Building2, fields: [['name', 'Department name']] },
  categories: { title: 'Manage Categories', singular: 'Category', Icon: Tags, fields: [['name', 'Category name']] },
}
const fieldClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'

function initialRecords(resource) {
  if (resource === 'students') return getStudents()
  if (resource === 'staff') return getStaff()
  const names = resource === 'departments' ? getDepartments() : getCategories()
  return names.map((name, index) => ({ id: index + 1, name }))
}

export default function ManageRecords({ resource }) {
  const config = definitions[resource]
  const { Icon } = config
  const [records, setRecords] = useState(() => initialRecords(resource))
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({})
  const [formError, setFormError] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All departments')
  const [yearFilter, setYearFilter] = useState('All years')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [notice, setNotice] = useState('')
  const activities = getAllActivities()
  const extraColumns = resource === 'students' ? ['Activities'] : resource === 'staff' ? ['Verified Activities'] : resource === 'departments' ? ['HOD', 'Students', 'Staff', 'Activities', 'Status'] : ['Description', 'Activity Count', 'Status']
  function extraValues(record) {
    if (resource === 'students') return [activities.filter((activity) => String(activity.student_id) === String(record.id)).length]
    if (resource === 'staff') return [activities.filter((activity) => activity.status === 'Verified' && activity.verified_by === record.name).length]
    if (resource === 'departments') return [record.hod || 'Department HOD', getStudents().filter((student) => student.department === record.name).length, getStaff().filter((person) => person.department === record.name).length, activities.filter((activity) => activity.department === record.name).length, 'Active']
    const descriptions = { Technical: 'Technology, coding and engineering events', Sports: 'Sports, fitness and athletic participation', Cultural: 'Arts, culture and campus events', Research: 'Research projects and scholarly work', Social: 'Community service and social impact', Academic: 'Academic programs and coursework', Professional: 'Career and professional development', Other: 'Other approved student achievements' }
    return [record.description || descriptions[record.name] || `${record.name} student activities`, activities.filter((activity) => activity.category === record.name).length, 'Active']
  }
  const rows = useMemo(() => records.filter((record) => Object.values(record).join(' ').toLowerCase().includes(query.toLowerCase()) && (departmentFilter === 'All departments' || record.department === departmentFilter) && (yearFilter === 'All years' || record.year === yearFilter) && (statusFilter === 'All statuses' || record.status === statusFilter)), [records, query, departmentFilter, yearFilter, statusFilter])

  function openForm(record = null) {
    setEditing(record ?? {})
    setForm(record ? { ...record } : { status: 'Active', department: 'Information Technology' })
    setFormError('')
  }

  function save(event) {
    event.preventDefault()
    const name = String(form.name ?? '').trim()
    if (!name) { setFormError('Enter a name before saving.'); return }

    if (['departments', 'categories'].includes(resource) && records.some((record) => record.id !== editing?.id && record.name.toLowerCase() === name.toLowerCase())) {
      setFormError(`That ${config.singular.toLowerCase()} already exists.`)
      return
    }
    if (form.id && !editing?.id && records.some((record) => String(record.id) === String(form.id))) {
      setFormError(`That ${config.idLabel.toLowerCase()} is already in use.`)
      return
    }

    let next
    const details = { ...form, name, id: form.id ? Number(form.id) : undefined }
    if (resource === 'students') next = saveStudent(details)
    else if (resource === 'staff') next = saveStaff(details)
    else if (resource === 'departments') {
      saveDepartment(name, editing?.id ? editing.name : '')
      next = { name, id: editing?.id ?? Date.now() }
    } else {
      saveCategory(name, editing?.id ? editing.name : '')
      next = { name, id: editing?.id ?? Date.now() }
    }

    setRecords((current) => editing?.id ? current.map((record) => record.id === editing.id ? next : record) : [...current, next])
    setNotice(`${config.singular} ${editing?.id ? 'updated' : 'added'} successfully.`)
    setEditing(null)
  }

  function confirmDelete() {
    if (resource === 'students') {
      const updated = deactivateStudent(deleting.id)
      setRecords((current) => current.map((record) => record.id === deleting.id ? updated : record))
    } else if (resource === 'staff') {
      const updated = deactivateStaff(deleting.id)
      setRecords((current) => current.map((record) => record.id === deleting.id ? updated : record))
    } else {
      if (resource === 'departments') removeDepartment(deleting.name)
      if (resource === 'categories') removeCategory(deleting.name)
      setRecords((current) => current.filter((record) => record.id !== deleting.id))
    }
    setNotice(`${config.singular} ${['students','staff'].includes(resource) ? 'deactivated' : 'deleted'} successfully.`)
    setDeleting(null)
  }

  function exportRecords() {
    const rows = [config.fields.map(([, label]) => label), ...records.map((record) => config.fields.map(([key]) => record[key] ?? ''))]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${resource}.csv`; anchor.click(); URL.revokeObjectURL(url)
  }

  return <AdminLayout title={config.title}><main>
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Administration</p><h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{config.title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and maintain institution records.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={exportRecords}><Download size={16}/>Export</Button><Button onClick={() => openForm()}><Plus size={17} />Add {config.singular}</Button></div></div>
    {notice&&<p role="status" className="mb-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">{notice}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-700"><span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"><Icon size={18} className="text-indigo-600" />{records.length} records</span><label className="relative sm:col-span-2"><span className="sr-only">Search records</span><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" /></label>{resource==='students'&&<>{getDepartments().length > 1 && <select aria-label="Filter department" value={departmentFilter} onChange={e=>setDepartmentFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><option>All departments</option>{getDepartments().map(department=><option key={department}>{department}</option>)}</select>}<select aria-label="Filter year" value={yearFilter} onChange={e=>setYearFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><option>All years</option>{['1st Year','2nd Year','2nd Year','4th Year'].map(year=><option key={year}>{year}</option>)}</select></>}{['students','staff'].includes(resource)&&<select aria-label="Filter status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><option>All statuses</option><option>Active</option><option>Inactive</option></select>}</div>
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-500">{config.fields.map(([key, label], index) => <Fragment key={key}><th className="px-4 py-3">{label}</th>{index === 0 && config.idLabel && <th className="px-4 py-3">{config.idLabel}</th>}</Fragment>)}{extraColumns.map((column)=><th key={column} className="px-4 py-3">{column}</th>)}<th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{rows.map((record) => <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">{config.fields.map(([key], index) => <Fragment key={key}><td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{record[key] || '—'}</td>{index === 0 && config.idLabel && <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">{record.id}</td>}</Fragment>)}{extraValues(record).map((value,index)=><td key={extraColumns[index]} className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{value}</td>)}<td className="px-5 py-4"><div className="flex justify-end gap-1"><IconButton label={`View ${config.singular}`} onClick={() => setViewing(record)}><Eye size={16} /></IconButton><IconButton label={`Edit ${config.singular}`} onClick={() => openForm(record)}><Pencil size={16} /></IconButton><IconButton label={`${['students','staff'].includes(resource)?'Deactivate':'Delete'} ${config.singular}`} danger onClick={() => setDeleting(record)}><Trash2 size={16} /></IconButton></div></td></tr>)}</tbody></table></div>
      <div className="space-y-3 p-4 md:hidden">{rows.map((record) => <article key={record.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-slate-100">{record.name}</h3>{config.idLabel && <p className="text-xs text-slate-400">{config.idLabel}: {record.id}</p>}</div><span className="text-xs text-slate-500 dark:text-slate-400">{record.status || ''}</span></div><div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">{config.fields.filter(([key]) => key !== 'name').map(([key, label]) => <p key={key}>{label}: {record[key] || '—'}</p>)}</div><div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setViewing(record)}>View</Button><Button variant="secondary" onClick={() => openForm(record)}><Pencil size={15} />Edit</Button><Button variant="danger" onClick={() => setDeleting(record)}><Trash2 size={15} />{['students','staff'].includes(resource) ? 'Deactivate' : 'Delete'}</Button></div></article>)}</div>
      {rows.length === 0 && <p className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No records found.</p>}
    </section>

    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`${editing?.id ? 'Edit' : 'Add'} ${config.singular}`} actions={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="record-form">Save record</Button></>}>
      <form id="record-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        {config.idLabel && editing && !editing.id && <Field label={`${config.idLabel} (optional)`}><input type="number" value={form.id || ''} onChange={(event) => { setForm({ ...form, id: event.target.value }); setFormError('') }} className={fieldClass} /></Field>}
        {config.fields.map(([key, label]) => <Field key={key} label={label}>{key === 'status' ? <select value={form.status || 'Active'} onChange={(event) => setForm({ ...form, status: event.target.value })} className={fieldClass}><option>Active</option><option>Inactive</option></select> : key === 'department' ? <select required value={form.department || 'Information Technology'} onChange={(event) => setForm({ ...form, department: event.target.value })} className={fieldClass}>{getDepartments().map((department)=><option key={department} value={department}>{department}</option>)}</select> : key === 'year' ? <select value={form.year || ''} onChange={(event) => setForm({ ...form, year: event.target.value })} className={fieldClass}><option value="">Choose year</option>{['1st Year','2nd Year','2nd Year','4th Year'].map((year)=><option key={year}>{year}</option>)}</select> : <input required={['name','email'].includes(key)} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} value={form[key] || ''} onChange={(event) => { setForm({ ...form, [key]: event.target.value }); setFormError('') }} className={fieldClass} />}</Field>)}
        {formError && <p className="text-sm text-rose-600 sm:col-span-2" role="alert">{formError}</p>}
      </form>
    </Modal>
    <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={`${config.singular} details`}>{viewing && <dl className="space-y-3">{Object.entries(viewing).map(([key, value]) => <div key={key}><dt className="text-xs font-semibold uppercase text-slate-400">{key.replaceAll('_', ' ')}</dt><dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{String(value)}</dd></div>)}</dl>}</Modal>
    <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title={`${['students','staff'].includes(resource) ? 'Deactivate' : 'Delete'} ${config.singular.toLowerCase()}?`} actions={<><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" onClick={confirmDelete}>{['students','staff'].includes(resource) ? 'Deactivate' : 'Delete'}</Button></>}>{deleting && <p className="text-sm text-slate-600 dark:text-slate-300">{['students','staff'].includes(resource) ? `Set ${deleting.name} to inactive? Their activity records will be retained.` : `Permanently remove ${deleting.name} from the records?`}</p>}</Modal>
  </main></AdminLayout>
}

function Field({ label, children }) { return <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}{children}</label> }
function IconButton({ label, children, onClick, danger = false }) { return <button type="button" aria-label={label} onClick={onClick} className={`rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${danger ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{children}</button> }

