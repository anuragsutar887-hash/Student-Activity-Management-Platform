import { mockCategories, mockDepartments } from '../data/mockData.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function safeSupabaseQuery(query) {
  if (!query) return
  Promise.resolve(query)
    .then(({ error } = {}) => {
      if (error) console.warn('Supabase query error:', error?.message || error)
    })
    .catch((err) => console.warn('Supabase query exception:', err))
}

const STUDENTS_KEY = 'itpulse-students-store-v10'
const STAFF_KEY = 'itpulse-staff-store-v6'
const DEPTS_KEY = 'itpulse-depts-store-v4'
const CATS_KEY = 'itpulse-cats-store-v4'

// Purge legacy demo keys
try {
  localStorage.removeItem('student-activity-students-v3')
  localStorage.removeItem('student-activity-staff-v3')
  localStorage.removeItem('itpulse-students-store-v4')
  localStorage.removeItem('itpulse-students-store-v5')
  localStorage.removeItem('itpulse-students-store-v6')
  localStorage.removeItem('itpulse-students-store-v7')
  localStorage.removeItem('itpulse-students-store-v8')
  localStorage.removeItem('itpulse-students-store-v9')
} catch {
  // localStorage might be unavailable
}

function pad2(n) { return String(n).padStart(2, '0') }
function pad3(n) { return String(n).padStart(3, '0') }

// ─── Class roster: 68 students with Roll No C1–C68, Alphanumeric PRN, and Passwords ───
const SEED_STUDENTS = [
  { roll_no: 'C1',  name: 'Adhav Satyajeet Bharat',       email: 'c1@itpulse.edu',  password: `Pass@${pad2(1)}`,  default_prn: `PRN2024IT${pad3(1)}` },
  { roll_no: 'C2',  name: 'Ankalle Abhishek Balbhim',     email: 'c2@itpulse.edu',  password: `Pass@${pad2(2)}`,  default_prn: `PRN2024IT${pad3(2)}` },
  { roll_no: 'C3',  name: 'Bache Shrushti Shantwir',      email: 'c3@itpulse.edu',  password: `Pass@${pad2(3)}`,  default_prn: `PRN2024IT${pad3(3)}` },
  { roll_no: 'C4',  name: 'Belhekar Vaibhavi Sanjay',     email: 'c4@itpulse.edu',  password: `Pass@${pad2(4)}`,  default_prn: `PRN2024IT${pad3(4)}` },
  { roll_no: 'C5',  name: 'Chate Vaishnavi Shyamsundar',  email: 'c5@itpulse.edu',  password: `Pass@${pad2(5)}`,  default_prn: `PRN2024IT${pad3(5)}` },
  { roll_no: 'C6',  name: 'Chavan Shrutika Ganesh',       email: 'c6@itpulse.edu',  password: `Pass@${pad2(6)}`,  default_prn: `PRN2024IT${pad3(6)}` },
  { roll_no: 'C7',  name: 'Dange Suresh Bandu',           email: 'c7@itpulse.edu',  password: `Pass@${pad2(7)}`,  default_prn: `PRN2024IT${pad3(7)}` },
  { roll_no: 'C8',  name: 'Davhale Sanchit Dipak',        email: 'c8@itpulse.edu',  password: `Pass@${pad2(8)}`,  default_prn: `PRN2024IT${pad3(8)}` },
  { roll_no: 'C9',  name: 'Dede Omkar Vijay',             email: 'c9@itpulse.edu',  password: `Pass@${pad2(9)}`,  default_prn: `PRN2024IT${pad3(9)}` },
  { roll_no: 'C10', name: 'Deshpande Chinmay Ninad',      email: 'c10@itpulse.edu', password: `Pass@${pad2(10)}`, default_prn: `PRN2024IT${pad3(10)}` },
  { roll_no: 'C11', name: 'Dhakane Manish Mahendra',      email: 'c11@itpulse.edu', password: `Pass@${pad2(11)}`, default_prn: `PRN2024IT${pad3(11)}` },
  { roll_no: 'C12', name: 'Gadekar Shruti Santosh',       email: 'c12@itpulse.edu', password: `Pass@${pad2(12)}`, default_prn: `PRN2024IT${pad3(12)}` },
  { roll_no: 'C13', name: 'Gawali Jay Chandrakant',       email: 'c13@itpulse.edu', password: `Pass@${pad2(13)}`, default_prn: `PRN2024IT${pad3(13)}` },
  { roll_no: 'C14', name: 'Gawande Tanushri Satish',      email: 'c14@itpulse.edu', password: `Pass@${pad2(14)}`, default_prn: `PRN2024IT${pad3(14)}` },
  { roll_no: 'C15', name: 'Gedam Aditya',                 email: 'c15@itpulse.edu', password: `Pass@${pad2(15)}`, default_prn: `PRN2024IT${pad3(15)}` },
  { roll_no: 'C16', name: 'Gharat Riya Indrajit',         email: 'c16@itpulse.edu', password: `Pass@${pad2(16)}`, default_prn: `PRN2024IT${pad3(16)}` },
  { roll_no: 'C17', name: 'Holkar Parth Dattatray',       email: 'c17@itpulse.edu', password: `Pass@${pad2(17)}`, default_prn: `PRN2024IT${pad3(17)}` },
  { roll_no: 'C18', name: 'Jadhav Atharv Raju',           email: 'c18@itpulse.edu', password: `Pass@${pad2(18)}`, default_prn: `PRN2024IT${pad3(18)}` },
  { roll_no: 'C19', name: 'Jadhav Ayush Ajay',            email: 'c19@itpulse.edu', password: `Pass@${pad2(19)}`, default_prn: `PRN2024IT${pad3(19)}` },
  { roll_no: 'C20', name: 'Jadhav Rushikesh Suresh',      email: 'c20@itpulse.edu', password: `Pass@${pad2(20)}`, default_prn: `PRN2024IT${pad3(20)}` },
  { roll_no: 'C21', name: 'Jadhav Shivam Pralhad',        email: 'c21@itpulse.edu', password: `Pass@${pad2(21)}`, default_prn: `PRN2024IT${pad3(21)}` },
  { roll_no: 'C22', name: 'Kachave Nandinee Rangnath',    email: 'c22@itpulse.edu', password: `Pass@${pad2(22)}`, default_prn: `PRN2024IT${pad3(22)}` },
  { roll_no: 'C23', name: 'Kadam Nishant Nana',           email: 'c23@itpulse.edu', password: `Pass@${pad2(23)}`, default_prn: `PRN2024IT${pad3(23)}` },
  { roll_no: 'C24', name: 'Kambale Pratiksha Rajkumar',   email: 'c24@itpulse.edu', password: `Pass@${pad2(24)}`, default_prn: `PRN2024IT${pad3(24)}` },
  { roll_no: 'C25', name: 'Kasar Soham Madhukar',         email: 'c25@itpulse.edu', password: `Pass@${pad2(25)}`, default_prn: `PRN2024IT${pad3(25)}` },
  { roll_no: 'C26', name: 'Kejkar Chaitanya Sunil',       email: 'c26@itpulse.edu', password: `Pass@${pad2(26)}`, default_prn: `PRN2024IT${pad3(26)}` },
  { roll_no: 'C27', name: 'Kharat Sarang Rajesh',         email: 'c27@itpulse.edu', password: `Pass@${pad2(27)}`, default_prn: `PRN2024IT${pad3(27)}` },
  { roll_no: 'C28', name: 'Koul Rohan',                   email: 'c28@itpulse.edu', password: `Pass@${pad2(28)}`, default_prn: `PRN2024IT${pad3(28)}` },
  { roll_no: 'C29', name: 'Kshirsagar Samarth Rajabhau',  email: 'c29@itpulse.edu', password: `Pass@${pad2(29)}`, default_prn: `PRN2024IT${pad3(29)}` },
  { roll_no: 'C30', name: 'Kshirsagar Veena Badrinath',   email: 'c30@itpulse.edu', password: `Pass@${pad2(30)}`, default_prn: `PRN2024IT${pad3(30)}` },
  { roll_no: 'C31', name: 'Kulkarni Atharv Vikas',        email: 'c31@itpulse.edu', password: `Pass@${pad2(31)}`, default_prn: `PRN2024IT${pad3(31)}` },
  { roll_no: 'C32', name: 'Kumar Aniket',                 email: 'c32@itpulse.edu', password: `Pass@${pad2(32)}`, default_prn: `PRN2024IT${pad3(32)}` },
  { roll_no: 'C33', name: 'Kumbhar Vedant Vijay',         email: 'c33@itpulse.edu', password: `Pass@${pad2(33)}`, default_prn: `PRN2024IT${pad3(33)}` },
  { roll_no: 'C34', name: 'Lahane Vivek Vishnu',          email: 'c34@itpulse.edu', password: `Pass@${pad2(34)}`, default_prn: `PRN2024IT${pad3(34)}` },
  { roll_no: 'C35', name: 'Mane Kadambari Shriniwas',     email: 'c35@itpulse.edu', password: `Pass@${pad2(35)}`, default_prn: `PRN2024IT${pad3(35)}` },
  { roll_no: 'C36', name: 'Mathapati Adwita Sanjay',      email: 'c36@itpulse.edu', password: `Pass@${pad2(36)}`, default_prn: `PRN2024IT${pad3(36)}` },
  { roll_no: 'C37', name: 'Nishad Tripti Gajanan',        email: 'c37@itpulse.edu', password: `Pass@${pad2(37)}`, default_prn: `PRN2024IT${pad3(37)}` },
  { roll_no: 'C38', name: 'Panhalkar Nidhi Baburao',      email: 'c38@itpulse.edu', password: `Pass@${pad2(38)}`, default_prn: `PRN2024IT${pad3(38)}` },
  { roll_no: 'C39', name: 'Paradh Rajdeep Devanand',      email: 'c39@itpulse.edu', password: `Pass@${pad2(39)}`, default_prn: `PRN2024IT${pad3(39)}` },
  { roll_no: 'C40', name: 'Pardeshi Parth Pramod',        email: 'c40@itpulse.edu', password: `Pass@${pad2(40)}`, default_prn: `PRN2024IT${pad3(40)}` },
  { roll_no: 'C41', name: 'Patil Harshada Pankaj',        email: 'c41@itpulse.edu', password: `Pass@${pad2(41)}`, default_prn: `PRN2024IT${pad3(41)}` },
  { roll_no: 'C42', name: 'Patil Soham Sachin',           email: 'c42@itpulse.edu', password: `Pass@${pad2(42)}`, default_prn: `PRN2024IT${pad3(42)}` },
  { roll_no: 'C43', name: 'Patki Ishwari Pradip',         email: 'c43@itpulse.edu', password: `Pass@${pad2(43)}`, default_prn: `PRN2024IT${pad3(43)}` },
  { roll_no: 'C44', name: 'Pawar Tejas Tanaji',           email: 'c44@itpulse.edu', password: `Pass@${pad2(44)}`, default_prn: `PRN2024IT${pad3(44)}` },
  { roll_no: 'C45', name: 'Pingale Rohit Balaji',         email: 'c45@itpulse.edu', password: `Pass@${pad2(45)}`, default_prn: `PRN2024IT${pad3(45)}` },
  { roll_no: 'C46', name: 'Rahatkar Divyashri Balaji',    email: 'c46@itpulse.edu', password: `Pass@${pad2(46)}`, default_prn: `PRN2024IT${pad3(46)}` },
  { roll_no: 'C47', name: 'Ramchandani Dev Nandlal',      email: 'c47@itpulse.edu', password: `Pass@${pad2(47)}`, default_prn: `PRN2024IT${pad3(47)}` },
  { roll_no: 'C48', name: 'Rishikesh',                    email: 'c48@itpulse.edu', password: `Pass@${pad2(48)}`, default_prn: `PRN2024IT${pad3(48)}` },
  { roll_no: 'C49', name: 'Salunkhe Harsh Mangesh',       email: 'c49@itpulse.edu', password: `Pass@${pad2(49)}`, default_prn: `PRN2024IT${pad3(49)}` },
  { roll_no: 'C50', name: 'Sawale Samruddhi Sandip',      email: 'c50@itpulse.edu', password: `Pass@${pad2(50)}`, default_prn: `PRN2024IT${pad3(50)}` },
  { roll_no: 'C51', name: 'Shaikh Huzefa Javed',          email: 'c51@itpulse.edu', password: `Pass@${pad2(51)}`, default_prn: `PRN2024IT${pad3(51)}` },
  { roll_no: 'C52', name: 'Sharma Niraj Shambhunath',     email: 'c52@itpulse.edu', password: `Pass@${pad2(52)}`, default_prn: `PRN2024IT${pad3(52)}` },
  { roll_no: 'C53', name: 'Sharma Prathmesh Sanjay',      email: 'c53@itpulse.edu', password: `Pass@${pad2(53)}`, default_prn: `PRN2024IT${pad3(53)}` },
  { roll_no: 'C54', name: 'Shende Princy Shende',         email: 'c54@itpulse.edu', password: `Pass@${pad2(54)}`, default_prn: `PRN2024IT${pad3(54)}` },
  { roll_no: 'C55', name: 'Shewale Aaryan Kamlesh',       email: 'c55@itpulse.edu', password: `Pass@${pad2(55)}`, default_prn: `PRN2024IT${pad3(55)}` },
  { roll_no: 'C56', name: 'Shinde Satyajit Gajanan',      email: 'c56@itpulse.edu', password: `Pass@${pad2(56)}`, default_prn: `PRN2024IT${pad3(56)}` },
  { roll_no: 'C57', name: 'Shinde Shubhada Vasant',       email: 'c57@itpulse.edu', password: `Pass@${pad2(57)}`, default_prn: `PRN2024IT${pad3(57)}` },
  { roll_no: 'C58', name: 'Shinde Vaishnavi Laxman',      email: 'c58@itpulse.edu', password: `Pass@${pad2(58)}`, default_prn: `PRN2024IT${pad3(58)}` },
  { roll_no: 'C59', name: 'Somwanshi Vinay Abhay',        email: 'c59@itpulse.edu', password: `Pass@${pad2(59)}`, default_prn: `PRN2024IT${pad3(59)}` },
  { roll_no: 'C60', name: 'Sutar Anurag Dhanyakumar',     email: 'c60@itpulse.edu', password: `Pass@${pad2(60)}`, default_prn: `PRN2024IT${pad3(60)}` },
  { roll_no: 'C61', name: 'Todgire Rohini Irappa',        email: 'c61@itpulse.edu', password: `Pass@${pad2(61)}`, default_prn: `PRN2024IT${pad3(61)}` },
  { roll_no: 'C62', name: 'Tonchar Pratik Gangadas',      email: 'c62@itpulse.edu', password: `Pass@${pad2(62)}`, default_prn: `PRN2024IT${pad3(62)}` },
  { roll_no: 'C63', name: 'Toshniwal Atharv',             email: 'c63@itpulse.edu', password: `Pass@${pad2(63)}`, default_prn: `PRN2024IT${pad3(63)}` },
  { roll_no: 'C64', name: 'Tripathi Rahul Dhananjay',     email: 'c64@itpulse.edu', password: `Pass@${pad2(64)}`, default_prn: `PRN2024IT${pad3(64)}` },
  { roll_no: 'C65', name: 'Wadhekar Nilesh Kachru',       email: 'c65@itpulse.edu', password: `Pass@${pad2(65)}`, default_prn: `PRN2024IT${pad3(65)}` },
  { roll_no: 'C66', name: 'Waghmare Prabudh Milind',      email: 'c66@itpulse.edu', password: `Pass@${pad2(66)}`, default_prn: `PRN2024IT${pad3(66)}` },
  { roll_no: 'C67', name: 'Waghmode Soham Laxman',        email: 'c67@itpulse.edu', password: `Pass@${pad2(67)}`, default_prn: `PRN2024IT${pad3(67)}` },
  { roll_no: 'C68', name: 'Warange Karan Gajanan',        email: 'c68@itpulse.edu', password: `Pass@${pad2(68)}`, default_prn: `PRN2024IT${pad3(68)}` },
].map((student) => ({
  ...student,
  id: student.roll_no,
  prn: student.default_prn,
  department: 'Information Technology',
  year: '2nd Year',
  status: 'Active',
}))

function loadFromStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item) => item.name !== 'Anurag Sharma' && item.name !== 'Rohan Todgire')
      }
    }
  } catch {
    // fallback
  }
  return [...fallback]
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // storage fallback
  }
}

let students = loadFromStorage(STUDENTS_KEY, SEED_STUDENTS)
let staff = loadFromStorage(STAFF_KEY, [])
let departments = loadFromStorage(DEPTS_KEY, mockDepartments)
let categories = loadFromStorage(CATS_KEY, mockCategories)

let isInitialized = false

/**
 * Synchronize with Supabase if configured
 */
export async function syncStudentServiceWithSupabase() {
  if (!isSupabaseConfigured() || !supabase) return

  try {
    const [studentsRes, staffRes, deptsRes, catsRes] = await Promise.all([
      supabase.from('students').select('*').order('name'),
      supabase.from('staff').select('*').order('name'),
      supabase.from('departments').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
    ])

    if (!studentsRes.error && Array.isArray(studentsRes.data) && studentsRes.data.length > 0) {
      students = studentsRes.data
      saveToStorage(STUDENTS_KEY, students)
    }
    if (!staffRes.error && Array.isArray(staffRes.data)) {
      staff = staffRes.data
      saveToStorage(STAFF_KEY, staff)
    }
    if (!deptsRes.error && Array.isArray(deptsRes.data) && deptsRes.data.length > 0) {
      departments = deptsRes.data.map((d) => d.name)
      saveToStorage(DEPTS_KEY, departments)
    }
    if (!catsRes.error && Array.isArray(catsRes.data) && catsRes.data.length > 0) {
      categories = catsRes.data.map((c) => c.name)
      saveToStorage(CATS_KEY, categories)
    }
  } catch (err) {
    console.warn('Could not sync student data from Supabase:', err)
  }
}

if (!isInitialized && isSupabaseConfigured()) {
  isInitialized = true
  syncStudentServiceWithSupabase().catch(() => {})
}

export function getStudents() {
  return [...students]
}

export function searchStudents(query = '') {
  const value = query.trim().toLowerCase()
  if (!value) return [...students]

  const startsWithFirst = []
  const startsWithWord = []
  const containsOthers = []

  students.forEach((person) => {
    const nameLower = (person.name || '').toLowerCase()
    const rollLower = (person.roll_no || '').toLowerCase()
    const prnLower = (person.prn || '').toLowerCase()
    const words = nameLower.split(/\s+/)

    if (nameLower.startsWith(value) || rollLower.startsWith(value) || prnLower.startsWith(value)) {
      startsWithFirst.push(person)
    } else if (words.some((word) => word.startsWith(value))) {
      startsWithWord.push(person)
    } else if (nameLower.includes(value) || rollLower.includes(value) || prnLower.includes(value)) {
      containsOthers.push(person)
    }
  })

  return [...startsWithFirst, ...startsWithWord, ...containsOthers]
}

export function getRecommendedStudents(query = '') {
  return searchStudents(query)
}

export function getStudentById(id) {
  if (!id) return null
  const cleanId = String(id).trim().toLowerCase()
  return students.find((student) => 
    String(student.id).toLowerCase() === cleanId ||
    String(student.roll_no || '').toLowerCase() === cleanId ||
    String(student.prn || '').toLowerCase() === cleanId
  ) ?? null
}

export function getStudentByPrn(prn) {
  return getStudentById(prn)
}

/**
 * Register or update a student's unique alphanumeric PRN
 */
export function registerStudentPrn(rollNo, alphanumericPrn) {
  const cleanPrn = String(alphanumericPrn || '').trim().toUpperCase()
  if (!cleanPrn || cleanPrn.length < 4) {
    throw new Error('PRN must be at least 4 alphanumeric characters.')
  }

  // Ensure PRN is unique across other students
  const takenBy = students.find((s) => 
    String(s.prn || '').toUpperCase() === cleanPrn && 
    String(s.roll_no || '').toUpperCase() !== String(rollNo).toUpperCase()
  )
  if (takenBy) {
    throw new Error(`PRN "${cleanPrn}" is already registered to ${takenBy.name}.`)
  }

  const student = students.find((s) => String(s.roll_no).toUpperCase() === String(rollNo).toUpperCase())
  if (!student) {
    throw new Error(`Student with Roll No ${rollNo} not found.`)
  }

  student.prn = cleanPrn
  student.prn_registered = true
  saveToStorage(STUDENTS_KEY, students)

  if (isSupabaseConfigured() && supabase) {
    safeSupabaseQuery(supabase.from('students').update({ prn: cleanPrn }).eq('roll_no', rollNo))
  }

  return student
}

export function getStaff() {
  return [...staff]
}

export function saveStudent(student) {
  const rollNo = String(student.roll_no || `C${students.length + 1}`).toUpperCase()
  const prn = String(student.prn || `PRN2024IT${pad3(students.length + 1)}`).toUpperCase()
  const exists = students.some((item) => String(item.roll_no).toUpperCase() === rollNo)

  const studentRecord = {
    ...student,
    id: rollNo,
    roll_no: rollNo,
    prn,
    status: student.status || 'Active',
    department: student.department || 'Information Technology',
    year: student.year || '2nd Year',
  }

  if (exists) {
    students = students.map((item) => (String(item.roll_no).toUpperCase() === rollNo ? { ...item, ...studentRecord } : item))
  } else {
    students = [...students, studentRecord]
  }
  saveToStorage(STUDENTS_KEY, students)

  if (isSupabaseConfigured() && supabase) {
    if (exists) {
      safeSupabaseQuery(supabase.from('students').update(studentRecord).eq('roll_no', rollNo))
    } else {
      safeSupabaseQuery(supabase.from('students').insert([studentRecord]))
    }
  }

  return studentRecord
}

export function removeStudent(id) {
  const cleanId = String(id).toLowerCase()
  students = students.filter((student) => 
    String(student.id).toLowerCase() !== cleanId &&
    String(student.roll_no || '').toLowerCase() !== cleanId &&
    String(student.prn || '').toLowerCase() !== cleanId
  )
  saveToStorage(STUDENTS_KEY, students)

  if (isSupabaseConfigured() && supabase) {
    safeSupabaseQuery(supabase.from('students').delete().or(`roll_no.eq.${id},prn.eq.${id}`))
  }
}

export function addStudent(student) {
  return saveStudent(student)
}

export function updateStudent(id, updates) {
  const existing = getStudentById(id)
  return saveStudent({ ...existing, ...updates, id })
}

export function deactivateStudent(id) {
  return updateStudent(id, { status: 'Inactive' })
}

export function saveStaff(person) {
  const exists = staff.some((item) => String(item.id) === String(person.id))
  const id = person.id ? Number(person.id) || person.id : Date.now()
  const staffRecord = {
    ...person,
    id,
    role: 'Staff',
    status: person.status || 'Active',
    department: person.department || 'Information Technology',
    designation: person.designation || 'Faculty Coordinator',
  }

  if (exists) {
    staff = staff.map((item) => (String(item.id) === String(person.id) ? { ...item, ...staffRecord } : item))
  } else {
    staff = [...staff, staffRecord]
  }
  saveToStorage(STAFF_KEY, staff)

  if (isSupabaseConfigured() && supabase) {
    if (exists) {
      safeSupabaseQuery(supabase.from('staff').update(staffRecord).eq('id', id))
    } else {
      safeSupabaseQuery(supabase.from('staff').insert([staffRecord]))
    }
  }

  return staffRecord
}

export function removeStaff(id) {
  staff = staff.filter((person) => String(person.id) !== String(id))
  saveToStorage(STAFF_KEY, staff)

  if (isSupabaseConfigured() && supabase) {
    safeSupabaseQuery(supabase.from('staff').delete().eq('id', id))
  }
}

export function addStaff(person) {
  return saveStaff(person)
}

export function updateStaff(id, updates) {
  const existing = staff.find((person) => String(person.id) === String(id))
  return saveStaff({ ...existing, ...updates, id })
}

export function deactivateStaff(id) {
  return updateStaff(id, { status: 'Inactive' })
}

export function getDepartments() {
  return [...departments]
}

export function saveDepartment(name, previousName = '') {
  const value = String(name).trim()
  if (!value) return getDepartments()
  departments = previousName
    ? departments.map((item) => (item === previousName ? value : item))
    : departments.includes(value)
      ? departments
      : [...departments, value]
  saveToStorage(DEPTS_KEY, departments)

  if (isSupabaseConfigured() && supabase) {
    if (previousName) {
      safeSupabaseQuery(supabase.from('departments').update({ name: value }).eq('name', previousName))
    } else {
      safeSupabaseQuery(supabase.from('departments').insert([{ name: value }]))
    }
  }
  return getDepartments()
}

export function removeDepartment(name) {
  departments = departments.filter((item) => item !== name)
  saveToStorage(DEPTS_KEY, departments)

  if (isSupabaseConfigured() && supabase) {
    safeSupabaseQuery(supabase.from('departments').delete().eq('name', name))
  }
}

export function addDepartment(name) {
  return saveDepartment(name)
}

export function updateDepartment(previousName, name) {
  return saveDepartment(name, previousName)
}

export function deleteDepartment(name) {
  return removeDepartment(name)
}

export function getCategories() {
  return [...categories]
}

export function saveCategory(name, previousName = '') {
  const value = String(name).trim()
  if (!value) return getCategories()
  categories = previousName
    ? categories.map((item) => (item === previousName ? value : item))
    : categories.includes(value)
      ? categories
      : [...categories, value]
  saveToStorage(CATS_KEY, categories)

  if (isSupabaseConfigured() && supabase) {
    if (previousName) {
      safeSupabaseQuery(supabase.from('categories').update({ name: value }).eq('name', previousName))
    } else {
      safeSupabaseQuery(supabase.from('categories').insert([{ name: value }]))
    }
  }
  return getCategories()
}

export function removeCategory(name) {
  categories = categories.filter((item) => item !== name)
  saveToStorage(CATS_KEY, categories)

  if (isSupabaseConfigured() && supabase) {
    safeSupabaseQuery(supabase.from('categories').delete().eq('name', name))
  }
}

export function addCategory(name) {
  return saveCategory(name)
}

export function updateCategory(previousName, name) {
  return saveCategory(name, previousName)
}

export function deleteCategory(name) {
  return removeCategory(name)
}

export function resetAllStudentServiceData() {
  students = [...SEED_STUDENTS]
  staff = []
  departments = [...mockDepartments]
  categories = [...mockCategories]
  saveToStorage(STUDENTS_KEY, students)
  saveToStorage(STAFF_KEY, staff)
  saveToStorage(DEPTS_KEY, departments)
  saveToStorage(CATS_KEY, categories)
}
