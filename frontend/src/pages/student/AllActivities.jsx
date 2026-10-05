import { useState } from 'react'
import { Award, BadgeCheck, CalendarDays, ExternalLink, FileCheck, Search, SlidersHorizontal, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout.jsx'
import CertificateModal from '../../components/CertificateModal.jsx'
import { getVerifiedActivities } from '../../services/activityService.js'

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'U'
}

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`))
  } catch {
    return date || '—'
  }
}

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Other']
const LEVELS = ['All', 'International', 'National', 'State', 'University', 'College', 'Department']

export default function AllActivities() {
  const allVerified = getVerifiedActivities()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')
  const [selectedCertActivity, setSelectedCertActivity] = useState(null)

  const filtered = allVerified.filter((a) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      (a.name || '').toLowerCase().includes(q) ||
      (a.student_name || '').toLowerCase().includes(q) ||
      (a.organizer || '').toLowerCase().includes(q) ||
      (a.achievement || '').toLowerCase().includes(q)
    const matchesCategory = category === 'All' || a.category === category
    const matchesLevel = level === 'All' || a.level === level
    return matchesSearch && matchesCategory && matchesLevel
  })

  function clearFilters() {
    setSearch('')
    setCategory('All')
    setLevel('All')
  }

  const hasFilters = search || category !== 'All' || level !== 'All'

  return (
    <StudentLayout title="All Activities">
      <main className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            All Approved Activities
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} verified activit{filtered.length === 1 ? 'y' : 'ies'} across the IT department
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search activities, students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Select */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>

            {/* Level Select */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No activities match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((activity) => (
              <article
                key={activity.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4.5 shadow-sm transition hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md"
              >
                <div>
                  {/* Student header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        {getInitials(activity.student_name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">{activity.student_name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {activity.roll_no ? `Roll: ${activity.roll_no}` : ''}
                          {activity.prn ? ` · PRN: ${activity.prn}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                      <BadgeCheck size={12} /> Verified
                    </span>
                  </div>

                  {/* Activity name */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                    {activity.name}
                  </h3>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 font-semibold text-indigo-700 dark:text-indigo-300">
                      {activity.category}
                    </span>
                    <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-medium text-slate-600 dark:text-slate-300">
                      {activity.level} Level
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {activity.achievement && (
                      <p className="flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-400">
                        <Award size={14} className="shrink-0 text-amber-500" />
                        <span className="truncate">{activity.achievement}</span>
                      </p>
                    )}
                    {activity.organizer && (
                      <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                        Org: {activity.organizer}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                    <CalendarDays size={13} /> {formatDate(activity.date)}
                  </span>
                  <div className="flex items-center gap-2">
                    {activity.certificate && (
                      <button
                        type="button"
                        onClick={() => setSelectedCertActivity(activity)}
                        title="View Certificate"
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
                      >
                        <FileCheck size={13} /> Proof
                      </button>
                    )}
                    <Link
                      to={`/student/activity/${activity.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400"
                    >
                      Details <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <CertificateModal
          open={Boolean(selectedCertActivity)}
          onClose={() => setSelectedCertActivity(null)}
          activity={selectedCertActivity}
        />
      </main>
    </StudentLayout>
  )
}
