import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, Menu, CheckCircle2, AlertCircle, CreditCard, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

const notifications = [
  { id: 1, type: 'success', icon: CheckCircle2, title: 'Payment sent', desc: '$12,400 to Starlight Labs via ACH', time: '2m ago', read: false },
  { id: 2, type: 'warning', icon: AlertCircle, title: 'Card limit approaching', desc: 'Marketing card at 88% of monthly limit', time: '1h ago', read: false },
  { id: 3, type: 'info',    icon: CreditCard,  title: 'New device login', desc: 'MacBook Pro — San Francisco, CA', time: '5h ago', read: true },
]

const iconColor = { success: 'text-success bg-success-light', warning: 'text-warning bg-warning-light', info: 'text-info bg-info-light' }

interface TopbarProps { onMenuClick?: () => void }

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotif, setShowNotif]     = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notifRef   = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotif(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 lg:px-7 sticky top-0 z-30 flex-shrink-0">

      {/* Left */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="btn-icon md:hidden">
          <Menu size={20} />
        </button>
        <div className="relative flex-1 max-w-sm hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Quick Action */}
        <Link
          to="/dashboard/payments"
          className="hidden sm:inline-flex btn-primary py-2 px-3.5 text-xs"
        >
          + Send Money
        </Link>

        <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(v => !v)}
            className="btn-icon relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  <button className="text-xs font-medium text-primary-600 hover:text-primary-700">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-primary-50/30' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${iconColor[n.type as keyof typeof iconColor]}`}>
                        <n.icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{n.title}</p>
                          <span className="text-2xs text-gray-400 flex-shrink-0 mt-0.5">{n.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-tight">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3">
                  <button className="text-xs font-medium text-gray-500 hover:text-gray-700 w-full text-center">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <Link to="/dashboard/settings" className="btn-icon">
          <Settings size={18} />
        </Link>

        <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(v => !v)}
            className="flex items-center gap-2 rounded-lg hover:bg-gray-50 p-1.5 pr-2 transition-colors"
          >
            <img src="/founder.png" alt="User" className="w-7 h-7 rounded-full border border-gray-200" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-900 leading-none">{user?.companyName || 'Aureon'}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{user?.companyName || 'Aureon'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                </div>
                {[
                  { label: 'Account Settings', path: '/dashboard/settings' },
                  { label: 'Billing & Plan',   path: '/dashboard/settings' },
                  { label: 'Team Members',     path: '/dashboard/team' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setShowProfile(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-gray-50 mt-1">
                  <button 
                    onClick={async () => {
                      try {
                        await logout()
                        toast.success('User has been successfully logged out')
                        navigate('/login')
                      } catch (e) {
                        // Error handled by logout thunk if needed
                      }
                    }}
                    className="w-full px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors text-left"
                  >
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
