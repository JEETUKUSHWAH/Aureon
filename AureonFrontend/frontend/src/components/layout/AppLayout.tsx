import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { fetchCompanyDetails } from '@/store/slices/authSlice'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Initial fetch
    dispatch(fetchCompanyDetails())

    // Poll every 60 seconds for real-time company updates
    const interval = setInterval(() => {
      dispatch(fetchCompanyDetails())
    }, 60000)

    return () => clearInterval(interval)
  }, [dispatch])

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <div className={`
        fixed top-0 bottom-0 left-0 z-50 md:z-auto md:relative md:translate-x-0 transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-5 md:p-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
