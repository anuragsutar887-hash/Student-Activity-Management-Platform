import { Award, CheckCircle2, Clock3, Download, FileCheck, FileUp, ShieldCheck, X, XCircle } from 'lucide-react'
import Button from './Button.jsx'

export default function CertificateModal({ open, onClose, activity }) {
  if (!open || !activity) return null

  const studentName = activity.student_name || 'Student'
  const activityName = activity.name || 'Student Activity'
  const category = activity.category || 'Technical'
  const level = activity.level || 'National'
  const organizer = activity.organizer || 'College Institution'
  const achievement = activity.achievement || 'Participant'
  const date = activity.date || new Date().toISOString().slice(0, 10)
  const status = activity.status || 'Pending'
  const verifiedBy = activity.verified_by || 'Faculty Coordinator'
  const verifiedAt = activity.verified_at || date
  const rollNo = activity.roll_no || `ID-${activity.student_id}`
  const department = activity.department || 'Information Technology'

  // Detect uploaded file type from Data URL
  const certData = activity.certificate_data || ''
  const hasUploadedFile = Boolean(certData)
  const isImage = certData.startsWith('data:image/')
  const isPdf = certData.startsWith('data:application/pdf')

  function handleDownload() {
    // If an actual file was uploaded, download it directly
    if (hasUploadedFile) {
      const anchor = document.createElement('a')
      anchor.href = certData
      anchor.download = activity.certificate || `${studentName.toLowerCase().replaceAll(' ', '-')}-certificate`
      anchor.click()
      return
    }

    // Otherwise download the generated HTML certificate
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${activityName}</title>
  <style>
    body { font-family: 'Times New Roman', serif; background: #f8fafc; padding: 40px; display: flex; justify-content: center; }
    .cert { width: 800px; padding: 50px; background: #fff; border: 12px double #1e1b4b; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px; }
    .header { font-size: 14px; letter-spacing: 3px; color: #4338ca; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; }
    .title { font-size: 34px; color: #1e1b4b; font-weight: 700; margin-bottom: 10px; }
    .sub { font-size: 16px; color: #64748b; margin-bottom: 30px; font-style: italic; }
    .name { font-size: 28px; color: #312e81; font-weight: bold; border-bottom: 2px solid #c7d2fe; display: inline-block; padding: 0 30px 6px; margin: 15px 0; }
    .details { font-size: 16px; line-height: 1.8; color: #334155; margin: 25px auto; max-width: 650px; }
    .highlight { font-weight: bold; color: #1e1b4b; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px; }
    .sign-box { text-align: center; }
    .sign-line { width: 180px; border-top: 1px solid #94a3b8; margin-bottom: 8px; }
    .stamp { display: inline-block; border: 3px solid ${status === 'Verified' ? '#059669' : '#d97706'}; color: ${status === 'Verified' ? '#059669' : '#d97706'}; padding: 8px 16px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-radius: 6px; transform: rotate(-5deg); }
  </style>
</head>
<body>
  <div class="cert">
    <div class="header">Student Activity &amp; Achievement Management System</div>
    <div class="title">Certificate of Achievement</div>
    <div class="sub">This credential officially validates student participation and achievement</div>
    <p>This is to certify that</p>
    <div class="name">${studentName}</div>
    <p style="font-size: 14px; color: #64748b;">Roll No: ${rollNo} · Dept: ${department}</p>
    <div class="details">
      has successfully participated and represented the institution in <span class="highlight">${activityName}</span>,
      organized by <span class="highlight">${organizer}</span> at the <span class="highlight">${level}</span> level in the
      <span class="highlight">${category}</span> category on <span class="highlight">${date}</span>.
      <br><br>
      Award / Distinction: <span class="highlight" style="color: #4338ca;">${achievement}</span>
    </div>
    <div class="footer">
      <div class="sign-box">
        <div class="sign-line"></div>
        <p style="font-size: 13px; font-weight: bold; color: #1e1b4b;">${verifiedBy}</p>
        <p style="font-size: 11px; color: #64748b;">Activity Coordinator / Reviewer</p>
      </div>
      <div>
        <div class="stamp">${status === 'Verified' ? 'VERIFIED RECORD' : status.toUpperCase()}</div>
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <p style="font-size: 13px; font-weight: bold; color: #1e1b4b;">Dean / Head of Institution</p>
        <p style="font-size: 11px; color: #64748b;">Academic Validation Board</p>
      </div>
    </div>
  </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${studentName.toLowerCase().replaceAll(' ', '-')}-${activityName.toLowerCase().replaceAll(' ', '-')}-certificate.html`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
              <Award size={18} />
            </span>
            <div>
              <h2 id="cert-dialog-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                {hasUploadedFile ? 'Uploaded Certificate' : 'Activity Certificate'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activityName} · {studentName}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close certificate dialog"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* ── Uploaded Certificate (actual file from student) ── */}
          {hasUploadedFile ? (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <FileUp size={14} className="text-indigo-600 dark:text-indigo-400" />
                Uploaded by student: <span className="text-slate-800 dark:text-slate-200">{activity.certificate}</span>
              </div>

              {isImage && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <img
                    src={certData}
                    alt={`Certificate for ${activityName}`}
                    className="w-full object-contain"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              )}

              {isPdf && (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <embed
                    src={certData}
                    type="application/pdf"
                    width="100%"
                    height="480px"
                    className="block"
                  />
                </div>
              )}

              {!isImage && !isPdf && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                  <FileUp size={28} className="text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{activity.certificate}</p>
                    <p className="mt-1 text-xs text-slate-500">File uploaded · use Download to save</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── No upload: show generated system certificate ── */
            <div className="relative overflow-hidden rounded-2xl border-4 border-double border-indigo-900/40 bg-gradient-to-br from-amber-50/30 via-white to-indigo-50/30 p-6 shadow-inner sm:p-10">
              {/* Watermark */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-4">
                <ShieldCheck size={280} className="text-indigo-950" />
              </div>

              <div className="relative z-10 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-700">
                  Student Activity &amp; Achievement Platform
                </p>
                <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl font-serif">
                  Certificate of Achievement
                </h3>
                <p className="mt-1 text-xs italic text-slate-500">
                  This certifies recognized participation and accomplishment
                </p>

                <div className="my-6">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Awarded to</p>
                  <p className="mt-1 inline-block border-b-2 border-indigo-300 px-6 pb-1 text-2xl font-bold text-indigo-950 font-serif sm:text-3xl">
                    {studentName}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Roll No: <span className="font-semibold text-slate-700">{rollNo}</span> · Dept:{' '}
                    <span className="font-semibold text-slate-700">{department}</span>
                  </p>
                </div>

                <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-700">
                  for distinguished involvement and performance in{' '}
                  <span className="font-bold text-slate-950">{activityName}</span>, held on{' '}
                  <span className="font-semibold text-slate-900">{date}</span> organized by{' '}
                  <span className="font-semibold text-slate-900">{organizer}</span> at the{' '}
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-semibold text-indigo-800">{level}</span>{' '}
                  level in the category of <span className="font-semibold text-slate-900">{category}</span>.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-white/90 px-4 py-2 shadow-sm">
                  <Award size={18} className="text-amber-600" />
                  <span className="text-sm font-bold text-indigo-950">{achievement}</span>
                </div>

                <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-slate-200/70 pt-6 text-left">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{verifiedBy}</p>
                    <p className="text-[11px] text-slate-500">Activity Reviewer &amp; Staff Coordinator</p>
                    <p className="text-[10px] text-slate-400">Date: {verifiedAt}</p>
                  </div>

                  <div className="text-center">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        status === 'Verified'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : status === 'Rejected'
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-amber-600 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {status === 'Verified' ? (
                        <CheckCircle2 size={15} />
                      ) : status === 'Rejected' ? (
                        <XCircle size={15} />
                      ) : (
                        <Clock3 size={15} />
                      )}
                      {status}
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">Credential ID: ACT-{activity.id}-VER</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-800">Academic Dean</p>
                    <p className="text-[11px] text-slate-500">Student Affairs &amp; Accreditation</p>
                    <p className="text-[10px] text-slate-400">Digitally Authenticated</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary strip */}
          <div className="mt-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <span><span className="font-semibold text-slate-800 dark:text-slate-200">Student:</span> {studentName}</span>
              <span><span className="font-semibold text-slate-800 dark:text-slate-200">Roll No:</span> {rollNo}</span>
              <span><span className="font-semibold text-slate-800 dark:text-slate-200">Level:</span> {level}</span>
              <span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Status: </span>
                <span className={status === 'Verified' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : status === 'Rejected' ? 'text-rose-700 dark:text-rose-400 font-semibold' : 'text-amber-700 dark:text-amber-400 font-semibold'}>{status}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <FileCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>
                {hasUploadedFile
                  ? `File: ${activity.certificate}`
                  : 'No file uploaded · showing system-generated summary'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleDownload} className="gap-2">
                <Download size={16} />
                {hasUploadedFile ? 'Download File' : 'Download Certificate'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
