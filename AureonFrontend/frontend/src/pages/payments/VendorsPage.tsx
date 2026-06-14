import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Search, 
  Plus, 
  MoreHorizontal, 
  ArrowLeft, 
  Loader2, 
  X, 
  Mail, 
  Globe, 
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axiosInstance'

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  })
}

export default function VendorsPage() {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState<any[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    paymentMethod: 'ach',
    currency: 'USD',
    address: '',
    notes: ''
  })

  const fetchVendors = async () => {
    try {
      let res;
      try {
        res = await api.get('/vendors')
      } catch (err: any) {
        if (err.response?.status === 403) {
          res = await api.get('/user/vendors')
        } else {
          throw err
        }
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      setVendors(data)
    } catch (err) {
      console.error('Failed to fetch vendors:', err)
    }
  }

  useEffect(() => {
    fetchVendors()
    const interval = setInterval(fetchVendors, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.accountNumber) return
    setIsAdding(true)
    try {
      try {
        await api.post('/vendors', form)
      } catch (err: any) {
        if (err.response?.status === 403) {
          await api.post('/user/vendors', form)
        } else {
          throw err
        }
      }
      setIsAddModalOpen(false)
      setForm({
        name: '',
        email: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        paymentMethod: 'ach',
        currency: 'USD',
        address: '',
        notes: ''
      })
      fetchVendors()
    } catch (err) {
      console.error('Failed to add vendor:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteVendor = async (vendorId: string) => {
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) return;
    
    setIsDeleting(vendorId)
    try {
      // 1. Mandatory fresh fetch to verify existence and get latest ID
      console.log('Verifying vendor existence before deletion...')
      let listRes;
      try {
        listRes = await api.get('/vendors')
      } catch (err: any) {
        if (err.response?.status === 403) {
          listRes = await api.get('/user/vendors')
        } else {
          throw err
        }
      }
      
      const list = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data || [])
      const exists = list.find((v: any) => String(v.id || v.vendorId) === String(vendorId))
      
      if (!exists) {
        throw new Error('Vendor not found or already deleted.')
      }

      // 2. Perform deletion
      console.log(`Deleting vendor ${vendorId}...`)
      try {
        await api.delete(`/vendors/${vendorId}`)
      } catch (err: any) {
        if (err.response?.status === 403) {
          console.log('403 on /api/vendors, trying fallback /api/user/vendors...')
          await api.delete(`/user/vendors/${vendorId}`)
        } else {
          throw err
        }
      }

      alert('✅ Vendor deleted successfully.')
      fetchVendors()
    } catch (err: any) {
      console.error('Delete failed:', err)
      alert(`❌ Error: ${err.response?.data?.message || err.message}`)
    } finally {
      setIsDeleting(null)
      setActiveMenu(null)
    }
  }

  const filteredVendors = (vendors || []).filter(v => 
    (v.name || v.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <button 
            onClick={() => navigate('/dashboard/payments')}
            className="flex items-center gap-2 text-sm font-semibold text-primary-600 mb-4 hover:gap-3 transition-all"
          >
            <ArrowLeft size={16} /> Back to Payments
          </button>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Vendor Management</h1>
          <p className="text-lg text-gray-500 max-w-2xl font-medium">Manage your corporate relationships, bank details, and recurring payment flows.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/5 transition-all w-full md:w-80 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary px-6 py-3.5 rounded-2xl shadow-lg shadow-primary-500/20 gap-2 whitespace-nowrap active:scale-95 transition-transform"
          >
            <Plus size={20} /> Add Vendor
          </button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {vendors === null ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-primary-600" size={40} />
            <p className="text-gray-400 font-medium animate-pulse">Synchronizing vendors...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white border-2 border-dashed border-gray-100 rounded-[2rem] p-20 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Building2 size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Vendors Found</h2>
            <p className="text-gray-500 max-w-sm mb-8">Start building your corporate network by adding your first vendor or service provider.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary px-8 py-3.5 rounded-xl gap-2"
            >
              <Plus size={20} /> Create New Vendor
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVendors.map((v, i) => {
              const name = v.name || v.vendorName || v.companyName || 'Unknown Vendor';
              const initials = name.split(' ').map((n: any) => n[0]).join('').toUpperCase().slice(0, 2);
              const colors = [
                'bg-emerald-50 text-emerald-600 border-emerald-100',
                'bg-primary-50 text-primary-600 border-primary-100',
                'bg-amber-50 text-amber-600 border-amber-100',
                'bg-rose-50 text-rose-600 border-rose-100',
                'bg-indigo-50 text-indigo-600 border-indigo-100'
              ];
              const colorClass = colors[i % colors.length];

              return (
                <motion.div 
                  key={v.id || i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i + 2}
                  className="card group hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl border-2 ${colorClass}`}>
                        {initials}
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === v.id ? null : v.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        
                        {activeMenu === v.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={() => handleDeleteVendor(v.id || v.vendorId)}
                              disabled={isDeleting === (v.id || v.vendorId)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                            >
                              {isDeleting === (v.id || v.vendorId) ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <X size={14} />
                              )}
                              Delete Vendor
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{name}</h3>
                    <p className="text-sm text-gray-400 font-medium mb-6 flex items-center gap-2">
                      <CreditCard size={14} /> 
                      {v.accountNumber ? `****${String(v.accountNumber).slice(-4)}` : 'No bank linked'}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                      {v.email && (
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Mail size={16} className="text-gray-300" />
                          <span className="truncate">{v.email}</span>
                        </div>
                      )}
                      {v.bankName && (
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Building2 size={16} className="text-gray-300" />
                          <span className="truncate">{v.bankName}</span>
                        </div>
                      )}
                      {v.address && (
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <MapPin size={16} className="text-gray-300" />
                          <span className="truncate">{v.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">View Transactions</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Add New Vendor</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Company or individual name"
                    className="form-input"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="vendor@example.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => setForm({...form, bankName: e.target.value})}
                    placeholder="e.g. Chase Bank"
                    className="form-input"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({...form, currency: e.target.value})}
                    className="form-select"
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="INR">INR — Indian Rupee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    required
                    value={form.accountNumber}
                    onChange={(e) => setForm({...form, accountNumber: e.target.value})}
                    placeholder="Account Number"
                    className="form-input font-mono"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Routing Number</label>
                  <input
                    type="text"
                    value={form.routingNumber}
                    onChange={(e) => setForm({...form, routingNumber: e.target.value})}
                    placeholder="9-digit routing"
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                  className="form-select"
                >
                  <option value="ach">ACH Transfer</option>
                  <option value="wire">Wire Transfer</option>
                  <option value="neft">NEFT / Local Bank</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div>
                <label className="form-label">Business Address</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
                  placeholder="Street, City, State, Zip"
                  className="form-input resize-none"
                />
              </div>

              <div>
                <label className="form-label">Internal Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="e.g. Primary cloud provider"
                  className="form-input"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-50 pt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="btn-primary px-8 py-2.5 rounded-xl text-sm gap-2"
                >
                  {isAdding ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Vendor
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
