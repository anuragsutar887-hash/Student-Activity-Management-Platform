import { useMemo, useState } from 'react'
import { Award, BadgeCheck, CheckCircle2, Clock3, Mail, Medal, Pencil, Phone, Save, School, XCircle } from 'lucide-react'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import Modal from '../../components/Modal.jsx'
import StudentLayout from '../../layouts/StudentLayout.jsx'
import CertificateModal from '../../components/CertificateModal.jsx'
import { getStudentById, saveStudent } from '../../services/studentService.js'
import { getActivitiesForStudent } from '../../services/activityService.js'
import { useAuth } from '../../context/authContextValue.js'

export default function StudentProfile() {
  const { currentUser, updateUser } = useAuth()
  const student = useMemo(
    () => {
      const prn = currentUser?.prn || currentUser?.roll_no || currentUser?.id
      const base = (prn ? getStudentById(prn) : null) ?? currentUser ?? {
        id: 'C1',
        prn: 'C1',
        roll_no: 'C1',
        name: 'Student',
        email: 'c1@itpulse.edu',
        department: 'Information Technology',
        year: '2nd Year',
        phone: '',
      }
      return {
        ...base,
        year: base.year === '3rd Year' ? '2nd Year' : (base.year || '2nd Year'),
      }
    },
    [currentUser]
  )

  const studentIds = [
    student.prn,
    student.roll_no,
    student.id,
    student.default_prn,
    currentUser?.prn,
    currentUser?.roll_no,
    currentUser?.id,
  ].filter(Boolean)
  const activities = getActivitiesForStudent(studentIds)
  const [selectedCert, setSelectedCert] = useState(null)
  const verified = activities.filter((item) => item.status === 'Verified')
  const pending = activities.filter((item) => item.status === 'Pending')
  const rejected = activities.filter((item) => item.status === 'Rejected')

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentUser?.name || student.name)
  const [prn, setPrn] = useState(student.prn || student.default_prn || currentUser?.prn || '')
  const [department, setDepartment] = useState(student.department || 'Information Technology')
  const [year, setYear] = useState(student.year === '3rd Year' ? '2nd Year' : (student.year || '2nd Year'))
  const [saved, setSaved] = useState(false)

  function handleSaveProfile(e) {
    e.preventDefault()
    const cleanPrn = prn.trim().toUpperCase()
    const updated = {
      ...student,
      name: name.trim(),
      prn: cleanPrn || student.prn,
      department,
      year,
    }
    saveStudent(updated)
    updateUser?.({ name: name.trim(), prn: cleanPrn || student.prn, department, year })
    setSaved(true)
    setEditing(false)
    window.setTimeout(() => setSaved(false), 4000)
  }

  const initials = (name || student.name)
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <StudentLayout title="My Student Profile">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Student Profile</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">My Academic Record</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Student identification, contact details, and certified achievements.</p>
          </div>
          <Button variant="secondary" onClick={() => {
            setName(student.name)
            setPrn(student.prn || student.default_prn || '')
            setDepartment(student.department || 'Information Technology')
            setYear(student.year === '3rd Year' ? '2nd Year' : (student.year || '2nd Year'))
            setEditing(true)
          }} className="gap-2">
            <Pencil size={15} /> Edit Profile
          </Button>
        </div>

        {saved && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-4 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            Profile updated and saved successfully!
          </div>
        )}

        {/* Profile Card */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-violet-800 text-2xl font-bold text-white shadow-md">
                {initials}
              </span>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{name}</h2>
                <p className="mt-1 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                  {student.department} · {student.year}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <span>PRN number: <span className="font-mono text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded">{student.prn || student.default_prn || 'PRN2024IT001'}</span></span>
                </p>
              </div>
            </div>
          </div>

          <dl className="mt-8 grid gap-5 border-t border-slate-100 dark:border-slate-800 pt-6 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Department</dt>
              <dd className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <School size={15} className="text-indigo-600 dark:text-indigo-400" />
                {student.department}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Year</dt>
              <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{student.year}</dd>
            </div>
          </dl>
        </section>

        {/* Portfolio Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Total Activities" value={activities.length} description="Across all categories" Icon={Medal} />
          <Card title="Verified Achievements" value={verified.length} description="Approved credentials" Icon={BadgeCheck} iconClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" />
          <Card title="Pending Review" value={pending.length} description="In verification queue" Icon={Clock3} iconClass="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" />
          <Card title="Revision Needed" value={rejected.length} description="Requires attention" Icon={XCircle} iconClass="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" />
        </section>

        {/* Verified Portfolio List */}
        <section className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Verified Achievement Portfolio</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Official college records eligible for placement and accreditation</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              {verified.length} Verified
            </span>
          </div>

          {verified.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {verified.map((activity) => (
                <li key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{activity.name}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {activity.category} · {activity.level} Level · {activity.date} · {activity.organizer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <Award size={14} />
                      {activity.achievement}
                    </span>
                    {activity.certificate && (
                      <button
                        type="button"
                        onClick={() => setSelectedCert(activity)}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                      >
                        View Certificate
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
              Verified achievements will appear here once approved by staff.
            </p>
          )}
        </section>

        {/* Edit Modal */}
        <Modal
          open={editing}
          onClose={() => setEditing(false)}
          title="Edit Student Profile"
          actions={
            <>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} className="gap-1.5">
                <Save size={15} /> Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                PRN number
              </label>
              <input
                value={prn}
                onChange={(e) => setPrn(e.target.value.toUpperCase())}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono uppercase text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics &amp; Telecommunication">Electronics &amp; Telecommunication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Current Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </form>
        </Modal>
        <CertificateModal
          open={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
          activity={selectedCert}
        />
      </main>
    </StudentLayout>
  )
}
