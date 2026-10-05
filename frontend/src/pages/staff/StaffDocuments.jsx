import { useState } from 'react'
import { FileText, Search, Download, Eye, Award } from 'lucide-react'
import Button from '../../components/Button.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import CertificateModal from '../../components/CertificateModal.jsx'
import StaffLayout from '../../layouts/StaffLayout.jsx'
import { getActivityById, getDocuments } from '../../services/activityService.js'

export default function StaffDocuments() {
  const docs = getDocuments()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)

  const filtered = docs.filter(
    (doc) =>
      `${doc.studentName} ${doc.activityName} ${doc.fileName} ${doc.prn} ${doc.rollNo}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (type === 'All' || doc.type === type) &&
      (status === 'All' || doc.status === status) &&
      (!from || doc.uploadedAt >= from) &&
      (!to || doc.uploadedAt <= to)
  )

  function handleView(doc) {
    const fullActivity = getActivityById(doc.activityId) || {
      id: doc.activityId,
      name: doc.activityName,
      student_name: doc.studentName,
      roll_no: doc.rollNo,
      prn: doc.prn,
      category: doc.category,
      level: doc.level,
      certificate: doc.fileName,
      certificate_data: doc.fileUrl,
      status: doc.status,
      date: doc.uploadedAt,
    }
    setSelectedActivity(fullActivity)
  }

  function download(doc) {
    if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
      const anchor = document.createElement('a')
      anchor.href = doc.fileUrl
      anchor.download = doc.fileName
      anchor.click()
      return
    }
    const blob = new Blob([`Certificate document for ${doc.activityName} — ${doc.studentName}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = doc.fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setQuery('')
    setType('All')
    setStatus('All')
    setFrom('')
    setTo('')
  }

  return (
    <StaffLayout title="Certificates / Documents">
      <main>
        <div className="mb-6">
          <p className="text-sm font-semibold text-indigo-700">Staff workspace</p>
          <h2 className="mt-2 text-2xl font-bold">Certificates &amp; Documents</h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse verified evidence files and co-curricular certificates uploaded by IT students.
          </p>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="relative sm:col-span-2">
            <span className="sr-only">Search documents</span>
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm"
            />
          </label>
          <select
            aria-label="Filter file type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option>All</option>
            {[...new Set(docs.map((doc) => doc.type))].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Filter document status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option>All</option>
            {['Verified', 'Pending', 'Rejected'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <label className="text-xs text-slate-500">
            From
            <input
              aria-label="Uploaded from date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-2 text-sm"
            />
          </label>
          <label className="text-xs text-slate-500">
            To
            <input
              aria-label="Uploaded to date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-2 text-sm"
            />
          </label>
          <Button variant="secondary" onClick={reset}>
            Reset filters
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {['Student Info', 'Activity', 'Document', 'Type', 'Uploaded', 'Status', 'Actions'].map((label) => (
                  <th key={label} className="px-4 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium">
                    <p className="font-bold text-slate-900">{doc.studentName}</p>
                    <p className="text-xs text-slate-500">
                      {doc.rollNo ? `Roll: ${doc.rollNo}` : ''} {doc.prn ? `· PRN: ${doc.prn}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-800">{doc.activityName}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium text-indigo-700">
                      <FileText size={16} />
                      {doc.fileName}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                    <span className="rounded bg-slate-100 px-2 py-0.5">{doc.type}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{doc.uploadedAt || '—'}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => handleView(doc)} className="gap-1 text-xs">
                        <Eye size={14} />
                        View
                      </Button>
                      <Button variant="secondary" onClick={() => download(doc)} className="gap-1 text-xs">
                        <Download size={14} />
                        Download
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="p-10 text-center text-sm text-slate-500">No documents match the selected filters.</p>
          )}
        </div>

        {/* Real Certificate Viewer Modal for Teachers */}
        <CertificateModal
          open={Boolean(selectedActivity)}
          onClose={() => setSelectedActivity(null)}
          activity={selectedActivity}
        />
      </main>
    </StaffLayout>
  )
}
