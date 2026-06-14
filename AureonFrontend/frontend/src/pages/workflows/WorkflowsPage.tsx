import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Zap, RefreshCw, DollarSign, Clock, Play, Pause } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } })
}

const initWorkflows = [
  { id: '1', name: 'Revenue → Savings Transfer',  trigger: 'Balance > $50,000',   action: 'Transfer $10,000 to Savings',    active: true,  runs: 12, lastRun: '25 Mar' },
  { id: '2', name: 'Payroll Funding Automation',  trigger: '1st of every month',   action: 'Move $28,000 to Payroll Acct',   active: true,  runs: 3,  lastRun: '01 Mar' },
  { id: '3', name: 'Low Balance Alert Transfer',  trigger: 'Balance < $5,000',     action: 'Transfer $15,000 from Savings',  active: false, runs: 2,  lastRun: '10 Feb' },
  { id: '4', name: 'Weekly Invoice Reminder',     trigger: 'Every Monday 9AM',     action: 'Send overdue invoice reminders', active: true,  runs: 8,  lastRun: '24 Mar' },
]

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(initWorkflows)

  const toggle = (id: string) => {
    setWorkflows(wfs => wfs.map(wf => {
      if (wf.id !== id) return wf
      const next = !wf.active
      toast.success(`Workflow ${next ? 'activated' : 'paused'}`)
      return { ...wf, active: next }
    }))
  }

  const active = workflows.filter(w => w.active).length
  const totalRuns = workflows.reduce((a, w) => a + w.runs, 0)

  return (
    <div className="space-y-7">

      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Automated Workflows</h1>
          <p className="page-subtitle">Set trigger-based rules to automate your financial operations.</p>
        </div>
        <button
          className="btn-primary gap-2"
          onClick={() => toast('Workflow builder coming soon!', { icon: '⚡' })}
        >
          <Plus size={15}/> New Workflow
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Active Workflows', value: String(active), icon: Zap,         color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Total Runs',       value: String(totalRuns), icon: RefreshCw, color: 'text-success-dark', bg: 'bg-success-light' },
          { label: 'Money Automated',  value: '$310K',          icon: DollarSign, color: 'text-warning-dark', bg: 'bg-warning-light' },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible" className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <s.icon size={20} className={s.color}/>
            </div>
            <div>
              <p className="stat-label">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 font-mono mt-0.5">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Workflow cards */}
      <div className="space-y-3">
        {workflows.map((wf, i) => (
          <motion.div
            key={wf.id}
            custom={i + 4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={`card p-5 flex items-center gap-4 transition-all ${!wf.active ? 'opacity-60 hover:opacity-80' : 'hover:shadow-md'}`}
          >
            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              wf.active ? 'bg-primary-50 border border-primary-100' : 'bg-gray-100'
            }`}>
              <Zap size={19} className={wf.active ? 'text-primary-600' : 'text-gray-400'}/>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <p className="font-semibold text-gray-900 text-sm truncate">{wf.name}</p>
                <span className={wf.active ? 'badge-success text-xs flex-shrink-0' : 'badge-warning text-xs flex-shrink-0'}>
                  {wf.active ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Zap size={11} className="text-warning"/> Trigger: {wf.trigger}</span>
                <span className="text-gray-300 hidden sm:block">→</span>
                <span className="truncate hidden sm:block">{wf.action}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="hidden md:flex flex-col items-end gap-1 text-xs text-gray-400 flex-shrink-0">
              <span className="flex items-center gap-1"><RefreshCw size={11}/> {wf.runs} runs</span>
              <span className="flex items-center gap-1"><Clock size={11}/> {wf.lastRun}</span>
            </div>

            {/* Toggle */}
            <button
              onClick={() => toggle(wf.id)}
              title={wf.active ? 'Pause workflow' : 'Activate workflow'}
              className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                wf.active ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                wf.active ? 'right-0.5' : 'left-0.5'
              }`}/>
            </button>

            {/* Play/Pause icon */}
            <button
              onClick={() => toggle(wf.id)}
              className="btn-icon flex-shrink-0 hidden sm:flex"
              title={wf.active ? 'Pause' : 'Activate'}
            >
              {wf.active ? <Pause size={15}/> : <Play size={15}/>}
            </button>
          </motion.div>
        ))}
      </div>

      {/* CTA Banner */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible"
        className="card p-6 border border-dashed border-primary-200 bg-primary-50/40 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
          <Zap size={22} className="text-white" fill="currentColor"/>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Build a New Automation</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
          Create trigger-based rules to automate transfers, invoicing reminders, and more — without writing a single line of code.
        </p>
        <button
          onClick={() => toast('Workflow builder coming soon!', { icon: '⚡' })}
          className="btn-primary gap-2"
        >
          <Plus size={15}/> Create Workflow
        </button>
      </motion.div>
    </div>
  )
}
