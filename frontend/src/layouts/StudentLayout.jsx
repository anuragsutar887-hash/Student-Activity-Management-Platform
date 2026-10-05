import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'

export default function StudentLayout({ children, title = 'Dashboard' }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      <Header title={title} />
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children || <Outlet />}
      </main>
    </div>
  )
}
