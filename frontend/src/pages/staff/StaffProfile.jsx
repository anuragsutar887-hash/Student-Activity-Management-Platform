import { useState } from 'react'
import { Building2, Mail, Pencil, Save, ShieldCheck, UserRound, Phone, KeyRound, BadgeCheck, XCircle, Clock3 } from 'lucide-react'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import Modal from '../../components/Modal.jsx'
import StaffLayout from '../../layouts/StaffLayout.jsx'
import { useAuth } from '../../context/authContextValue.js'
import { getAllActivities } from '../../services/activityService.js'

export default function StaffProfile() {
  const { currentUser } = useAuth()
  const staff = currentUser?.role === 'staff' ? currentUser : { name: 'Faculty Member', id: null, department: 'Information Technology', email: '', role: 'staff', designation: 'Activity Coordinator', phone: '' }
  const [name, setName] = useState(staff.name)
  const [email, setEmail] = useState(staff.email)
  const [department, setDepartment] = useState(staff.department)
  const [designation, setDesignation] = useState(staff.designation || 'Activity Coordinator')
  const [phone, setPhone] = useState(staff.phone || '')
  const [editing, setEditing] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saved, setSaved] = useState(false)
  const activities = getAllActivities()
  const verified = activities.filter((activity) => activity.status === 'Verified' && (!activity.verified_by || activity.verified_by === staff.name)).length
  const rejected = activities.filter((activity) => activity.status === 'Rejected' && (!activity.rejected_by || activity.rejected_by === staff.name)).length
  const pending = activities.filter((activity) => activity.status === 'Pending').length
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const saveProfile = () => { setSaved(true); setEditing(false) }

  return <StaffLayout title="Staff Profile"><main className="mx-auto max-w-5xl">
    <div className="mb-6"><p className="text-sm font-semibold text-indigo-700">Staff workspace</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Staff Profile</h2><p className="mt-1 text-sm text-slate-500">Your staff contact information and review activity.</p></div>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-800">{initials}</span><div><h1 className="text-2xl font-bold text-slate-900">{name}</h1><p className="mt-1 text-sm capitalize text-slate-500">Staff ID {staff.id}</p></div></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={16}/>Edit Profile</Button><Button variant="secondary" onClick={() => setPasswordOpen(true)}><KeyRound size={16}/>Change Password</Button></div></div>
      <dl className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2"><Info Icon={Mail} label="Email" value={email}/><Info Icon={Building2} label="Department" value={department}/><Info Icon={ShieldCheck} label="Designation" value={designation}/><Info Icon={UserRound} label="Role / Staff ID" value={`Staff · ${staff.id}`}/><Info Icon={Phone} label="Phone" value={phone}/></dl>
    </section>
    {saved && <p role="status" className="mt-3 text-center text-sm text-emerald-700">Changes saved for this session.</p>}
    <div className="mt-5 grid gap-4 sm:grid-cols-3"><Card title="Activities Verified" value={verified} description="Verified by your account" Icon={BadgeCheck} iconClass="bg-emerald-50 text-emerald-700"/><Card title="Activities Rejected" value={rejected} description="Returned with feedback" Icon={XCircle} iconClass="bg-rose-50 text-rose-700"/><Card title="Pending Reviews" value={pending} description="In the current queue" Icon={Clock3} iconClass="bg-amber-50 text-amber-700"/></div>
    <Modal open={editing} onClose={() => setEditing(false)} title="Edit staff profile" actions={<><Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={saveProfile}><Save size={15}/>Save Changes</Button></>}><div className="space-y-4"><ProfileField label="Name" value={name} onChange={setName}/><ProfileField label="Email" type="email" value={email} onChange={setEmail}/><ProfileField label="Department" value={department} onChange={setDepartment}/><ProfileField label="Designation" value={designation} onChange={setDesignation}/><ProfileField label="Phone" type="tel" value={phone} onChange={setPhone}/></div></Modal>
    <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change Password" actions={<><Button variant="secondary" onClick={() => setPasswordOpen(false)}>Cancel</Button><Button onClick={() => { setSaved(true); setPasswordOpen(false); setCurrentPassword(''); setNewPassword('') }}>Save Changes</Button></>}><p className="mb-4 text-sm text-slate-500">Password changes are managed through the authentication system. Contact your administrator if you need assistance.</p><div className="space-y-3"><ProfileField label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword}/><ProfileField label="New password" type="password" value={newPassword} onChange={setNewPassword}/></div></Modal>
  </main></StaffLayout>
}

function ProfileField({ label, type = 'text', value, onChange }) { return <label className="block text-sm font-medium text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"/></label> }
function Info({ Icon, label, value }) { return <div className="flex gap-3"><Icon className="mt-0.5 text-indigo-600" size={18}/><div><dt className="text-xs font-semibold uppercase text-slate-400">{label}</dt><dd className="mt-1 text-sm text-slate-800">{value || '—'}</dd></div></div> }
