import { Component } from 'react'
import { Link } from 'react-router-dom'
import { CircleAlert, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled runtime error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
          <section role="alert" className="max-w-lg w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-2">
              <CircleAlert size={32} />
            </span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-500">
              {this.state.error?.message || 'This page could not be displayed. You can return to the home page and try again.'}
            </p>

            {this.state.error?.stack && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-slate-600">
                  View technical error details
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-900 p-3 text-[11px] text-rose-300 font-mono">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <RotateCcw size={16} /> Try Again
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 transition"
              >
                Back to home
              </Link>
            </div>
          </section>
        </main>
      )
    }
    return this.props.children
  }
}
