import { useMemo, useState } from 'react'
import { FileText, Search, Download, Eye, Trash2 } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getDocuments } from '../../services/activityService.js'

export default function AdminDocuments() {
  const [query, setQuery] = useState('')
  const [docs, setDocs] = useState(getDocuments())
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const visible = useMemo(
    () =>
      docs.filter(
        (d) =>
          `${d.studentName} ${d.activityName} ${d.fileName}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (type === 'All' || d.type === type) &&
          (status === 'All' || d.status === status) &&
          (!from || d.uploadedAt >= from) &&
          (!to || d.uploadedAt <= to)
      ),
    [docs, query, type, status, from, to]
  )

  function download(doc) {
    if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
      const a = document.createElement('a')
      a.href = doc.fileUrl
      a.download = doc.fileName
      a.click()
      return
    }
    const blob = new Blob([`Certificate document for ${doc.activityName}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout title="Documents">
      <main>
        <div className="mb-6">
          <p className="text-sm font-semibold text-indigo-700">Administration</p>
          <h2 className="mt-2 text-2xl font-bold">Documents</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review certificate files from student activity submissions.
          </p>
        </div>

        <section className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
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
            aria-label="Document type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option>All</option>
            {[...new Set(docs.map((d) => d.type))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            aria-label="Document status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option>All</option>
            {['Verified', 'Pending', 'Rejected'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <label className="text-xs text-slate-500">
            Uploaded from
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2"
            />
          </label>
          <label className="text-xs text-slate-500">
            Uploaded to
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2"
            />
          </label>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {['Student', 'Activity', 'File', 'Type', 'Uploaded Date', 'Status', 'Actions'].map((x) => (
                  <th key={x} className="px-4 py-3">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium">
                    <p className="font-bold text-slate-900">{d.studentName}</p>
                    <p className="text-xs text-slate-500">
                      {d.rollNo ? `Roll: ${d.rollNo}` : ''} {d.prn ? `· PRN: ${d.prn}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm">{d.activityName}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <FileText size={16} />
                      {d.fileName}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">{d.type}</td>
                  <td className="px-4 py-4 text-sm">{d.uploadedAt}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setSelected(d)}>
                        <Eye size={15} /> View
                      </Button>
                      <Button variant="secondary" onClick={() => download(d)}>
                        <Download size={15} /> Download
                      </Button>
                      <Button variant="danger" onClick={() => setConfirm(d)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <p className="p-10 text-center text-sm text-slate-500">No documents match these filters.</p>
          )}
        </section>

        {/* Preview Modal */}
        <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Document Preview">
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <FileText className="mx-auto text-indigo-600" size={34} />
            <p className="mt-3 font-semibold">{selected?.fileName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {selected?.studentName} · {selected?.activityName}
            </p>
            {selected?.fileUrl && selected.fileUrl.startsWith('data:image/') && (
              <img
                src={selected.fileUrl}
                alt="Certificate preview"
                className="mt-4 mx-auto max-h-80 rounded-lg border border-slate-200"
              />
            )}
            {(!selected?.fileUrl || !selected.fileUrl.startsWith('data:')) && (
              <p className="mt-4 text-xs text-slate-400">No preview available. Use Download to view the file.</p>
            )}
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={Boolean(confirm)}
          onClose={() => setConfirm(null)}
          title="Remove document?"
          actions={
            <>
              <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDocs(docs.filter((d) => d.id !== confirm.id))
                  setConfirm(null)
                }}
              >
                Remove document
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong>{confirm?.fileName}</strong> from the document list?
          </p>
        </Modal>
      </main>
    </AdminLayout>
  )
}
