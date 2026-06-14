import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertCircle, Clock, CheckCircle2, MoreHorizontal, Search, Edit2, Zap, X, ArrowRight, ChevronRight, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '@/api/axiosInstance'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } })
}

const chartData = [
  { day: '01', amt: 12000 }, { day: '05', amt: 18000 }, { day: '10', amt: 15000 },
  { day: '15', amt: 35000 }, { day: '20', amt: 22000 }, { day: '25', amt: 48000 },
  { day: '30', amt: 31000 },
]

const invoices = [
  { id: 'INV-2024-001', client: 'Starlight Labs, Inc.',  amount: 12400,  status: 'PAID',    due: 'Apr 15' },
  { id: 'INV-2024-002', client: 'Aperture Science',       amount: 8920,   status: 'DRAFT',   due: 'May 1'  },
  { id: 'INV-2024-003', client: 'Wayne Enterprises',      amount: 45000,  status: 'OVERDUE', due: 'Mar 28' },
  { id: 'INV-2024-004', client: 'Globex Corporation',     amount: 3200,   status: 'SENT',    due: 'May 10' },
]

const directory = [
  { name: 'Abhay Sharma',      email: 'abhay@starlight.io',  avatar: 41 },
  { name: 'Mark Thompson',   email: 'mark@aperture.com',   avatar: 53 },
  { name: 'Jack Dorsey',     email: 'jack@block.xyz',      avatar: 12 },
]

const catalog = [
  { n: 'Platform License',   price: '$45,000 / yr', d: 'Annual enterprise license for core banking infrastructure.' },
  { n: 'Cloud Hosting',      price: '$1,200 / mo',  d: 'Dedicated HA clusters with 99.99% uptime SLA.' },
  { n: 'Consultancy',        price: '$350 / hr',    d: 'On-site technical implementation & advisory.' },
]

const statusConfig = {
  PAID:    { label: 'Paid',    cls: 'badge-success', icon: CheckCircle2 },
  DRAFT:   { label: 'Draft',   cls: 'badge-gray',    icon: Edit2 },
  OVERDUE: { label: 'Overdue', cls: 'badge-danger',  icon: AlertCircle },
  SENT:    { label: 'Sent',    cls: 'badge-info',    icon: Clock },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-500 mb-1">Day {label}</p>
      <p className="font-bold text-gray-900">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export default function InvoicesPage() {
  const [revenueTab, setRevenueTab]         = useState('30D')
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  const [invoiceForm, setInvoiceForm] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    lineItems: [{ description: '', quantity: 1, price: 0 }],
    subtotal: 0,
    taxRate: 0,
    totalAmount: 0,
    currency: 'USD',
    dueDate: '',
    notes: ''
  })

  const handleSaveInvoice = async (status: 'DRAFT' | 'SENT') => {
    if (!invoiceForm.clientName || !invoiceForm.dueDate) {
      alert('Client Name and Due Date are required.')
      return
    }

    const isDraft = status === 'DRAFT'
    if (isDraft) setIsSavingDraft(true)
    else setIsSubmitting(true)

    try {
      // Calculate totals before sending
      const subtotal = invoiceForm.lineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)
      const totalAmount = subtotal * (1 + invoiceForm.taxRate / 100)

      const payload = {
        ...invoiceForm,
        status,
        subtotal,
        totalAmount
      }

      console.log(`Saving invoice as ${status}...`, payload)
      
      let res;
      try {
        res = await api.post('/invoices', payload)
      } catch (err: any) {
        if (err.response?.status === 403) {
          console.log('403 on /api/invoices, trying fallback /api/user/invoices...')
          res = await api.post('/user/invoices', payload)
        } else {
          throw err
        }
      }

      alert(`✅ Invoice ${isDraft ? 'Saved as Draft' : 'Sent'} Successfully!`)
      setShowCreateInvoice(false)
      
      // Reset form
      setInvoiceForm({
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        lineItems: [{ description: '', quantity: 1, price: 0 }],
        subtotal: 0,
        taxRate: 0,
        totalAmount: 0,
        currency: 'USD',
        dueDate: '',
        notes: ''
      })
    } catch (err: any) {
      console.error('Failed to save invoice:', err)
      alert(`❌ Error: ${err.response?.data?.message || err.message}`)
    } finally {
      setIsSavingDraft(false)
      setIsSubmitting(false)
    }
  }

  const summary = [
    { label: 'Total Invoiced', value: '$428,950', change: '+8.4%', up: true },
    { label: 'Outstanding',    value: '$69,520',  change: '3 invoices', up: false },
    { label: 'Overdue',        value: '12',       change: 'Late payments', up: false },
  ]

  return (
    <div className="space-y-7">

      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Invoicing</h1>
          <p className="page-subtitle">Manage global receivables and automated billing cycles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCreateInvoice(true)} 
            className="btn-primary gap-2"
          >
            <Plus size={15}/> Create Invoice
          </button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {summary.map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible" className="card p-5">
            <p className="stat-label mb-3">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">{s.value}</p>
            <p className={`text-xs mt-1.5 font-medium ${s.up ? 'text-success-dark' : 'text-gray-400'}`}>{s.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Side Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="section-title">Projected Revenue</p>
              <p className="text-2xl font-bold text-gray-900 font-mono mt-1">$428,950.00</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
              {['30D', '90D', '1Y'].map(t => (
                <button
                  key={t}
                  onClick={() => setRevenueTab(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    revenueTab === t ? 'bg-white shadow-sm text-gray-900 border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
          <div className="h-48 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -8, bottom: 0 }} barSize={28}>
                <CartesianGrid stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} dy={8}/>
                <Tooltip content={<CustomTooltip/>} cursor={{ fill: 'rgba(37,99,235,0.04)', radius: 6 }}/>
                <Bar dataKey="amt" fill="#2563EB" radius={[5, 5, 0, 0]} opacity={0.9}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-5">
          <div className="card p-5 flex-1 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
              <Zap size={18} className="text-primary-600" fill="currentColor"/>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">142 Active</p>
            <p className="text-sm text-gray-500">Subscriptions processed monthly</p>
          </div>

          <div className="card p-5 flex-1 flex flex-col bg-gradient-to-br from-danger to-red-700 border-0 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-lg"/>
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-200 mb-2">
                <AlertCircle size={13}/> Late Payments
              </div>
              <p className="text-3xl font-bold mb-3">12</p>
              <button className="flex items-center gap-1 text-sm font-semibold text-red-100 hover:text-white transition-colors">
                Review <ArrowRight size={13}/>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Invoices Table + Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="section-title">Recent Invoices</p>
            <Link to="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {invoices.map(inv => {
              const st = statusConfig[inv.status as keyof typeof statusConfig]
              return (
                <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      inv.status === 'PAID' ? 'bg-success-light text-success-dark' :
                      inv.status === 'OVERDUE' ? 'bg-danger-light text-danger-dark' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      <st.icon size={16}/>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">{inv.client}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{inv.id} · Due {inv.due}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className={`${st.cls} text-xs`}><st.icon size={11}/> {st.label}</span>
                    <p className="font-mono font-semibold text-gray-900 text-sm">${inv.amount.toLocaleString()}</p>
                    <button className="text-gray-300 hover:text-gray-500 transition-colors"><MoreHorizontal size={16}/></button>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="card p-5">
          <p className="section-title mb-5">Client Directory</p>
          <div className="space-y-3 mb-5">
            {directory.map(d => (
              <div key={d.name} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/80?img=${d.avatar}`} alt={d.name} className="w-9 h-9 rounded-full border border-gray-100"/>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.email}</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors"/>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
            <Plus size={15}/> Add New Client
          </button>
        </motion.div>
      </div>

      {/* Service Catalog */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="section-title">Service Catalog</p>
            <p className="text-xs text-gray-400 mt-0.5">Defined units for lightning-fast invoice generation.</p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input type="text" placeholder="Filter products…" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {catalog.map(c => (
            <div key={c.n} className="border border-gray-100 rounded-xl p-5 hover:border-primary-200 hover:bg-primary-50/20 transition-all group cursor-pointer relative">
              <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 btn-icon transition-all">
                <Edit2 size={14}/>
              </button>
              <h4 className="font-semibold text-gray-900 mb-1.5 pr-8">{c.n}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{c.d}</p>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-2xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Rate</p>
                <p className="font-mono font-bold text-gray-900">{c.price}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Smart Billing Banner */}
      <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl bg-gradient-to-r from-primary-700 to-primary-900 p-8 md:p-10 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #06B6D4 0%, transparent 60%)' }}/>
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold mb-4">
            <Zap size={12} fill="currentColor"/> AUTO-PILOT ACTIVE
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Smart Recurring Billing</h2>
          <p className="text-primary-200 max-w-lg mb-8 text-sm leading-relaxed">
            AI-powered payment failure prediction with smart retries across 40+ global currencies. Your cash flow, automated.
          </p>
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-2xl font-bold font-mono">$125,400</p>
              <p className="text-xs text-primary-300 font-semibold uppercase tracking-wider mt-1">Next batch: April 1st</p>
            </div>
            <div className="w-px bg-white/15 hidden md:block"/>
            <div>
              <p className="text-2xl font-bold font-mono text-accent-300">98.4%</p>
              <p className="text-xs text-primary-300 font-semibold uppercase tracking-wider mt-1">Recovery rate</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showCreateInvoice && (
          <div className="modal-backdrop">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateInvoice(false)} className="absolute inset-0"/>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="modal-panel max-w-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create New Invoice</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Issue professional billing documents in seconds.</p>
                </div>
                <button onClick={() => setShowCreateInvoice(false)} className="btn-icon"><X size={20}/></button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 flex-1">
                {/* Client Info */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Client Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="form-label">Client Name</label>
                      <input 
                        type="text" 
                        value={invoiceForm.clientName}
                        onChange={(e) => setInvoiceForm({...invoiceForm, clientName: e.target.value})}
                        placeholder="Company legal name" 
                        className="form-input" 
                      />
                    </div>
                    <div>
                      <label className="form-label">Client Email</label>
                      <input 
                        type="email" 
                        value={invoiceForm.clientEmail}
                        onChange={(e) => setInvoiceForm({...invoiceForm, clientEmail: e.target.value})}
                        placeholder="billing@client.com" 
                        className="form-input" 
                      />
                    </div>
                    <div>
                      <label className="form-label">Currency</label>
                      <select 
                        value={invoiceForm.currency}
                        onChange={(e) => setInvoiceForm({...invoiceForm, currency: e.target.value})}
                        className="form-select"
                      >
                        <option value="USD">USD — US Dollar</option>
                        <option value="INR">INR — Indian Rupee</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="form-label">Client Address</label>
                      <textarea 
                        rows={2} 
                        value={invoiceForm.clientAddress}
                        onChange={(e) => setInvoiceForm({...invoiceForm, clientAddress: e.target.value})}
                        placeholder="Full billing address" 
                        className="form-input resize-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {invoiceForm.lineItems.length}/15
                    </span>
                  </div>
                  <div className="space-y-3">
                    {invoiceForm.lineItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 group">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={item.description}
                            onChange={(e) => {
                              const newList = [...invoiceForm.lineItems]
                              newList[idx].description = e.target.value
                              setInvoiceForm({...invoiceForm, lineItems: newList})
                            }}
                            placeholder="Description" 
                            className="form-input text-sm" 
                          />
                        </div>
                        <div className="w-20">
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => {
                              const newList = [...invoiceForm.lineItems]
                              newList[idx].quantity = Number(e.target.value)
                              setInvoiceForm({...invoiceForm, lineItems: newList})
                            }}
                            placeholder="Qty" 
                            className="form-input text-sm text-center" 
                          />
                        </div>
                        <div className="w-32">
                          <input 
                            type="number" 
                            value={item.price}
                            onChange={(e) => {
                              const newList = [...invoiceForm.lineItems]
                              newList[idx].price = Number(e.target.value)
                              setInvoiceForm({...invoiceForm, lineItems: newList})
                            }}
                            placeholder="Price" 
                            className="form-input text-sm text-right" 
                          />
                        </div>
                        {invoiceForm.lineItems.length > 1 && (
                          <button 
                            onClick={() => {
                              const newList = invoiceForm.lineItems.filter((_, i) => i !== idx)
                              setInvoiceForm({...invoiceForm, lineItems: newList})
                            }}
                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <X size={16}/>
                          </button>
                        )}
                      </div>
                    ))}
                    {invoiceForm.lineItems.length < 15 && (
                      <button 
                        onClick={() => setInvoiceForm({...invoiceForm, lineItems: [...invoiceForm.lineItems, { description: '', quantity: 1, price: 0 }]})}
                        className="w-full py-2 border-2 border-dashed border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50/50 transition-all"
                      >
                        + Add Item
                      </button>
                    )}
                  </div>
                </div>

                {/* Totals & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Due Date</label>
                      <input 
                        type="date" 
                        value={invoiceForm.dueDate}
                        onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                        className="form-input" 
                      />
                    </div>
                    <div>
                      <label className="form-label">Internal Notes / Payment Instructions</label>
                      <textarea 
                        rows={3} 
                        value={invoiceForm.notes}
                        onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                        placeholder="Bank details or terms..." 
                        className="form-input resize-none text-xs" 
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50/50 rounded-2xl p-6 space-y-4 border border-gray-100 h-fit">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Subtotal</span>
                      <span className="text-gray-900 font-bold font-mono">
                        {invoiceForm.lineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Tax Rate (%)</span>
                      <input 
                        type="number" 
                        value={invoiceForm.taxRate}
                        onChange={(e) => setInvoiceForm({...invoiceForm, taxRate: Number(e.target.value)})}
                        className="w-16 bg-white border border-gray-200 rounded-md py-1 px-2 text-right text-xs font-bold" 
                      />
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                      <span className="text-2xl font-black text-primary-600 font-mono">
                        {invoiceForm.currency === 'USD' ? '$' : invoiceForm.currency === 'INR' ? '₹' : '€'}
                        {(invoiceForm.lineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0) * (1 + invoiceForm.taxRate/100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0 rounded-b-2xl">
                <button 
                  onClick={() => setShowCreateInvoice(false)} 
                  disabled={isSavingDraft || isSubmitting}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
                >
                  Discard Draft
                </button>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSaveInvoice('DRAFT')} 
                    disabled={isSavingDraft || isSubmitting}
                    className="btn-secondary px-6 flex items-center gap-2"
                  >
                    {isSavingDraft ? <Loader2 size={14} className="animate-spin" /> : null}
                    Save as Draft
                  </button>
                  <button 
                    onClick={() => handleSaveInvoice('SENT')} 
                    disabled={isSavingDraft || isSubmitting}
                    className="btn-primary px-8 flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    Send Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
