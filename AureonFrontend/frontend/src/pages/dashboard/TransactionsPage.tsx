import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchPayments } from '@/store/slices/paymentsSlice'
import { Download, Filter, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react'
import { format } from 'date-fns'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } })
}

const statusConfig: any = {
  completed: { badge: 'badge-success', icon: CheckCircle2, label: 'Cleared' },
  cleared: { badge: 'badge-success', icon: CheckCircle2, label: 'Cleared' },
  pending: { badge: 'badge-warning', icon: Clock, label: 'Pending' },
  failed: { badge: 'badge-danger', icon: AlertCircle, label: 'Declined' },
  declined: { badge: 'badge-danger', icon: AlertCircle, label: 'Declined' },
}

const getStatus = (s: string) => statusConfig[s.toLowerCase()] || { badge: 'badge-gray', icon: AlertCircle, label: s }

export default function TransactionsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: payments, loading, error } = useSelector((state: RootState) => state.payments)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 7

  useEffect(() => {
    dispatch(fetchPayments())
  }, [dispatch])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, payments])

  const tabs = ['All', 'Incoming', 'Outgoing', 'Pending', 'Declined']

  const filtered = (payments || []).filter(tx => {
    const status = (tx.status || tx.paymentStatus || tx.transactionStatus || '').toLowerCase()
    const amount = Number(tx.amount || tx.paymentAmount || tx.totalAmount || tx.transactionAmount) || 0
    const details = tx.details || tx.paymentDetails || tx.description || tx.vendor || ''
    const category = tx.category || tx.paymentCategory || tx.type || ''

    const matchTab =
      activeTab === 'All' ? true :
        activeTab === 'Incoming' ? amount > 0 :
          activeTab === 'Outgoing' ? amount < 0 :
            activeTab === 'Pending' ? status === 'pending' :
              activeTab === 'Declined' ? (status === 'failed' || status === 'declined') : true

    const matchSearch = !searchQuery ||
      details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.vendor && tx.vendor.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchTab && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalVolume = payments.reduce((sum, p) => sum + Math.abs(Number(p.amount || p.paymentAmount || p.totalAmount) || 0), 0)
  const pendingCount = payments.filter(p => (p.status || p.paymentStatus || p.transactionStatus || '').toLowerCase() === 'pending').length

  const stats = [
    { label: 'Total Volume', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalVolume), change: 'Total ledger volume' },
    { label: 'Pending Items', value: String(pendingCount), change: 'Awaiting clearance' },
    { label: 'Total Records', value: String(payments.length), change: 'Transactions found' },
  ]

  return (
    <div className="space-y-7">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            {loading ? 'Fetching latest records...' : `Full financial ledger · ${payments.length} entries`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => alert('This feature will come soon')} className="btn-secondary gap-2"><Download size={15} /> Export CSV</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible" className="card p-5">
            <p className="stat-label mb-3">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1.5">{s.change}</p>
          </motion.div>
        ))}
      </div>

      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative ml-auto w-full sm:w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {error && (
            <div className="p-10 text-center text-red-500 text-sm">
              Failed to load transactions: {error}
            </div>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="py-3 px-5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((tx: any) => {
                const amount = tx.amount || tx.paymentAmount || tx.totalAmount || tx.transactionAmount || 0
                const rawDate = tx.date || tx.paymentDate || tx.transactionDate || tx.createdAt
                const details = tx.details || tx.paymentDetails || tx.description || tx.vendor || 'Transaction'
                const category = tx.category || tx.paymentCategory || tx.type || 'General'
                const status = (tx.status || tx.paymentStatus || tx.transactionStatus || 'pending').toLowerCase()

                const st = getStatus(status)
                const numAmount = Number(amount)
                const isPos = numAmount > 0

                const displayDate = rawDate ? (String(rawDate).includes('T') ? format(new Date(rawDate), 'MMM dd, yyyy') : rawDate) : 'N/A'
                const displayTime = rawDate && String(rawDate).includes('T') ? format(new Date(rawDate), 'hh:mm a') : ''

                return (
                  <tr key={tx.id || tx.paymentId || Math.random()} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-5">
                      <p className="text-sm font-semibold text-gray-900">{displayDate}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{displayTime}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold bg-primary-100 text-primary-700`}>
                          {(tx.vendor || details || 'T')[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {tx.vendor || details}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{details}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="badge-gray text-xs">{category}</span>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className={`${st.badge} text-xs`}>
                        <st.icon size={11} /> {st.label}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <p className={`font-mono font-semibold tabular-nums ${isPos ? 'text-success-dark' : 'text-gray-900'}`}>
                        {isPos ? '+' : ''}${Math.abs(numAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-2xs text-gray-400 font-semibold uppercase mt-0.5">USD</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!loading && paginated.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-400 text-sm">No transactions match your filter.</p>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing {Math.min(filtered.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filtered.length, currentPage * pageSize)} of {filtered.length} results
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (totalPages > 5 && Math.abs(page - currentPage) > 2) return null
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${currentPage === page ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
