import { Children, cloneElement, isValidElement, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CheckCircle2, Save, Send } from 'lucide-react'
import Button from '../../components/Button.jsx'
import DocumentUpload from '../../components/DocumentUpload.jsx'
import StudentLayout from '../../layouts/StudentLayout.jsx'
import { createActivity, getActivityById, updateActivity } from '../../services/activityService.js'
import { getCategories } from '../../services/studentService.js'
import { useAuth } from '../../context/authContextValue.js'

const levels = ['College', 'University', 'State', 'National', 'International']

const emptyForm = {
  name: '',
  category: '',
  level: '',
  date: new Date().toISOString().slice(0, 10),
  organizer: '',
  achievement: '',
  description: '',
  certificate: '',
  certificate_data: '',
}

const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'

export default function AddActivity() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const categories = getCategories()
  const editId = new URLSearchParams(location.search).get('edit')
  const existing = useMemo(() => (editId ? getActivityById(editId) : null), [editId])

  const [form, setForm] = useState(existing ? { ...emptyForm, ...existing } : emptyForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState('')

  const studentPrn = String(currentUser?.prn || 'PRN2024IT001').toUpperCase()
  const studentRollNo = String(currentUser?.roll_no || 'C1').toUpperCase()
  const studentName = currentUser?.name || 'Student'
  const studentDept = currentUser?.department || 'Information Technology'
  const studentYear = currentUser?.year || '2nd Year'

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleAction(intent) {
    const required =
      intent === 'draft'
        ? ['name']
        : ['name', 'category', 'level', 'date', 'organizer', 'achievement', 'description', 'certificate']

    const nextErrors = {}
    required.forEach((field) => {
      if (!String(form[field] ?? '').trim()) {
        nextErrors[field] = field === 'certificate' ? 'Certificate or proof document is required.' : 'This field is required.'
      }
    })

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(intent)

    const record = {
      ...form,
      student_id: studentPrn,
      prn: studentPrn,
      roll_no: studentRollNo,
      student_name: studentName,
      department: studentDept,
      year: studentYear,
      status: intent === 'draft' ? 'Draft' : 'Pending',
      remarks: intent === 'submit' && existing?.status === 'Rejected' ? '' : (form.remarks || ''),
    }

    if (existing) {
      updateActivity(existing.id, record)
    } else {
      createActivity(record)
    }

    setMessage(
      intent === 'draft'
        ? 'Draft saved successfully. You can return and complete it later.'
        : 'Activity submitted for verification! Your department coordinator has been notified.'
    )

    window.setTimeout(() => navigate('/student/activities'), 650)
  }

  return (
    <StudentLayout title={existing ? 'Edit Activity' : 'Add Activity'}>
      <main className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-700 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {existing ? 'Edit Activity Details' : 'Add New Activity'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Submit your co-curricular, extracurricular, technical, or academic achievement for college verification.
          </p>
        </div>

        {existing?.status === 'Rejected' && existing.remarks && (
          <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-800 dark:text-rose-300">
            <p className="font-bold">Reviewer Feedback for Revision:</p>
            <p className="mt-1">{existing.remarks}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-850 bg-emerald-50 dark:bg-emerald-950/60 p-4 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            {message}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8" noValidate>
          {/* Wireframe #2 Form Fields */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Activity Name" error={errors.name} required>
              <input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Category" error={errors.category} required>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                className={inputClass}
              >
                <option value="">Select Category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Level" error={errors.level} required>
              <select
                value={form.level}
                onChange={(e) => setField('level', e.target.value)}
                className={inputClass}
              >
                <option value="">Select Level</option>
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date" error={errors.date} required>
              <div className="relative">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setField('date', e.target.value)}
                  className={inputClass}
                />
                <CalendarDays size={16} className="pointer-events-none absolute right-3.5 top-4 text-slate-400 dark:text-slate-500" />
              </div>
            </Field>

            <Field label="Organizer" error={errors.organizer} required>
              <input
                value={form.organizer}
                onChange={(e) => setField('organizer', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Achievement" error={errors.achievement} required>
              <input
                value={form.achievement}
                onChange={(e) => setField('achievement', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description" error={errors.description} required>
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
            />
          </Field>

          {/* Wireframe #2 Upload Documents */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Upload Documents (Certificate / Proof) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400 dark:text-slate-500">PDF, JPG, PNG up to 10 MB</span>
            </div>
            <DocumentUpload
              value={form.certificate}
              onChange={(result) => {
                if (result && typeof result === 'object') {
                  setField('certificate', result.name)
                  setField('certificate_data', result.data || '')
                } else {
                  setField('certificate', result || '')
                  setField('certificate_data', '')
                }
              }}
            />
            {errors.certificate && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.certificate}
              </p>
            )}
          </div>

          {/* Wireframe #2 Actions: [ Save Draft ] [ Submit ] */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              disabled={Boolean(submitting)}
              onClick={() => navigate('/student/activities')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={submitting === 'draft'}
              disabled={Boolean(submitting)}
              onClick={() => handleAction('draft')}
              className="gap-2"
            >
              <Save size={16} /> Save Draft
            </Button>
            <Button
              type="button"
              loading={submitting === 'submit'}
              disabled={Boolean(submitting)}
              onClick={() => handleAction('submit')}
              className="gap-2"
            >
              <Send size={16} /> Submit
            </Button>
          </div>
        </form>
      </main>
    </StudentLayout>
  )
}

function Field({ label, error, required = false, children }) {
  const id = `activity-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  function attachId(element) {
    if (!isValidElement(element)) return element
    if (typeof element.type === 'string' && ['input', 'select', 'textarea'].includes(element.type)) {
      return cloneElement(element, {
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? `${id}-error` : undefined,
      })
    }
    return cloneElement(element, {}, Children.map(element.props.children, attachId))
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {attachId(children)}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  )
}
