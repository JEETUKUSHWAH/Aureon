import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, CreditCard, Building2, Users, Check, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } })
}

const sections = [
  { id: 'profile',  label: 'Company Details', icon: User },
  { id: 'notifs',   label: 'Notifications',   icon: Bell },
  { id: 'security', label: 'Security',       icon: Shield },
  { id: 'billing',  label: 'Billing & Plan', icon: CreditCard },
  { id: 'company',  label: 'Company',        icon: Building2 },
  { id: 'team',     label: 'Team',           icon: Users },
]

const notifToggles = [
  { label: 'Payment received',       sub: 'Get notified when a payment lands in your account',    on: true  },
  { label: 'Failed transactions',    sub: 'Alerts for declined or failed payment attempts',        on: true  },
  { label: 'Weekly spend report',    sub: 'A summary of your weekly expenditure every Monday',     on: true  },
  { label: 'Invoice status updates', sub: 'When an invoice is viewed, paid, or becomes overdue',   on: false },
  { label: 'Card activity',          sub: 'Real-time alerts for each card transaction',            on: false },
]

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${on ? 'bg-primary-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${on ? 'right-0.5' : 'left-0.5'}`}/>
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [active, setActive] = useState('profile')
  const [notifs, setNotifs] = useState(notifToggles)
  const [twofa, setTwofa] = useState(false)

  // Split name for first/last name fields
  const names = (user?.name || 'Abhay Sharma').split(' ')
  const firstName = names[0]
  const lastName = names.slice(1).join(' ')

  const toggleNotif = (i: number) =>
    setNotifs(ns => ns.map((n, idx) => idx === i ? { ...n, on: !n.on } : n))

  return (
    <div className="space-y-6">

      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, security, and preferences.</p>
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="flex gap-6 flex-col lg:flex-row">

        {/* Sidebar nav */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="card p-2">
            <nav className="space-y-0.5">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active === s.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <s.icon size={16} className="flex-shrink-0"/>
                  {s.label}
                  {active === s.id && <ChevronRight size={13} className="ml-auto text-primary-400"/>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0">

          {/* Profile */}
          {active === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-6">
              <div>
                <p className="section-title mb-4">Company Details</p>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center border-2 border-primary-50">
                    <Building2 size={32} className="text-primary-600"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Company Logo</p>
                    <p className="text-xs text-gray-400 mt-0.5">Contact support to update your logo</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="form-label">Company Name</label>
                    <input className="form-input bg-gray-50" defaultValue={user?.companyName || user?.displayName || "Aureon"} readOnly/>
                  </div>
                  <div><label className="form-label">Business Type</label><input className="form-input bg-gray-50" defaultValue={user?.businessType || "Corporation"} readOnly/></div>
                  <div><label className="form-label">Tax ID (EIN)</label><input className="form-input bg-gray-50" defaultValue={user?.taxId || user?.ein || "XX-XXXXXXX"} readOnly/></div>
                  <div><label className="form-label">Phone Number</label><input className="form-input bg-gray-50" defaultValue={user?.phone || user?.phoneNumber || "+1 (555) 000-0000"} readOnly/></div>
                  <div><label className="form-label">Website</label><input className="form-input bg-gray-50" defaultValue={user?.website || "https://aureon.com"} readOnly/></div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Business Address</label>
                    <input 
                      className="form-input bg-gray-50" 
                      readOnly
                      defaultValue={
                        user?.address || 
                        [
                          user?.addressLine1,
                          user?.addressLine2,
                          user?.city,
                          user?.state,
                          user?.country,
                          user?.postalCode
                        ].filter(Boolean).join(', ') ||
                        "123 Business Way, San Francisco, CA"
                      }
                    />
                  </div>
                  {/* Dynamic fields from backend */}
                  {Object.entries(user || {}).map(([key, value]) => {
                    const skip = [
                      'name', 'companyName', 'email', 'businessType', 'taxId', 'phone', 'website', 'address', 
                      'accessToken', 'refreshToken', 'memberId', 'companyId', 'expiresAt', 'id', 'roles',
                      'isAuthenticated', 'loading', 'avatarUrl', 'role', 'ein', 'owner', 'displayName', 
                      'companyEmail', 'location', 'phoneNumber', 'addressLine1', 'addressLine2', 'city', 'state', 'country', 'postalCode',
                      'ownerEmail'
                    ]
                    if (skip.includes(key) || typeof value === 'object' || !value) return null
                    return (
                      <div key={key}>
                        <label className="form-label">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <input className="form-input bg-gray-50" defaultValue={String(value)} readOnly />
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {active === 'notifs' && (
            <motion.div key="notifs" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <p className="section-title mb-5">Notification Preferences</p>
              <div className="space-y-4">
                {notifs.map((n, i) => (
                  <div key={n.label} className="flex items-start justify-between gap-4 py-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{n.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.sub}</p>
                    </div>
                    <Toggle on={n.on} onChange={() => toggleNotif(i)}/>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Security */}
          {active === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="card p-6">
                <p className="section-title mb-5">Password</p>
                <div className="space-y-4">
                  <div><label className="form-label">Current Password</label><input type="password" placeholder="••••••••" className="form-input"/></div>
                  <div><label className="form-label">New Password</label><input type="password" placeholder="••••••••" className="form-input"/></div>
                  <div><label className="form-label">Confirm Password</label><input type="password" placeholder="••••••••" className="form-input"/></div>
                </div>
                <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
                  <button className="btn-primary" onClick={() => toast.success('Password updated!')}>Update Password</button>
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="section-title">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-400 mt-1">Protect your account with an authenticator app.</p>
                  </div>
                  <Toggle on={twofa} onChange={() => { setTwofa(v => !v); toast.success(twofa ? '2FA disabled' : '2FA enabled') }}/>
                </div>
              </div>
            </motion.div>
          )}

          {/* Billing */}
          {active === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <p className="section-title mb-5">Current Plan</p>
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
                    <CreditCard size={22} className="text-white"/>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Pro Plan</p>
                    <p className="text-sm text-gray-500">$299 / month · Renews May 1, 2024</p>
                  </div>
                </div>
                <button className="btn-secondary text-sm">Upgrade</button>
              </div>
              <p className="section-title mb-4">Payment Method</p>
              <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                <div className="w-10 h-7 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-2xs font-bold">VISA</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Visa ending in 4821</p>
                  <p className="text-xs text-gray-400">Expires 09/2025</p>
                </div>
                <button className="btn-ghost text-xs py-1.5 px-3">Update</button>
              </div>
            </motion.div>
          )}

          {/* Company / others */}
          {(active === 'company' || active === 'team') && (
            <motion.div key={active} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="card p-6 text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                {active === 'company' ? <Building2 size={26} className="text-gray-400"/> : <Users size={26} className="text-gray-400"/>}
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-2">
                {active === 'company' ? 'Company Settings' : 'Team Management'}
              </p>
              {active === 'team' && (
                <p className="text-sm text-gray-400 mb-6">Team Management is coming soon.</p>
              )}
              {active === 'company' && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button 
                    className="btn-primary" 
                    onClick={() => toast.success('Our team will reach you soon', {
                      icon: '🚀',
                      style: { borderRadius: '10px', background: '#333', color: '#fff' }
                    })}
                  >
                    Update Company Details
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => toast.success('Re-KYC request submitted. Our compliance team will reach you soon', {
                      icon: '🛡️',
                      style: { borderRadius: '10px', background: '#333', color: '#fff' }
                    })}
                  >
                    Request Re-KYC
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
