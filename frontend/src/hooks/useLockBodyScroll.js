import { useEffect } from 'react'

/**
 * Universal hook to lock body & html scroll when any modal or popup is open.
 * Prevents the background window from scrolling while popups are visible.
 */
export function useLockBodyScroll(isLocked = false) {
  useEffect(() => {
    if (!isLocked) return undefined

    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyPaddingRight = document.body.style.paddingRight

    // Calculate scrollbar width on Windows/macOS to avoid layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.paddingRight = originalBodyPaddingRight
    }
  }, [isLocked])
}

export default useLockBodyScroll
