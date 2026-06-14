import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchAccounts } from '@/store/slices/accountsSlice'
import { Plus, Eye, Download, ArrowUpRight, ArrowDownRight, Wallet, Loader2, X } from 'lucide-react'
import api from '@/api/axiosInstance'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } })
}

const accounts = [
  { id: '1', type: 'Checking', nickname: 'Main Operating', number: '****4821', fullNumber: '10000004821', createdAt: '2023-01-15T00:00:00Z', balance: 98450.75, status: 'ACTIVE', routing: '021000021', bank: 'Chase Business', color: 'from-primary-600 to-primary-800' },
  { id: '2', type: 'Savings', nickname: 'Reserve', number: '****7334', fullNumber: '10000007334', createdAt: '2023-01-20T00:00:00Z', balance: 44400.00, status: 'ACTIVE', routing: '021000021', bank: 'Chase Business', color: 'from-emerald-600 to-emerald-800' },
]

const miniTx = [
  { desc: 'Invoice #1042 Payment', date: '25 Mar', type: 'in', amount: 25000 },
  { desc: 'AWS Bill', date: '23 Mar', type: 'out', amount: 890 },
  { desc: 'Wire to Supplier', date: '21 Mar', type: 'out', amount: 12000 },
  { desc: 'Client Retainer', date: '18 Mar', type: 'in', amount: 15000 },
]

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function AccountsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: fetchedAccounts, loading, error } = useSelector((state: RootState) => state.accounts)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAccountType, setNewAccountType] = useState('CHECKING')
  const [newNickname, setNewNickname] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateAccount = async () => {
    if (!newNickname.trim()) return;
    setIsCreating(true);
    try {
      await api.post('/accounts', { accountType: newAccountType, nickname: newNickname });
      setIsModalOpen(false);
      setNewNickname('');
      setNewAccountType('CHECKING');
      dispatch(fetchAccounts());
    } catch (error) {
      console.error("Failed to create account", error);
      alert("Failed to create account");
    } finally {
      setIsCreating(false);
    }
  }

  useEffect(() => {
    // Initial fetch
    dispatch(fetchAccounts())

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(() => {
      dispatch(fetchAccounts())
    }, 10000)

    return () => clearInterval(interval)
  }, [dispatch])

  const displayAccounts = fetchedAccounts.length > 0 ? fetchedAccounts.map((acc: any, index) => ({
    id: acc.accountId || String(index),
    type: acc.accountType || 'Unknown',
    nickname: acc.nickname || acc.accountName || 'Primary Account',
    number: `****${String(acc.accountNumber || acc.accountId || '0000').slice(-4)}`,
    fullNumber: acc.accountNumber || acc.accountId || 'N/A',
    createdAt: acc.createdAt || new Date().toISOString(),
    balance: Number(acc.balance) || 0,
    status: acc.status || 'ACTIVE',
    routing: '021000021',
    bank: acc.accountName || 'Bank',
    color: index % 2 === 0 ? 'from-primary-600 to-primary-800' : 'from-emerald-600 to-emerald-800'
  })) : accounts;

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = displayAccounts.find(a => a.id === selectedId) || displayAccounts[0];

  return (
    <div className="space-y-7">

      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Manage your bank accounts and cash positions.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary gap-2"><Plus size={15} /> New Account</button>
      </motion.div>

      {/* Account Cards */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-gray-400">
            <Loader2 className="animate-spin mr-2" size={20} /> Fetching accounts...
          </div>
        ) : error ? (
          <div className="col-span-full py-12 flex justify-center text-red-400">
            {error}
          </div>
        ) : displayAccounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => setSelectedId(acc.id)}
            className={`rounded-2xl bg-gradient-to-br ${acc.color} text-white p-6 text-left relative overflow-hidden transition-all ring-2 ${selected.id === acc.id ? 'ring-white shadow-xl scale-[1.01]' : 'ring-transparent shadow-md hover:shadow-lg hover:scale-[1.005]'
              }`}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-14 -mt-14 blur-lg" />
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-2xs font-semibold uppercase tracking-widest mb-2">
                    {acc.type} Account
                  </span>
                  <p className="text-sm text-white/70 font-mono">{acc.number}</p>
                </div>
                <Wallet size={22} className="text-white/60" />
              </div>
              <p className="text-3xl font-bold mb-1">{fmt(acc.balance)}</p>
              <p className="text-xs text-white/50">{acc.bank} · Routing {acc.routing}</p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-xs text-white/60">Active</span>
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Account Details Panels */}
      {displayAccounts.map((acc, idx) => (
        <motion.div key={acc.id} custom={2 + idx} variants={fadeUp} initial="hidden" animate="visible" className="card p-6 mb-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="section-title">{acc.type} Account — {acc.number}</p>
              <p className="text-xs text-gray-400 mt-0.5">{acc.bank} · Routing {acc.routing}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">A/C: <span className="font-mono">{acc.fullNumber}</span></p>
              <p className="text-xs text-gray-400 mt-0.5">Created: {new Date(acc.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Available Balance', value: fmt(acc.balance), color: 'text-gray-900', icon: Wallet },
              { label: 'Status', value: acc.status, color: 'text-success-dark', icon: Eye },
              { label: 'Nickname', value: acc.nickname, color: 'text-primary-700', icon: Wallet },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.label === 'Available Balance' ? 'bg-primary-50 text-primary-600' :
                  s.label === 'Status' ? 'bg-success-light text-success-dark' : 'bg-gray-100 text-gray-600'
                  }`}>
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">{s.label}</p>
                  <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
      {/* New Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Open New Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="e.g. Main Operating"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={isCreating || !newNickname.trim()}
                className="btn-primary gap-2"
              >
                {isCreating ? <Loader2 size={15} className="animate-spin" /> : null}
                Create Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
