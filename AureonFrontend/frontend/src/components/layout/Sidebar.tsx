import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, FileText,
  Receipt, Wallet, Zap, Settings, Users, BarChart3,
  ChevronRight, X, LogOut, Building2, HelpCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { toast } from 'react-hot-toast'
const navItems = [
  {
    group: 'Overview',
    links: [
      { name: 'Dashboard',     path: '/dashboard',              icon: LayoutDashboard, end: true },
      { name: 'Transactions',  path: '/dashboard/transactions', icon: ArrowLeftRight },
      { name: 'Analytics',     path: '/dashboard/analytics',    icon: BarChart3 },
    ]
  },
  {
    group: 'Money',
    links: [
      { name: 'Payments',   path: '/dashboard/payments',  icon: Wallet },
      { name: 'Cards',      path: '/dashboard/cards',     icon: CreditCard },
      { name: 'Invoicing',  path: '/dashboard/invoicing', icon: FileText },
      { name: 'Expenses',   path: '/dashboard/expenses',  icon: Receipt },
    ]
  },
  {
    group: 'Manage',
    links: [
      { name: 'Accounts',   path: '/dashboard/account',   icon: Building2 },
      { name: 'Vendors',    path: '/dashboard/vendors',   icon: Building2 },
      { name: 'Team',       path: '/dashboard/team',      icon: Users },
      { name: 'Settings',   path: '/dashboard/settings',  icon: Settings },
    ]
  }
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('User has been successfully logged out')
      navigate('/login')
    } catch (err: any) {
      toast.error(err || 'Logout failed. Please try again.')
    }
  }

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-100 h-full overflow-hidden">

      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 flex-shrink-0">
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="text-base font-bold text-gray-900 tracking-tight">Aureon</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="btn-icon md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Workspace pill */}
      <div className="px-4 py-3 flex-shrink-0">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group text-left">
          <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-none mb-0.5">Starlight Labs</p>
            <p className="text-xs text-gray-400 truncate">Pro Plan</p>
          </div>
          <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide">
        <motion.div
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        >
          {navItems.map((group) => (
            <div key={group.group} className="mb-6">
              <p className="text-2xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-1.5">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.links.map((link) => (
                  <motion.div
                    key={link.path}
                    variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                  >
                    <NavLink
                      to={link.path}
                      end={link.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        isActive ? 'nav-link-active' : 'nav-link'
                      }
                    >
                      <link.icon size={16} className="flex-shrink-0" />
                      <span>{link.name}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </nav>

      {/* Bottom */}
      <div className="flex-shrink-0 border-t border-gray-100">
        {/* Help */}
        <div className="px-3 pt-3">
          <button className="nav-link w-full">
            <HelpCircle size={16} className="flex-shrink-0 text-gray-400" />
            <span>Help & Support</span>
          </button>
        </div>

        {/* User */}
        <div className="px-3 pt-2 pb-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
            <img
              src="/founder.png"
              alt="User"
              className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-none mb-0.5">
                {user?.companyName || 'Aureon'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.role ?? 'Founder & CEO'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-1 rounded"
              title="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
