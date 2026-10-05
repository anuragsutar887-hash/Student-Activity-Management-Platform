import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, actions }) {
  useEffect(() => {
    if (!open) return undefined
    function onKeyDown(event) { if (event.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.() }}
      className="modal-backdrop-enter fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal-panel-enter w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl sm:p-6 text-slate-900 dark:text-slate-100"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={19} />
          </button>
        </div>
        <div className="mt-4 text-slate-700 dark:text-slate-300">{children}</div>
        {actions && <div className="mt-6 flex justify-end gap-2">{actions}</div>}
      </section>
    </div>
  )
}
