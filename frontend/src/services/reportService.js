import { getAllActivities } from './activityService.js'
import { getStudents } from './studentService.js'

export function getReportSummary(activities = getAllActivities()) {
  const categoryCounts = {}
  const statusCounts = { Verified: 0, Pending: 0, Rejected: 0, Draft: 0 }
  const departmentCounts = {}
  const studentDepartments = new Map(getStudents().map((student) => [student.id, student.department]))
  activities.forEach((activity) => {
    categoryCounts[activity.category] = (categoryCounts[activity.category] ?? 0) + 1
    statusCounts[activity.status] = (statusCounts[activity.status] ?? 0) + 1
    const department = studentDepartments.get(activity.student_id) ?? 'Other'
    departmentCounts[department] = (departmentCounts[department] ?? 0) + 1
  })
  return { categoryCounts, statusCounts, departmentCounts, total: activities.length }
}

export function getMonthlyActivities(activities = getAllActivities()) {
  const months = new Map()
  activities.forEach((activity) => {
    const rawDate = activity.date ?? activity.submitted_at ?? '2026-02-15'
    const key = typeof rawDate === 'string' && rawDate.length >= 7 ? rawDate.slice(0, 7) : '2026-02'
    months.set(key, (months.get(key) ?? 0) + 1)
  })
  return [...months.entries()].sort(([first], [second]) => first.localeCompare(second)).map(([month, count]) => ({ month, count }))
}

export function getStudentActivityDistribution(activities = getAllActivities()) {
  const names = new Map(getStudents().map((student) => [student.id, student.name]))
  const counts = new Map()
  activities.forEach((activity) => {
    const id = activity.student_id
    const record = counts.get(id) ?? { name: names.get(id) ?? activity.student_name ?? 'Unknown student', count: 0 }
    record.count += 1
    counts.set(id, record)
  })
  return [...counts.values()].sort((first, second) => second.count - first.count || first.name.localeCompare(second.name))
}

export function getReports() {
  const activities = getAllActivities()
  return {
    summary: getReportSummary(activities),
    monthly: getMonthlyActivities(activities),
    students: getStudentActivityDistribution(activities),
  }
}


