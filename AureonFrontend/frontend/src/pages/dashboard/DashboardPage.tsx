import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchAccounts } from '@/store/slices/accountsSlice'
import {
  ArrowUpRight, ArrowDownRight,
  ChevronRight, Plus, ArrowRight, Download,
  Filter, Square, CheckCircle2, Clock
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useAuth } from '@/context/AuthContext'

/* ── Fade / stagger ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } })
}

/* ── Data ── */
const cashflowData = [
  { month: 'Jun', in: 24000, out: 16000 },
  { month: 'Jul', in: 31000, out: 19000 },
  { month: 'Aug', in: 28000, out: 21000 },
  { month: 'Sep', in: 42000, out: 24000 },
  { month: 'Oct', in: 38000, out: 18000 },
  { month: 'Nov', in: 55000, out: 29000 },
]

const recentTx = [
  { id: 'TK-101', entity: 'OpenAI API',          cat: 'SaaS',      date: 'Oct 24', status: 'Completed', amount: -120.00,   pos: false, initial: 'O', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'TK-102', entity: 'Stripe Payout',       cat: 'Revenue',   date: 'Oct 23', status: 'Completed', amount: 8450.00,   pos: true,  initial: 'S', bg: 'bg-indigo-100 text-indigo-700' },
  { id: 'TK-103', entity: 'Digital Ocean',       cat: 'Hosting',   date: 'Oct 22', status: 'Pending',   amount: -45.00,    pos: false, initial: 'D', bg: 'bg-blue-100 text-blue-700' },
  { id: 'TK-104', entity: 'Apple Store',         cat: 'Hardware',  date: 'Oct 22', status: 'Completed', amount: -2499.00,  pos: false, initial: 'A', bg: 'bg-gray-200 text-gray-800' },
  { id: 'TK-105', entity: 'Mailchimp',           cat: 'Marketing', date: 'Oct 21', status: 'Completed', amount: -89.00,    pos: false, initial: 'M', bg: 'bg-amber-100 text-amber-700' },
]

/* ── Sub-components ── */
function StatCard({
  label, value, change, changePos, sub, accent, i
}: {
  label: string; value: string; change?: string; changePos?: boolean;
  sub?: string; accent?: string; i: number
}) {
  return (
    <motion.div
      custom={i} variants={fadeUp} initial="hidden" animate="visible"
      className="card p-6 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <p className="stat-label">{label}</p>
        {change && (
          <span className={changePos ? 'stat-change-up' : 'stat-change-down'}>
            {changePos ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>} {change}
          </span>
        )}
      </div>
      <div>
        <p className="stat-value">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      {accent && (
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full" style={{ width: accent }} />
        </div>
      )}
    </motion.div>
  )
}

function TxRow({ tx }: { tx: typeof recentTx[0] }) {
  return (
    <tr className="data-table-row group">
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${tx.bg}`}>
            {tx.initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{tx.entity}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{tx.id}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 hidden md:table-cell">
        <span className="badge-gray text-xs">{tx.cat}</span>
      </td>
      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-gray-400">{tx.date}</td>
      <td className="py-3.5 px-4 hidden sm:table-cell">
        <span className={tx.status === 'Completed' ? 'badge-success' : 'badge-warning'}>
          {tx.status === 'Completed' ? <CheckCircle2 size={11}/> : <Clock size={11}/>} {tx.status}
        </span>
      </td>
      <td className="py-3.5 px-5 text-right font-mono font-semibold tabular-nums">
        <span className={tx.pos ? 'text-success-dark' : 'text-gray-900'}>
          {tx.pos ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </td>
    </tr>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="text-gray-500">{p.name}</span>
          <span className="font-semibold" style={{ color: p.color }}>
            ${p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Tasks ── */
const initTasks = [
  { id: 1, text: 'Approve Q3 Tax Filing',                  tag: 'Accounting', priority: 'HIGH',   done: false },
  { id: 2, text: 'Review invoice #8812 for Acme Corp',      tag: 'Invoicing',  priority: 'MEDIUM', done: false },
  { id: 3, text: 'Reconcile 14 travel expenses',            tag: 'Expenses',   priority: 'MEDIUM', done: false },
  { id: 4, text: 'Set spend limit for Marketing Card',      tag: 'Cards',      priority: 'LOW',    done: false },
]

const priorityChip: Record<string, string> = {
  HIGH:   'badge-danger',
  MEDIUM: 'badge-warning',
  LOW:    'badge-gray',
}

/* ─────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { items: accounts, loading: accountsLoading, error: accountsError } = useSelector((state: RootState) => state.accounts)
  const [tasks, setTasks] = useState(initTasks)

  useEffect(() => {
    // Initial fetch
    dispatch(fetchAccounts())

    // Poll every 30 seconds for real-time updates
    const interval = setInterval(() => {
      dispatch(fetchAccounts())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  // Calculate total balance for 'checking' accounts
  const checkingBalance = accounts.reduce((sum, acc) => {
    const type = (acc.accountType || (acc as any).type || '').toLowerCase()
    const bal = acc.balance || (acc as any).amount || 0
    if (type === 'checking') {
      return sum + Number(bal)
    }
    return sum
  }, 0)

  if (accounts.length > 0) {
    console.log('Calculating balance from accounts:', accounts)
    console.log('Final checking balance:', checkingBalance)
  }

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(checkingBalance)

  const formattedProjected = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(checkingBalance * 1000)

  const toggle = (id: number) =>
    setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task))

  const pending = tasks.filter(t => !t.done).length

  return (
    <div className="space-y-7">

      {/* ── Page Header ── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back, {user?.companyName || 'Aureon'} — here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/invoicing" className="btn-primary gap-2">
            <Plus size={15}/> New Invoice
          </Link>
        </div>
      </motion.div>

      {/* ── 3-Column Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard 
          i={1} 
          label="Main Balance" 
          value={accountsLoading ? '...' : formattedBalance} 
          change="Updated live" 
          changePos 
          sub="Total of checking accounts" 
        />
        <StatCard i={3} label="Projected Cash Flow" value={accountsLoading ? '...' : formattedProjected} change="12.5% vs last Q" changePos sub="Forecast for Q4 2023" />
      </div>

      {/* ── Main 2-col content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Cash Flow Chart (2/3) ── */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="section-title">Cash Flow</p>
              <p className="text-xs text-gray-400 mt-0.5">Revenue vs Operating Expenses — last 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-3 h-1.5 rounded bg-primary-500 inline-block"/> Revenue</span>
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-3 h-1.5 rounded bg-gray-200 inline-block"/> Expenses</span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top: 2, right: 2, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} dy={8}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `$${v/1000}k`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="in"  name="Revenue"  stroke="#2563EB" strokeWidth={2} fill="url(#gradIn)"  dot={false} activeDot={{ r: 4, fill: '#2563EB' }}/>
                <Area type="monotone" dataKey="out" name="Expenses" stroke="#94A3B8" strokeWidth={2} fill="url(#gradOut)" dot={false} activeDot={{ r: 4, fill: '#94A3B8' }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Tasks (1/3) ── */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <p className="section-title">Pending Tasks</p>
            <span className="badge-warning text-xs">{pending} open</span>
          </div>
          <div className="space-y-3 flex-1">
            {tasks.map(t => (
              <div
                key={t.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${
                  t.done ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-gray-100 hover:border-primary-200 hover:bg-primary-50/30'
                }`}
                onClick={() => toggle(t.id)}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {t.done
                    ? <CheckCircle2 size={16} className="text-success"/>
                    : <Square size={16} className="text-gray-300 group-hover:text-primary-400 transition-colors"/>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight mb-1.5 ${t.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {t.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="badge-gray text-2xs">{t.tag}</span>
                    <span className={`${priorityChip[t.priority]} text-2xs`}>{t.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-ghost w-full mt-4 text-sm text-gray-500">
            View all tasks <ChevronRight size={14}/>
          </button>
        </motion.div>
      </div>

      {/* ── Invoicing Panel + Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Invoicing stats (1/3) */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="card p-6 flex flex-col gap-5">
          <p className="section-title">Invoicing & Revenue</p>
          <div className="space-y-4">
            {[
              { label: 'Recurring Revenue',   value: '$28,400', sub: '42 active subscriptions' },
              { label: 'One-time Invoices',    value: '$9,120',  sub: '12 active invoices' },
              { label: 'Customer Catalog',     value: '156',     sub: 'Total customers' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{row.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{row.sub}</p>
                </div>
                <p className="text-base font-bold text-gray-900 font-mono">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2.5">
              <span>Collection Progress</span>
              <span className="text-primary-600">82%</span>
            </div>
            <div className="progress-track">
              <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }} className="progress-fill bg-primary-500"/>
            </div>
            <p className="text-xs text-gray-400 mt-2">On track to meet Q4 recovery targets.</p>
          </div>
        </motion.div>

        {/* Corporate Cards (2/3) */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-title">Corporate Cards</p>
              <p className="text-xs text-gray-400 mt-0.5">Virtual & physical spend management</p>
            </div>
            <Link to="/dashboard/cards" className="btn-ghost text-xs gap-1">
              Manage <ChevronRight size={13}/>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { name: user?.companyName || 'Aureon', mask: '8812', spend: 12405, limit: 50000, color: 'from-primary-700 to-primary-900' },
              { name: 'Marketing Dept', mask: '0092', spend: 4200, limit: 15000, color: 'from-gray-800 to-gray-950' },
            ].map(card => (
              <div key={card.mask} className={`rounded-2xl bg-gradient-to-br ${card.color} text-white p-5 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-10 -mt-10"/>
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Corporate</span>
                    <span className="font-mono text-xs text-white/60">···· {card.mask}</span>
                  </div>
                  <p className="text-lg font-bold mb-0.5">{card.name}</p>
                  <p className="text-xs text-white/50">${card.spend.toLocaleString()} / ${(card.limit/1000).toFixed(0)}k limit</p>
                  <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/70 rounded-full" style={{ width: `${(card.spend/card.limit)*100}%` }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
            <Plus size={15}/> Issue New Card
          </button>
        </motion.div>
      </div>

      {/* ── Transaction Ledger ── */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <p className="section-title">Recent Transactions</p>
            <p className="text-xs text-gray-400 mt-0.5">All accounts · last 7 days</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs gap-1.5 py-1.5 px-3">
              <Filter size={13}/> Filter
            </button>
            <Link to="/dashboard/transactions" className="btn-ghost text-xs gap-1">
              View all <ChevronRight size={13}/>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="py-3 px-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="py-3 px-5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTx.map(tx => <TxRow key={tx.id} tx={tx}/>)}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <span className="text-xs text-gray-400">Showing 5 of 24,192 transactions</span>
          <Link to="/dashboard/transactions" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Full Ledger <ArrowRight size={13}/>
          </Link>
        </div>
      </motion.div>

    </div>
  )
}
