import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const storageKey = 'itpulse-activities-store-v11'
const legacyKeys = [
  'student-activity-mock-activities-v3',
  'student-activity-mock-activities-v2',
  'itpulse-activities-store-v4',
  'itpulse-activities-store-v5',
  'itpulse-activities-store-v6',
  'itpulse-activities-store-v7',
  'itpulse-activities-store-v8',
  'itpulse-activities-store-v9',
  'itpulse-activities-store-v10',
]

try {
  legacyKeys.forEach((key) => localStorage.removeItem(key))
} catch {
  // localStorage might be unavailable
}

export const PREVIOUS_ACTIVITIES = [
  {
    id: 1001,
    student_id: 'PRN2024IT014',
    prn: 'PRN2024IT014',
    roll_no: 'C14',
    student_name: 'Gawande Tanushri Satish',
    department: 'Information Technology',
    year: '2nd Year',
    name: 'National Level Smart India Hackathon 2025',
    category: 'Hackathon',
    level: 'National',
    date: '2025-11-20',
    organizer: 'AICTE & Ministry of Education, Govt. of India',
    achievement: '1st Runner Up (Cash Prize ₹75,000)',
    description: 'Developed an AI-driven automated agricultural disease diagnosis system for rural farmers.',
    certificate: 'sih-2025-runnerup-cert.pdf',
    certificate_data: '',
    status: 'Verified',
    verified_by: 'Prof. Faculty Coordinator',
    verified_at: '2025-11-25',
    submitted_at: '2025-11-21',
  },
  {
    id: 1002,
    student_id: 'PRN2024IT017',
    prn: 'PRN2024IT017',
    roll_no: 'C17',
    student_name: 'Holkar Parth Dattatray',
    department: 'Information Technology',
    year: '2nd Year',
    name: 'AWS Certified Cloud Practitioner (CLF-C02)',
    category: 'Certification',
    level: 'International',
    date: '2025-12-10',
    organizer: 'Amazon Web Services (AWS)',
    achievement: 'Scored 890/1000 - Global Certification',
    description: 'Passed official AWS Cloud Practitioner examination covering cloud infrastructure, security, and architecture.',
    certificate: 'aws-cloud-practitioner-cert.png',
    certificate_data: '',
    status: 'Verified',
    verified_by: 'Prof. Faculty Coordinator',
    verified_at: '2025-12-15',
    submitted_at: '2025-12-11',
  },
  {
    id: 1003,
    student_id: 'PRN2024IT023',
    prn: 'PRN2024IT023',
    roll_no: 'C23',
    student_name: 'Kadam Nishant Nana',
    department: 'Information Technology',
    year: '2nd Year',
    name: 'State Level Web-Dev & Algorithmic Hackathon',
    category: 'Competition',
    level: 'State',
    date: '2026-01-18',
    organizer: 'Pune University CSI Student Chapter',
    achievement: '1st Place Winner - Best Frontend',
    description: 'Built high-performance real-time collaboration dashboard using React and WebSockets in 24-hour sprint.',
    certificate: 'csi-hackathon-winner-cert.pdf',
    certificate_data: '',
    status: 'Verified',
    verified_by: 'Prof. Faculty Coordinator',
    verified_at: '2026-01-22',
    submitted_at: '2026-01-19',
  },
  {
    id: 1004,
    student_id: 'PRN2024IT036',
    prn: 'PRN2024IT036',
    roll_no: 'C36',
    student_name: 'Mathapati Adwita Sanjay',
    department: 'Information Technology',
    year: '2nd Year',
    name: 'Inter-College Badminton Tournament',
    category: 'Sports',
    level: 'University',
    date: '2026-02-05',
    organizer: 'Savitribai Phule Pune University Sports Board',
    achievement: 'Gold Medal - Singles Championship',
    description: 'Represented institute badminton team and secured gold medal in university inter-collegiate sports championship.',
    certificate: 'badminton-gold-medal-cert.jpg',
    certificate_data: '',
    status: 'Verified',
    verified_by: 'Prof. Faculty Coordinator',
    verified_at: '2026-02-08',
    submitted_at: '2026-02-06',
  },
  {
    id: 1005,
    student_id: 'PRN2024IT042',
    prn: 'PRN2024IT042',
    roll_no: 'C42',
    student_name: 'Patil Soham Sachin',
    department: 'Information Technology',
    year: '2nd Year',
    name: 'IEEE International Conference Research Paper',
    category: 'Research',
    level: 'International',
    date: '2026-02-28',
    organizer: 'IEEE Computer Society Conference',
    achievement: 'Published & Presented Oral Session',
    description: 'Co-authored and presented research paper titled "Optimized Decentralized Identity Verification for Academic Portals".',
    certificate: 'ieee-conference-presentation-cert.pdf',
    certificate_data: '',
    status: 'Verified',
    verified_by: 'Prof. Faculty Coordinator',
    verified_at: '2026-03-04',
    submitted_at: '2026-03-01',
  },
  {
    id: 1006,
    student_id: 'PRN2024IT051',
    prn: 'PRN2024IT051',
    roll_no: 'C51',
    student_name: 'Shaikh Huzefa Javed',
    department: 'Information Technology',
    year: '2nd Year',
    name: 'National Cyber Security Workshop & CTF',
    category: 'Technical',
    level: 'National',
    date: '2026-03-12',
    organizer: 'CERT-In Cyber Suraksha Initiative',
    achievement: 'Certificate of Excellence - Top 5% Rank',
    description: 'Completed hands-on security workshop and solved 18 capture-the-flag challenges in network forensics and binary exploitation.',
    certificate: 'cyber-security-ctf-cert.pdf',
    certificate_data: '',
    status: 'Verified',
    verified_by: 'Prof. Faculty Coordinator',
    verified_at: '2026-03-15',
    submitted_at: '2026-03-13',
  },
]

function readStoredActivities() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (Array.isArray(stored) && stored.length > 0) return stored
  } catch {}
  return [...PREVIOUS_ACTIVITIES]
}

let activityStore = readStoredActivities()
let isInitialized = false

function persistActivities() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(activityStore))
  } catch {
    /* In-memory store remains available */
  }
}

// Initial persist so seed is saved
persistActivities()

function sortNewestFirst(activities) {
  return [...activities].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

/**
 * Sync activities with Supabase if configured
 */
export async function syncActivitiesFromSupabase() {
  if (!isSupabaseConfigured() || !supabase) return activityStore

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false })

    if (!error && Array.isArray(data)) {
      activityStore = data.map((dbItem) => {
        const local = activityStore.find((loc) => String(loc.id) === String(dbItem.id))
        return { ...dbItem, certificate_data: dbItem.certificate_data || local?.certificate_data || '' }
      })
      persistActivities()
      return activityStore
    }
    if (error) {
      console.warn('Could not fetch activities from Supabase:', error.message)
    }
  } catch (err) {
    console.warn('Supabase activities fetch exception:', err)
  }
  return activityStore
}

if (!isInitialized && isSupabaseConfigured()) {
  isInitialized = true
  syncActivitiesFromSupabase().catch(() => {})
}

export function getAllActivities() {
  return sortNewestFirst(activityStore)
}

export function getActivities() {
  return getAllActivities()
}

export function getActivityById(id) {
  return activityStore.find((activity) => String(activity.id) === String(id)) ?? null
}

export function getPendingActivities() {
  return sortNewestFirst(activityStore.filter((activity) => activity.status === 'Pending'))
}

export function getVerifiedActivities() {
  return sortNewestFirst(activityStore.filter((activity) => activity.status === 'Verified'))
}

export function getRejectedActivities() {
  return sortNewestFirst(activityStore.filter((activity) => activity.status === 'Rejected'))
}

export function getRecentApprovedActivities() {
  return getVerifiedActivities()
}

/**
 * Returns recent verified activities by other students for the dashboard feed.
 */
export function getRecentApprovedActivitiesForStudent(studentId) {
  // Returns all verified activities so students see both their own approved certificates and peers' certificates
  return getVerifiedActivities()
}

export function getActivitiesForStudent(studentId) {
  if (!studentId) return []
  // Accept multiple possible identifiers for the student (PRN, roll_no, or student_id)
  const ids = Array.isArray(studentId) ? studentId : [studentId]
  const cleanIds = ids.map((id) => String(id || '').trim().toLowerCase()).filter(Boolean)
  if (!cleanIds.length) return []
  return sortNewestFirst(
    activityStore.filter((activity) => {
      const actPrn = String(activity.prn || '').trim().toLowerCase()
      const actRoll = String(activity.roll_no || '').trim().toLowerCase()
      const actStudentId = String(activity.student_id || '').trim().toLowerCase()
      return cleanIds.some((id) => actPrn === id || actRoll === id || actStudentId === id)
    })
  )
}

export function createActivity(activity) {
  const newId = Date.now()
  const prn = String(activity.prn || activity.roll_no || activity.student_id || '').toUpperCase()
  const roll = String(activity.roll_no || activity.prn || '').toUpperCase()

  const created = {
    ...activity,
    id: activity.id || newId,
    prn,
    roll_no: roll,
    student_id: prn,
    submitted_at: activity.submitted_at || new Date().toISOString().slice(0, 10),
    status: activity.status || 'Pending',
    verification_history: activity.verification_history || [],
  }

  activityStore = [created, ...activityStore]
  persistActivities()

  if (isSupabaseConfigured() && supabase) {
    // Keep certificate_data out of Supabase payload (too large for DB text column)
    // but certificate_data is already saved in localStorage via persistActivities()
    const { certificate_data: _cd, ...supabasePayload } = created

    supabase
      .from('activities')
      .insert([supabasePayload])
      .select()
      .then(({ data, error }) => {
        if (!error && data?.[0]) {
          const assigned = data[0]
          // Merge Supabase-assigned id back but keep our local certificate_data
          activityStore = activityStore.map((item) => (item.id === newId ? { ...item, ...assigned, certificate_data: item.certificate_data || assigned.certificate_data } : item))
          persistActivities()
        } else if (error) {
          console.warn('Supabase createActivity error:', error.message)
        }
      })
      .catch((err) => console.warn('Supabase createActivity exception:', err))
  }

  return created
}

export function updateActivity(id, updates) {
  let updated = null
  activityStore = activityStore.map((activity) => {
    if (String(activity.id) !== String(id)) return activity
    updated = { ...activity, ...updates }
    return updated
  })

  if (updated) {
    persistActivities()

    if (isSupabaseConfigured() && supabase) {
      const { certificate_data: _cd, ...supabaseUpdates } = updates

      supabase
        .from('activities')
        .update(supabaseUpdates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateActivity error:', error.message)
        })
        .catch((err) => console.warn('Supabase updateActivity exception:', err))
    }
  }

  return updated
}

export function deleteActivity(id) {
  const before = activityStore.length
  activityStore = activityStore.filter((activity) => String(activity.id) !== String(id))
  if (activityStore.length < before) {
    persistActivities()

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteActivity error:', error.message)
        })
        .catch((err) => console.warn('Supabase deleteActivity exception:', err))
    }
  }
  return activityStore.length < before
}

export function updateActivityStatus(id, status, remarks = '') {
  return updateActivity(id, { status, remarks })
}

export function verifyActivity(id, verifiedBy = 'Prof. Faculty Coordinator') {
  const activity = getActivityById(id)
  if (!activity) return null
  const changedAt = new Date().toISOString()
  return updateActivity(id, {
    status: 'Verified',
    remarks: '',
    rejection_reason: '',
    verified_by: verifiedBy,
    verified_at: changedAt.slice(0, 10),
    rejected_by: '',
    rejected_at: '',
    verification_history: [
      ...(activity.verification_history || []),
      { status: 'Verified', actor: verifiedBy, at: changedAt },
    ],
  })
}

export function rejectActivity(id, reason, rejectedBy = 'Prof. Faculty Coordinator') {
  const rejectionReason = String(reason ?? '').trim()
  if (!rejectionReason) return null
  const activity = getActivityById(id)
  if (!activity) return null
  const changedAt = new Date().toISOString()
  return updateActivity(id, {
    status: 'Rejected',
    remarks: rejectionReason,
    rejection_reason: rejectionReason,
    rejected_by: rejectedBy,
    rejected_at: changedAt.slice(0, 10),
    verification_history: [
      ...(activity.verification_history || []),
      { status: 'Rejected', actor: rejectedBy, reason: rejectionReason, at: changedAt },
    ],
  })
}

export function resetActivities() {
  activityStore = []
  persistActivities()
  return activityStore
}

/**
 * Returns a list of certificate/document records derived from verified activities
 * that have an uploaded certificate file.
 */
export function getDocuments() {
  return activityStore
    .map((activity) => {
      const fileName = activity.certificate || ''
      if (!fileName) return null
      return {
        id: `document-${activity.id}`,
        activityId: activity.id,
        studentId: activity.prn || activity.roll_no || activity.student_id,
        rollNo: activity.roll_no || '',
        prn: activity.prn || '',
        studentName: activity.student_name,
        activityName: activity.name,
        category: activity.category,
        level: activity.level,
        fileName,
        fileUrl: activity.certificate_url || activity.certificate_data || '',
        type: fileName.split('.').pop()?.toUpperCase() || 'FILE',
        uploadedAt: activity.submitted_at || activity.date,
        status: activity.status,
      }
    })
    .filter(Boolean)
}

// Alias kept for any existing references
export const getMockDocuments = getDocuments
