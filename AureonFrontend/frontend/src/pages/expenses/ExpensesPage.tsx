import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, X, Upload, TrendingDown, AlertCircle, CheckCircle, Loader2, Building2, Tag, Globe, FileText, Link as LinkIcon, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axiosInstance'
import { AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } })
}

const allExpenses = [
  { id: '1', desc: 'Google Ads Campaign',    amount: 3200,  cat: 'MARKETING',     status: 'APPROVED', date: '24 Mar', submitter: 'Abhay Sharma', initial: 'S', bg: 'bg-indigo-100 text-indigo-700' },
  { id: '2', desc: 'Team Offsite — Goa',     amount: 5800,  cat: 'TRAVEL',        status: 'PENDING',  date: '22 Mar', submitter: 'Mark T.',       initial: 'M', bg: 'bg-emerald-100 text-emerald-700' },
  { id: '3', desc: 'Slack Pro Subscription', amount: 240,   cat: 'SUBSCRIPTIONS', status: 'APPROVED', date: '21 Mar', submitter: 'IT Dept',     initial: 'I', bg: 'bg-blue-100 text-blue-700' },
  { id: '4', desc: 'Office Supplies',        amount: 890,   cat: 'OFFICE',        status: 'REJECTED', date: '19 Mar', submitter: 'Elena R.',      initial: 'E', bg: 'bg-rose-100 text-rose-700' },
  { id: '5', desc: 'AWS Infrastructure',     amount: 1240,  cat: 'SUBSCRIPTIONS', status: 'PENDING',  date: '17 Mar', submitter: 'DevOps',      initial: 'D', bg: 'bg-orange-100 text-orange-700' },
]

const catBadge: Record<string, string> = {
  MARKETING:     'badge-primary',
  TRAVEL:        'badge-warning',
  SUBSCRIPTIONS: 'badge-info',
  OFFICE:        'badge-success',
  PAYROLL:       'badge-danger',
}

const statusConfig = {
  APPROVED: { cls: 'badge-success', icon: CheckCircle,  label: 'Approved' },
  PENDING:  { cls: 'badge-warning', icon: AlertCircle,  label: 'Pending'  },
  REJECTED: { cls: 'badge-danger',  icon: X,            label: 'Rejected' },
}

export default function ExpensesPage() {
  const [filter, setFilter] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    currency: 'USD',
    merchantName: '',
    category: 'MARKETING',
    description: '',
    receiptUrl: '',
    reimbursable: false
  })

  const filtered = filter === 'ALL'
    ? allExpenses
    : allExpenses.filter(e => e.status === filter)

  const totalPending  = allExpenses.filter(e => e.status === 'PENDING').reduce((a, e) => a + e.amount, 0)
  const totalApproved = allExpenses.filter(e => e.status === 'APPROVED').reduce((a, e) => a + e.amount, 0)
  const totalAll      = allExpenses.reduce((a, e) => a + e.amount, 0)

  return (
    <div className="space-y-7">

      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track, approve, and categorize team expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary gap-2"><Upload size={15}/> Upload Receipt</button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary gap-2"
          >
            <Plus size={15}/> Add Expense
          </button>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Pending Approval',    value: `$${totalPending.toLocaleString()}`,  count: allExpenses.filter(e => e.status === 'PENDING').length,  color: 'text-warning-dark',  icon: AlertCircle,  bg: 'bg-warning-light' },
          { label: 'Approved This Month', value: `$${totalApproved.toLocaleString()}`, count: allExpenses.filter(e => e.status === 'APPROVED').length, color: 'text-success-dark',  icon: CheckCircle, bg: 'bg-success-light' },
          { label: 'Total Spend',         value: `$${totalAll.toLocaleString()}`,       count: allExpenses.length,                                        color: 'text-primary-600', icon: TrendingDown, bg: 'bg-primary-50'   },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible" className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label mb-2">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.count} expenses</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={18} className={s.color}/>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table card */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="section-title">Expense List</p>
          {/* Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/40">
                {['Description', 'Category', 'Submitted by', 'Date', 'Status', 'Amount', 'Actions'].map(h => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${h === 'Amount' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(e => {
                const st = statusConfig[e.status as keyof typeof statusConfig]
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-900">{e.desc}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`${catBadge[e.cat] ?? 'badge-gray'} text-xs`}>{e.cat}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-2xs ${e.bg}`}>
                          {e.initial}
                        </div>
                        {e.submitter}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs font-mono">{e.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`${st.cls} text-xs`}><st.icon size={11}/> {st.label}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                      ${e.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {e.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toast.success('Expense approved!')}
                            className="w-7 h-7 rounded-lg bg-success-light text-success-dark hover:bg-emerald-200 transition-colors flex items-center justify-center"
                          ><Check size={13}/></button>
                          <button
                            onClick={() => toast.error('Expense rejected')}
                            className="w-7 h-7 rounded-lg bg-danger-light text-danger-dark hover:bg-red-200 transition-colors flex items-center justify-center"
                          ><X size={13}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-gray-300"/>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">No expenses found</p>
              <p className="text-xs text-gray-500 mb-4 max-w-xs">There are no expenses matching your current filters. Try adjusting your view or add a new expense.</p>
              <button className="btn-secondary text-xs py-1.5 px-3">Clear Filters</button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-backdrop">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0"/>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="modal-panel max-w-lg relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">New Expense</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Record a corporate spend or reimbursement request.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="btn-icon"><X size={20}/></button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6 flex-1">
                {/* Merchant & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label flex items-center gap-2"><Building2 size={13}/> Merchant Name</label>
                    <input 
                      type="text" 
                      required
                      value={expenseForm.merchantName}
                      onChange={(e) => setExpenseForm({...expenseForm, merchantName: e.target.value})}
                      placeholder="e.g. Amazon, Uber, Slack" 
                      className="form-input" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label flex items-center gap-2"><Tag size={13}/> Category</label>
                    <select 
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                      className="form-select"
                    >
                      <option value="MARKETING">Marketing & Advertising</option>
                      <option value="TRAVEL">Travel & Logistics</option>
                      <option value="SUBSCRIPTIONS">Software & Subscriptions</option>
                      <option value="OFFICE">Office Supplies</option>
                      <option value="PAYROLL">Payroll & Benefits</option>
                      <option value="OTHER">Other Expenses</option>
                    </select>
                  </div>
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="form-label flex items-center gap-2"><DollarSign size={13}/> Amount</label>
                    <input 
                      type="number" 
                      required
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      placeholder="0.00" 
                      className="form-input" 
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="form-label flex items-center gap-2"><Globe size={13}/> Currency</label>
                    <select 
                      value={expenseForm.currency}
                      onChange={(e) => setExpenseForm({...expenseForm, currency: e.target.value})}
                      className="form-select"
                    >
                      <option value="USD">USD — Dollar</option>
                      <option value="INR">INR — Rupee</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="form-label flex items-center gap-2"><FileText size={13}/> Description</label>
                  <textarea 
                    rows={2}
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    placeholder="What was this expense for?" 
                    className="form-input resize-none" 
                  />
                </div>

                {/* Receipt URL */}
                <div>
                  <label className="form-label flex items-center gap-2"><LinkIcon size={13}/> Receipt URL</label>
                  <input 
                    type="url" 
                    value={expenseForm.receiptUrl}
                    onChange={(e) => setExpenseForm({...expenseForm, receiptUrl: e.target.value})}
                    placeholder="https://link-to-receipt.com" 
                    className="form-input" 
                  />
                </div>

                {/* Reimbursable Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-gray-900">Reimbursable</p>
                    <p className="text-xs text-gray-500">Should this be paid back to the submitter?</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setExpenseForm({...expenseForm, reimbursable: !expenseForm.reimbursable})}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${expenseForm.reimbursable ? 'bg-primary-600' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${expenseForm.reimbursable ? 'left-7' : 'left-1'}`}/>
                  </button>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0 rounded-b-2xl">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={async () => {
                    if (!expenseForm.amount || !expenseForm.merchantName) {
                      toast.error('Amount and Merchant are required')
                      return
                    }
                    setIsSubmitting(true)
                    try {
                      const payload = {
                        ...expenseForm,
                        amount: Number(expenseForm.amount)
                      }
                      
                      let res;
                      try {
                        res = await api.post('/expenses', payload)
                      } catch (err: any) {
                        if (err.response?.status === 403) {
                          res = await api.post('/user/expenses', payload)
                        } else {
                          throw err
                        }
                      }
                      toast.success('✅ Expense Added Successfully!')
                      setShowAddModal(false)
                      // Reset form
                      setExpenseForm({
                        amount: '',
                        currency: 'USD',
                        merchantName: '',
                        category: 'MARKETING',
                        description: '',
                        receiptUrl: '',
                        reimbursable: false
                      })
                    } catch (err: any) {
                      console.error('Failed to add expense:', err)
                      toast.error(`❌ Error: ${err.response?.data?.message || err.message}`)
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                  disabled={isSubmitting}
                  className="btn-primary px-8 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
