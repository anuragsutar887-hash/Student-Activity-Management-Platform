import { useRef, useState } from 'react'
import { FileUp, X } from 'lucide-react'

const acceptedExtensions = ['pdf', 'jpg', 'jpeg', 'png']
const maximumSize = 10 * 1024 * 1024

function readableSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * onChange is called with:
 *   { name: string, data: string (Data URL) }  — when a file is chosen
 *   '' or null                                  — when file is removed
 */
export default function DocumentUpload({ value = '', onChange }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  function acceptFile(candidate) {
    if (!candidate) return
    const extension = candidate.name.split('.').pop()?.toLowerCase()
    if (!acceptedExtensions.includes(extension)) {
      setError('Choose a PDF, JPG or PNG file.')
      return
    }
    if (candidate.size > maximumSize) {
      setError('The file must be 10 MB or smaller.')
      return
    }
    setError('')
    setFile(candidate)

    // Read file content as Data URL so the actual certificate is preserved
    const reader = new FileReader()
    reader.onload = (event) => {
      onChange?.({ name: candidate.name, data: event.target.result })
    }
    reader.onerror = () => {
      // Fallback: at minimum store the filename
      onChange?.({ name: candidate.name, data: '' })
    }
    reader.readAsDataURL(candidate)
  }

  function removeFile() {
    setFile(null)
    setError('')
    onChange?.('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const filename = file?.name ?? value
  const type = file?.type?.split('/').pop()?.toUpperCase() || filename?.split('.').pop()?.toUpperCase()
  const size = file ? readableSize(file.size) : ''

  return (
    <div>
      <input ref={inputRef} id="activity-document" type="file" className="peer sr-only" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={(event) => acceptFile(event.target.files?.[0])} />
      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files?.[0]) }}
        className={`rounded-2xl border border-dashed p-6 text-center transition-colors ${
          dragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30'
        }`}
      >
        <FileUp className="mx-auto text-indigo-600 dark:text-indigo-400" size={24} />
        <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Upload Certificate / Proof</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Drop a file here or choose one from your device · PDF, JPG or PNG · Up to 10 MB</p>
        <label
          htmlFor="activity-document"
          className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-50 dark:hover:bg-slate-700 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500"
        >
          Choose file
        </label>
      </div>
      {filename && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            <FileUp size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{filename}</span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{type || 'Document'}{size ? ` · ${size}` : ''}</span>
          </span>
          <button
            type="button"
            aria-label="Remove selected file"
            onClick={removeFile}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-600" role="alert">{error}</p>}
    </div>
  )
}
