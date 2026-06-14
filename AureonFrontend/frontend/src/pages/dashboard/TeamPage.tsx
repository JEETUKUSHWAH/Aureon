import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Filter, Mail, Shield, MoreHorizontal, CheckCircle2, Loader2, Clock, CheckCircle, X } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import api from '@/api/axiosInstance'

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  })
}

function InviteMemberModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const [isInviting, setIsInviting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'MEMBER'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.firstName || !formData.lastName) return

    setIsInviting(true)
    try {
      console.log('Sending invite with payload:', formData)
      await api.post('/team/invite', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Full server error during invitation:', error.response?.data || error)
      const status = error.response?.status
      const errorData = error.response?.data
      const errorMsg = errorData?.message || errorData?.error || errorData || 'Unknown error'
      
      alert(`Error ${status || ''}: ${errorMsg}\n\nPlease check the console for details.`)
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Invite New Member</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label mb-1.5">First Name</label>
              <input 
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="form-input text-sm"
                required
              />
            </div>
            <div>
              <label className="form-label mb-1.5">Last Name</label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="form-input text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label mb-1.5">Email Address</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@company.com"
              className="form-input text-sm"
              required
            />
          </div>

          <div>
            <label className="form-label mb-1.5">Role</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-select text-sm"
            >
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="BOOKKEEPER">Bookkeeper</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
            <button 
              type="submit" 
              disabled={isInviting}
              className="btn-primary flex-1 py-2.5 gap-2"
            >
              {isInviting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              Send Invitation
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function TeamPage() {
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const fetchMembers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      console.log('Fetching team members from /api/team...')
      
      let response
      try {
        response = await api.get('/team', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      } catch (err: any) {
        if (err.response?.status === 403) {
          console.log('403 on /team, trying fallback /api/user/team...')
          response = await api.get('/user/team', {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        } else {
          throw err
        }
      }
      
      let data = response.data?.data || response.data?.content || response.data?.members || response.data?.list || response.data
      if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
        const firstArray = Object.values(data).find(v => Array.isArray(v))
        if (firstArray) data = firstArray
      }

      setMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch team members:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers(true)

    // Real-time polling: Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchMembers(false)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const adminCount = members.filter(m => {
    const r = (m.role || '').toUpperCase()
    return r.includes('ADMIN') || r === 'OWNER' || r === 'MANAGER'
  }).length
  
  const pendingCount = members.filter(m => {
    const s = (m.status || '').toUpperCase()
    return s === 'PENDING' || s === 'INVITED' || s === 'PENDING_INVITE' || s === 'INVITATION_SENT'
  }).length

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase()
    const firstName = (m.firstName || '').toLowerCase()
    const lastName = (m.lastName || '').toLowerCase()
    const fullName = `${firstName} ${lastName}`
    const email = (m.email || '').toLowerCase()
    return fullName.includes(q) || email.includes(q)
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage your organization's members and their access levels.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="btn-primary gap-2"
        >
          <Plus size={16} /> Invite Member
        </button>
      </motion.div>

      {/* Stats / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Members', value: members.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Admin Roles', value: adminCount.toString(), icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Invites', value: pendingCount.toString(), icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible" className="card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Members List */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/40">
                <th className="py-3.5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Member</th>
                <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Access</th>
                <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Joined Date</th>
                <th className="py-3.5 px-6 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                      <p className="text-sm text-gray-500 font-medium tracking-wide">Retrieving team data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((m, idx) => {
                  const firstName = m.firstName || ''
                  const lastName = m.lastName || ''
                  const fullName = `${firstName} ${lastName}`.trim() || m.name || 'User'
                  const role = m.role || 'MEMBER'
                  const status = m.status || 'ACTIVE'
                  const date = m.createdAt || m.joinedDate || '2024-01-12T00:00:00'
                  const email = m.email || 'user@company.com'
                  const isLocked = m.locked === true
                  const initials = getInitials(fullName)

                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{fullName}</p>
                            <p className="text-xs text-gray-400 font-medium">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          role.toUpperCase().includes('ADMIN') || role.toUpperCase() === 'OWNER'
                          ? 'bg-purple-50 text-purple-700 border-purple-100' 
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {role.toUpperCase().includes('ADMIN') || role.toUpperCase() === 'OWNER' ? <Shield size={12} /> : <Users size={12} />}
                          {role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          status.toUpperCase() === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {status.toUpperCase() === 'ACTIVE' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isLocked ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                            LOCKED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            UNLOCKED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-gray-500">
                        {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Users size={32} className="text-gray-300" />
                      </div>
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        {searchQuery ? 'No matching members' : 'No members found'}
                      </p>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                        {searchQuery 
                          ? `We couldn't find any team member matching "${searchQuery}"`
                          : 'Your team is currently empty. Invite your first colleague to get started.'}
                      </p>
                      {!searchQuery && (
                        <button 
                          onClick={() => setIsInviteModalOpen(true)}
                          className="btn-primary gap-2"
                        >
                          <Plus size={16} /> Invite Member
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {isInviteModalOpen && (
        <InviteMemberModal 
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={() => fetchMembers(true)}
        />
      )}
    </div>
  )
}
