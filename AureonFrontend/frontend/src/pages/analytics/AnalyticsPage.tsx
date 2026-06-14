import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Users, ArrowUpRight, Download } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts'

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } })
}

const revenueData = [
  { month: 'Jan', revenue: 28000, expenses: 14000 },
  { month: 'Feb', revenue: 32000, expenses: 16000 },
  { month: 'Mar', revenue: 29000, expenses: 18000 },
  { month: 'Apr', revenue: 38000, expenses: 19000 },
  { month: 'May', revenue: 44000, expenses: 21000 },
  { month: 'Jun', revenue: 41000, expenses: 20000 },
  { month: 'Jul', revenue: 52000, expenses: 23000 },
  { month: 'Aug', revenue: 58000, expenses: 25000 },
  { month: 'Sep', revenue: 63000, expenses: 27000 },
  { month: 'Oct', revenue: 72000, expenses: 29000 },
]

const categoryData = [
  { name: 'SaaS',      value: 4500, color: '#2563EB' },
  { name: 'Payroll',   value: 18000, color: '#06B6D4' },
  { name: 'Marketing', value: 2800,  color: '#10B981' },
  { name: 'Travel',    value: 1200,  color: '#F59E0B' },
  { name: 'Office',    value: 900,   color: '#EF4444' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="text-gray-400">{p.name}</span>
          <span className="font-bold" style={{ color: p.color }}>${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const stats = [
    { label: 'Total Revenue',    value: '$461,000', change: '+18.2%', up: true,  icon: TrendingUp },
    { label: 'Total Expenses',   value: '$212,000', change: '+6.4%',  up: false, icon: TrendingDown },
    { label: 'Net Income',       value: '$249,000', change: '+29.1%', up: true,  icon: BarChart3 },
    { label: 'Active Customers', value: '856',       change: '+42',    up: true,  icon: Users },
  ]

  return (
    <div className="space-y-7">

      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Financial performance insights · YTD 2023</p>
        </div>
        <button className="btn-secondary gap-2"><Download size={15}/> Export Report</button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible" className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.up ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>
                <s.icon size={17}/>
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? 'text-success-dark' : 'text-danger-dark'}`}>
                <ArrowUpRight size={13} className={s.up ? '' : 'rotate-90'}/> {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 font-mono">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-title">Revenue vs Expenses</p>
            <p className="text-xs text-gray-400 mt-0.5">Jan–Oct 2023 · Monthly breakdown</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-primary-500 inline-block"/> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-gray-200 inline-block"/> Expenses</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" vertical={false}/>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `$${v/1000}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#2563EB" strokeWidth={2} fill="url(#gRev)" dot={false} activeDot={{ r: 4 }}/>
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#94A3B8" strokeWidth={2} fill="url(#gExp)" dot={false} activeDot={{ r: 4 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Category Pie */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="card p-6">
          <p className="section-title mb-5">Expense Categories</p>
          <div className="flex items-center gap-6">
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {categoryData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 flex-shrink-0">
              {categoryData.map(c => (
                <div key={c.name} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }}/>
                  <span className="text-sm text-gray-600 font-medium w-20">{c.name}</span>
                  <span className="text-sm font-bold text-gray-900 font-mono">${c.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Monthly bars */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="card p-6">
          <p className="section-title mb-5">Monthly Net Income</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.map(d => ({ ...d, net: d.revenue - d.expenses }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={22}>
                <CartesianGrid stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `$${v/1000}k`}/>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}/>
                <Bar dataKey="net" name="Net Income" fill="#2563EB" radius={[4, 4, 0, 0]} opacity={0.9}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
