import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Plus, Search } from 'lucide-react'
import ActivityTable from '../../components/ActivityTable.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import StudentLayout from '../../layouts/StudentLayout.jsx'
import { deleteActivity, getActivitiesForStudent } from '../../services/activityService.js'
import { useAuth } from '../../context/authContextValue.js'

export default function MyActivities() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const studentIds = [
    currentUser?.prn,
    currentUser?.roll_no,
    currentUser?.id,
  ].filter(Boolean)
  const [activities, setActivities] = useState(() => getActivitiesForStudent(studentIds))
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [category, setCategory] = useState('All categories')
  const [sort, setSort] = useState('newest')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const categories = [...new Set(activities.map((item) => item.category))]
  const filtered = useMemo(() => {
    const result = activities.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && (status === 'All statuses' || item.status === status) && (category === 'All categories' || item.category === category))
    return result.sort((a, b) => (sort === 'newest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)))
  }, [activities, query, status, category, sort])

  function confirmDelete() {
    deleteActivity(deleteTarget.id)
    setActivities((current) => current.filter((item) => item.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <StudentLayout title="My Activities">
      <main>
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Student workspace</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">My Activities</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All your submissions and their review status.</p>
          </div>
          <Button onClick={() => navigate('/student/activity/add')}>
            <Plus size={17} /> Add Activity
          </Button>
        </div>
        <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative sm:col-span-2">
            <span className="sr-only">Search activities</span>
            <Search size={17} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activities..."
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </label>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-800 dark:text-slate-200 outline-none"
          >
            <option>All statuses</option>
            {['Verified', 'Pending', 'Rejected', 'Draft'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-800 dark:text-slate-200 outline-none"
          >
            <option>All categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select
            aria-label="Sort by date"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardList className="mx-auto text-slate-300 dark:text-slate-600" size={28} />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No activities match these filters.</p>
            </div>
          ) : (
            <ActivityTable activities={filtered} onEdit={(item) => navigate(`/student/activity/add?edit=${item.id}`)} onDelete={setDeleteTarget} />
          )}
        </section>
        <Modal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete activity?"
          actions={
            <>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </>
          }
        >
          {deleteTarget && <p className="text-sm text-slate-600 dark:text-slate-300">"{deleteTarget.name}" will be removed from your activity records.</p>}
        </Modal>
      </main>
    </StudentLayout>
  )
}



