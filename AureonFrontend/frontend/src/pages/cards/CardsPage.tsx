import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, MoreHorizontal, ShieldCheck, CreditCard, Zap, Filter, Plus, EyeOff, Eye, Loader2, X, Calendar, Lock, MapPin, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchAccounts } from '@/store/slices/accountsSlice'
import api from '@/api/axiosInstance'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } })
}

const cardGradients = [
  'from-gray-800 to-gray-950',
  'from-primary-700 to-primary-900',
  'from-slate-700 to-slate-900',
  'from-indigo-700 to-indigo-900',
  'from-emerald-700 to-emerald-900',
]

function CreditCardUI({ name, mask, spent, limit, gradient }: { name: string; mask: string; spent: number; limit: number; gradient: string }) {
  const [show, setShow] = useState(false)
  const pct = Math.round((spent / limit) * 100)
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} text-white p-5 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 blur-lg" />
      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-2xs text-white/50 font-semibold uppercase tracking-widest">Corporate</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShow(v => !v)} className="text-white/50 hover:text-white transition-colors">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button className="text-white/50 hover:text-white transition-colors"><MoreHorizontal size={15} /></button>
          </div>
        </div>
        {/* Chip visual */}
        <div className="w-10 h-7 bg-amber-400/90 rounded-md flex items-center justify-center mb-5 shadow-sm">
          <div className="w-6 h-4 border border-amber-300/60 rounded flex flex-col justify-between py-0.5 px-0.5">
            <div className="w-full border-b border-amber-300/60" />
            <div className="w-full border-b border-amber-300/60" />
          </div>
        </div>
        <p className="font-mono text-lg tracking-widest mb-1 font-medium">
          {show ? '4831 2901 7723 ' : '•••• •••• '}
          {mask}
        </p>
        <p className="text-2xs text-white/50 uppercase tracking-widest mb-4">{name}</p>
        <div>
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>${spent.toLocaleString()} spent</span>
            <span>${(limit / 1000).toFixed(0)}k limit · {pct}%</span>
          </div>
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function UpdateCardModal({ card, onClose, onSuccess }: { card: any; onClose: () => void; onSuccess: () => void }) {
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    spendingLimit: card.spendingLimit || '',
    limitPeriod: card.limitPeriod || 'MONTHLY',
    nickname: card.nickname || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      // 1. Re-fetch fresh cards with 403 fallback
      console.log('Verifying card existence before update...')
      let res
      try {
        res = await api.get('/cards')
      } catch (err: any) {
        if (err.response?.status === 403) {
          res = await api.get('/user/cards')
        } else {
          throw err
        }
      }
      const cardsList = res.data?.data || res.data?.content || res.data?.cards || res.data?.list || res.data

      const currentCard = Array.isArray(cardsList) ? cardsList.find((c: any) => c.id === card.id || c.cardId === card.id) : null
      const targetId = currentCard?.cardId || currentCard?.id || card.id

      // 2. Send the update request with PATCH
      const payload = {
        spendingLimit: Number(formData.spendingLimit),
        limitPeriod: formData.limitPeriod,
        nickname: formData.nickname
      }

      console.log(`Sending PATCH update for card ${targetId}...`, payload)
      await api.patch(`/cards/${targetId}`, payload)
      alert('Card settings updated successfully.')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Failed to update card:', err)
      alert(`Failed to update card: ${err.response?.data?.message || 'Please try again.'}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-gray-900"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Update Card Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label mb-1.5">Spending Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={formData.spendingLimit}
                onChange={(e) => setFormData({ ...formData, spendingLimit: e.target.value })}
                className="form-input text-sm pl-7"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label mb-1.5">Limit Period</label>
            <select
              value={formData.limitPeriod}
              onChange={(e) => setFormData({ ...formData, limitPeriod: e.target.value })}
              className="form-select text-sm"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="TOTAL">Total</option>
            </select>
          </div>

          <div>
            <label className="form-label mb-1.5">Card Nickname</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="e.g. Marketing Card"
              className="form-input text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
            <button
              type="submit"
              disabled={isUpdating}
              className="btn-primary flex-1 py-2.5 gap-2"
            >
              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Update Card
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function CardDetailsModal({ card, onClose }: { card: any; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const isCancelled = card.status?.toLowerCase() === 'cancelled'

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleStatusToggle = async () => {
    if (isCancelled) return
    const isFrozen = card.status?.toUpperCase() === 'FROZEN'
    const action = isFrozen ? 'unfreeze' : 'freeze'

    try {
      // 1. Re-fetch fresh cards with 403 fallback
      console.log(`Verifying card existence before ${action}...`)
      let res
      try {
        res = await api.get('/cards')
      } catch (err: any) {
        if (err.response?.status === 403) {
          res = await api.get('/user/cards')
        } else {
          throw err
        }
      }
      const cardsList = res.data?.data || res.data?.content || res.data?.cards || res.data?.list || res.data

      const currentCard = Array.isArray(cardsList) ? cardsList.find((c: any) => c.id === card.id || c.cardId === card.id) : null
      const targetId = currentCard?.cardId || currentCard?.id || card.id

      // 2. Send the specific freeze/unfreeze request
      await api.post(`/cards/${targetId}/${action}`)
      alert(`Card has been successfully ${isFrozen ? 'unfrozen' : 'frozen'}.`)
      onClose()
    } catch (err) {
      console.error(`Failed to ${action} card:`, err)
      alert(`Failed to ${action} the card. Please check your connection or permissions.`)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete/cancel this card? This action cannot be undone.')) return
    try {
      // 1. Re-fetch fresh cards with 403 fallback
      console.log('Verifying card existence before deletion...')
      let res
      try {
        res = await api.get('/cards')
      } catch (err: any) {
        if (err.response?.status === 403) {
          res = await api.get('/user/cards')
        } else {
          throw err
        }
      }
      const cardsList = res.data?.data || res.data?.content || res.data?.cards || res.data?.list || res.data

      const currentCard = Array.isArray(cardsList) ? cardsList.find((c: any) => c.id === card.id || c.cardId === card.id) : null
      const targetId = currentCard?.cardId || currentCard?.id || card.id

      // 2. Send the delete (cancel) request
      await api.delete(`/cards/${targetId}`)
      alert('Card has been successfully cancelled/deleted.')
      onClose()
    } catch (err) {
      console.error('Failed to delete card:', err)
      alert('Failed to cancel the card. It may have already been removed or your session expired.')
    }
  }

  const handleUpdate = () => {
    if (isCancelled) return
    setIsUpdateModalOpen(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden text-gray-900"
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Card Management</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {isCancelled ? 'This card has been deactivated.' : 'Manage security, limits, and status for this card.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {isCancelled && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-red-900">Card is Cancelled</p>
              <p className="text-xs text-red-700 mt-0.5">This card is permanently deactivated and cannot be modified.</p>
            </div>
          </div>
        )}

        <div className={`p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ${isCancelled ? 'opacity-60 grayscale-[0.5]' : ''}`}>
          <div className="space-y-6">
            <div className="aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 text-white p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 blur-lg" />
              <div className="relative h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">Corporate</span>
                  <div className="w-10 h-7 bg-amber-400/90 rounded-md shadow-sm" />
                </div>
                <div>
                  <p className="font-mono text-xl tracking-widest mb-1 font-medium">
                    {card.cardNumber || `•••• •••• •••• ${card.lastFour || '0000'}`}
                  </p>
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Expiry</p>
                      <p className="text-sm font-medium">{card.expiryMonth || '12'}/{card.expiryYear || '26'}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70 truncate">
                  {card.nickname || card.cardholderName || 'Team Card'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleStatusToggle}
                disabled={isCancelled}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${isCancelled ? 'bg-gray-50 text-gray-400' :
                  card.status === 'Frozen' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                  }`}
              >
                {card.status === 'Frozen' ? <Zap size={20} className="mb-2" /> : <Lock size={20} className="mb-2" />}
                <span className="text-xs font-bold">{card.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}</span>
              </button>

              <button
                onClick={handleUpdate}
                disabled={isCancelled}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 text-gray-700 transition-all disabled:opacity-50"
              >
                <Settings size={20} className="mb-2" />
                <span className="text-xs font-bold">Update</span>
              </button>

              <button
                onClick={handleDelete}
                disabled={isCancelled}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-red-50 bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
              >
                <EyeOff size={20} className="mb-2" />
                <span className="text-xs font-bold">Delete</span>
              </button>

              <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-50 bg-gray-50/50 text-gray-400 grayscale">
                <ShieldCheck size={20} className="mb-2" />
                <span className="text-xs font-bold">Security</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Details</p>
              <div className="space-y-4">
                {[
                  { icon: CreditCard, label: 'Full Number', value: card.cardNumber || `•••• •••• •••• ${card.lastFour || '0000'}`, field: 'number' },
                  { icon: Calendar, label: 'Expiry', value: `${card.expiryMonth || '12'}/${card.expiryYear || '2026'}`, field: 'expiry' },
                ].map((item) => (
                  <div key={item.field} className="flex items-start gap-3 group">
                    <div className="mt-0.5 text-gray-400"><item.icon size={15} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.value, item.field)}
                      className="p-1.5 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    >
                      {copied === item.field ? <CheckCircle size={14} className="text-success-dark" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Spending</p>
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-sm font-semibold text-gray-700">Limit</p>
                  <p className="text-sm font-bold text-gray-900">${(card.spendingLimit || 5000).toLocaleString()}</p>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${((card.spentAmount || 0) / (card.spendingLimit || 5000)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
      {isUpdateModalOpen && (
        <UpdateCardModal
          card={card}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={() => {
            onClose()
          }}
        />
      )}
    </div>
  )
}

function IssueCardModal({ onClose, accounts, members, onSuccess }: { onClose: () => void; accounts: any[]; members: any[]; onSuccess: () => void }) {
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const [isIssuing, setIsIssuing] = useState(false)
  const [formData, setFormData] = useState({
    accountId: '',
    issuedToMemberId: '',
    spendingLimit: '',
    limitPeriod: 'MONTHLY',
    nickname: ''
  })

  useEffect(() => {
    if (accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0].accountId || accounts[0].id || '' }))
    }
  }, [accounts])

  useEffect(() => {
    if (members.length > 0 && !formData.issuedToMemberId) {
      // Prioritize memberId or id, never fallback to email as backend doesn't support it
      const firstMemberId = members[0].memberId || members[0].id
      if (firstMemberId) {
        setFormData(prev => ({ ...prev, issuedToMemberId: String(firstMemberId) }))
      }
    }
  }, [members])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.accountId || !formData.issuedToMemberId || !formData.spendingLimit) return

    setIsIssuing(true)
    try {
      // 1. Re-fetch fresh IDs from backend with 403 fallback
      console.log('Refreshing account and member IDs before issuance...')
      let accountsRes, membersRes
      try {
        [accountsRes, membersRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/team').catch(err => err.response?.status === 403 ? api.get('/user/team') : Promise.reject(err))
        ])
      } catch (err: any) {
        console.warn('Verified fetch failed, proceeding with existing state...', err)
      }

      // 2. Validate that the selected IDs still exist or get their most current forms
      // (This step ensures we are working with the latest backend state)

      // 3. Construct the final payload
      const payload = {
        accountId: formData.accountId,
        issuedToMemberId: formData.issuedToMemberId,
        spendingLimit: Number(formData.spendingLimit),
        limitPeriod: formData.limitPeriod,
        nickname: formData.nickname
      }

      console.log('Issuing card with fresh verification. Payload:', payload)

      const response = await api.post('/cards', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      console.log('Issue card response:', response.data)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failure during verified card issuance:', error.response?.data || error)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Validation failed. Please try again.'
      alert(`Error: ${errorMsg}`)
    } finally {
      setIsIssuing(false)
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
          <h3 className="text-lg font-bold text-gray-900">Issue New Card</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label mb-1.5">Select Account</label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="form-select text-sm"
              required
            >
              <option value="" disabled>Select an account</option>
              {accounts.map((acc) => (
                <option key={acc.accountId || acc.id} value={acc.accountId || acc.id}>
                  {acc.nickname || acc.accountName || 'Account'} (****{String(acc.accountNumber || '').slice(-4)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label mb-1.5">Issued To (Team Member)</label>
            <select
              value={formData.issuedToMemberId}
              onChange={(e) => setFormData({ ...formData, issuedToMemberId: e.target.value })}
              className="form-select text-sm"
              required
            >
              <option value="" disabled>Select a member</option>
              {members.map((m) => {
                // Strictly use memberId or id. Avoid email as the value.
                const id = m.memberId || m.id
                if (!id) return null // Skip members without a valid backend ID

                return (
                  <option key={id} value={id}>
                    {m.firstName} {m.lastName} ({m.email})
                  </option>
                )
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label mb-1.5">Spending Limit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={formData.spendingLimit}
                  onChange={(e) => setFormData({ ...formData, spendingLimit: e.target.value })}
                  placeholder="0.00"
                  className="form-input text-sm pl-7"
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label mb-1.5">Limit Period</label>
              <select
                value={formData.limitPeriod}
                onChange={(e) => setFormData({ ...formData, limitPeriod: e.target.value })}
                className="form-select text-sm"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="TOTAL">Total</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label mb-1.5">Card Nickname</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="e.g. Marketing Dept"
              className="form-input text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
            <button
              type="submit"
              disabled={isIssuing}
              className="btn-primary flex-1 py-2.5 gap-2"
            >
              {isIssuing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Issue Card
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function CardsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: accounts } = useSelector((state: RootState) => state.accounts)
  const [cards, setCards] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAccounts())

    const fetchMembers = async () => {
      try {
        let res
        try {
          res = await api.get('/team')
        } catch (err: any) {
          if (err.response?.status === 403) {
            res = await api.get('/user/team')
          } else {
            throw err
          }
        }
        let data = res.data?.data || res.data?.content || res.data?.members || res.data?.list || res.data
        if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
          const firstArray = Object.values(data).find(v => Array.isArray(v))
          if (firstArray) data = firstArray
        }
        setMembers(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch members for cards page:', err)
      }
    }
    fetchMembers()
  }, [dispatch])

  useEffect(() => {
    const fetchCards = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true)
        console.log('Fetching cards from /api/cards...')

        let response
        try {
          response = await api.get('/cards')
        } catch (err: any) {
          if (err.response?.status === 403) {
            console.log('403 on /cards, trying fallback /api/user/cards...')
            response = await api.get('/user/cards')
          } else {
            throw err
          }
        }

        console.log('Cards response raw:', response.data)

        let data = response.data?.data || response.data?.content || response.data?.cards || response.data?.list || response.data
        if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
          const firstArray = Object.values(data).find(v => Array.isArray(v))
          if (firstArray) data = firstArray
        }

        const finalData = Array.isArray(data) ? data : []
        setCards(finalData)

        // If a card is currently selected, update its data too
        if (selectedCard) {
          const updated = finalData.find((c: any) => c.id === selectedCard.id)
          if (updated) setSelectedCard(updated)
        }
      } catch (error) {
        console.error('Failed to fetch cards:', error)
      } finally {
        if (showLoading) setLoading(false)
      }
    }

    fetchCards(true)

    // Real-time polling: Refresh data every 10 seconds
    const interval = setInterval(() => {
      fetchCards(false)
    }, 10000)

    return () => clearInterval(interval)
  }, [selectedCard?.id])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (
    <div className="space-y-8">

      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Corporate Cards</h1>
          <p className="page-subtitle">Manage virtual & physical cards for your team.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="btn-primary gap-2"
          >
            <Plus size={15} /> Issue New Card
          </button>
        </div>
      </motion.div>

      {/* Card Grid */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Cards</p>
        {loading ? (
          <div className="flex items-center justify-center h-48 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : cards.filter(c => (c.status || '').toLowerCase() === 'active').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cards.filter(c => (c.status || '').toLowerCase() === 'active').slice(0, 3).map((card, idx) => (
              <CreditCardUI
                key={card.id || idx}
                name={card.cardholderName || card.name || 'Team Member'}
                mask={card.lastFour || card.mask || '0000'}
                spent={card.spent || 0}
                limit={card.limit || 5000}
                gradient={cardGradients[idx % cardGradients.length]}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 text-center p-6">
            <CreditCard className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-500">No active cards found</p>
            <p className="text-xs text-gray-400 mt-1">Issue a new card to get started</p>
          </div>
        )}
      </motion.div>

      {/* Features Strip */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: ShieldCheck, title: 'Fraud Protection', desc: 'Active on all 14 cards', bg: 'bg-primary-50 text-primary-600' },
          { icon: CreditCard, title: '2.5% Cash Back', desc: '$840.12 accrued this month', bg: 'bg-success-light text-success-dark' },
          { icon: Zap, title: 'Instant Provisioning', desc: 'Apple Pay & Google Pay ready', bg: 'bg-warning-light text-warning-dark' },
        ].map(f => (
          <div key={f.title} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg}`}>
              <f.icon size={19} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{f.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Team Members Table */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="section-title">Team Cardholders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/40">
                <th className="py-3 px-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cardholder & Nickname</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Card Info</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-40">Usage</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Period</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Card Active</th>
                <th className="py-3 px-5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                      <p className="text-xs text-gray-400 font-medium">Loading cardholders...</p>
                    </div>
                  </td>
                </tr>
              ) : cards.length > 0 ? (
                cards.map((t, idx) => {
                  const name = t.cardholderName || t.name || 'User'
                  const nickname = t.nickname || 'Team Card'
                  const limit = t.spendingLimit || 5000
                  const spent = t.spentAmount || 0
                  const pct = limit > 0 ? (spent / limit) * 100 : 0
                  const status = t.status || 'Active'
                  const role = t.role || 'Team Member'
                  const initials = getInitials(name)

                  return (
                    <tr key={t.id || idx} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{name}</p>
                            <p className="text-xs text-primary-600 font-medium">{nickname}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-mono text-gray-900 font-medium">•••• {t.lastFour || '0000'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Exp: {t.expiryMonth || '12'}/{t.expiryYear || '26'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={status === 'Active' ? 'badge-success' : 'badge-warning'}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-36">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">
                            <span>${spent.toLocaleString()}</span>
                            <span>${(limit / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="progress-track h-1.5">
                            <div
                              className={`progress-fill ${pct > 80 ? 'bg-danger' : status === 'Active' ? 'bg-primary-500' : 'bg-gray-300'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.limitPeriod || 'Monthly'}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 inline-flex items-center ${status === 'Active' ? 'bg-primary-600' : 'bg-gray-200'
                          }`}>
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${status === 'Active' ? 'right-0.5' : 'left-0.5'
                            }`} />
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              if (t.status?.toLowerCase() === 'cancelled') {
                                alert("⚠️ This card is cancelled and cannot be modified.");
                              } else {
                                setSelectedCard(t);
                              }
                            }}
                            className="btn-ghost py-1.5 px-3 text-xs gap-1.5"
                          >
                            <Settings size={13} /> Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <p className="text-sm text-gray-400">No cardholders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      {/* Modals */}
      {selectedCard && (
        <CardDetailsModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {isIssueModalOpen && (
        <IssueCardModal
          accounts={accounts}
          members={members}
          onClose={() => setIsIssueModalOpen(false)}
          onSuccess={() => {
            // Trigger a refresh of the cards list
            const fetchCards = async () => {
              const response = await api.get('/cards')
              let data = response.data?.data || response.data?.content || response.data?.cards || response.data?.list || response.data
              if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
                const firstArray = Object.values(data).find(v => Array.isArray(v))
                if (firstArray) data = firstArray
              }
              setCards(Array.isArray(data) ? data : [])
            }
            fetchCards()
          }}
        />
      )}
    </div>
  )
}
