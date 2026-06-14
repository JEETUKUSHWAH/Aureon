import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightLeft, Building2, Globe, Command, ChevronRight, CheckCircle2, Clock, AlertCircle, X, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchAccounts } from '@/store/slices/accountsSlice'
import { fetchPayments } from '@/store/slices/paymentsSlice'
import api from '@/api/axiosInstance'

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } })
}


const intlMethods = [
  { id: 'swift', name: 'SWIFT GPI',      sub: 'Instant settlement',  icon: Command },
  { id: 'wire',  name: 'Standard Wire',  sub: '1–2 Business days',   icon: Building2 },
  { id: 'usdc',  name: 'USDC Stable',    sub: 'On-chain direct',     icon: Globe },
]

const domesticMethods = [
  { id: 'ach',  name: 'ACH Transfer',   sub: '1–3 Business days',   icon: Building2 },
  { id: 'upi',  name: 'UPI Instant',    sub: 'Real-time settlement', icon: Command },
  { id: 'neft', name: 'NEFT Transfer',  sub: 'Same-day clearing',    icon: ArrowRightLeft },
]


const mockAccounts = [
  { accountId: '1', nickname: 'Main Operating', accountType: 'Checking', balance: 98450.75, accountNumber: '10000004821' },
  { accountId: '2', nickname: 'Reserve', accountType: 'Savings', balance: 44400.00, accountNumber: '10000007334' },
];

export default function PaymentsPage() {
  const navigate = useNavigate()
  const [intlMethod, setIntlMethod] = useState('swift')
  const [domMethod, setDomMethod] = useState('ach')
  const [paymentTab, setPaymentTab] = useState<'Domestic' | 'International'>('International')
  const dispatch = useDispatch<AppDispatch>()
  const { items: accounts } = useSelector((state: RootState) => state.accounts)
  const displayAccounts = accounts.length > 0 ? accounts : mockAccounts;
  
  useEffect(() => {
    dispatch(fetchAccounts())
    dispatch(fetchPayments())
  }, [dispatch])

  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isSendingInternational, setIsSendingInternational] = useState(false)
  
  const [apiVendors, setApiVendors] = useState<any[] | null>(null)
  
  useEffect(() => {
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
        setApiVendors(data)
      } catch (err) {
        console.error('Failed to fetch vendors:', err)
      }
    }

    fetchVendors()
    const interval = setInterval(fetchVendors, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)
  const [isAddingVendor, setIsAddingVendor] = useState(false)
  const [vendorForm, setVendorForm] = useState({
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

  const [formData, setFormData] = useState({
    fromAccount: '',
    upiId: '',
    counterpartyName: '',
    amount: '',
    memo: '',
    category: '',
    upiPin: ''
  })

  const [achForm, setAchForm] = useState({
    fromAccountId: '',
    counterpartyName: '',
    counterpartyAccount: '',
    counterpartyRouting: '',
    amount: '',
    sameDay: false,
    memo: '',
    category: ''
  })

  const [neftForm, setNeftForm] = useState({
    fromAccountId: '',
    counterpartyName: '',
    counterpartyAccount: '',
    ifscCode: '',
    amount: '',
    memo: '',
    category: ''
  })

  const [intlForm, setIntlForm] = useState({
    fromAccountId: '',
    counterpartyName: '',
    counterpartyAccount: '',
    amount: '',
    targetCurrency: 'USD',
    memo: ''
  })

  useEffect(() => {
    const firstId = displayAccounts[0]?.accountId || (displayAccounts[0] as any)?.id || (displayAccounts[0] as any)?._id || '';
    if (displayAccounts.length > 0) {
      if (!formData.fromAccount) setFormData(prev => ({ ...prev, fromAccount: firstId }))
      if (!intlForm.fromAccountId) setIntlForm(prev => ({ ...prev, fromAccountId: firstId }))
      if (!achForm.fromAccountId) setAchForm(prev => ({ ...prev, fromAccountId: firstId }))
      if (!neftForm.fromAccountId) setNeftForm(prev => ({ ...prev, fromAccountId: firstId }))
    }
  }, [displayAccounts])

  const handleInternationalPayment = async () => {
    if (!intlForm.amount || !intlForm.counterpartyName || !intlForm.counterpartyAccount || !intlForm.fromAccountId) return;
    setIsSendingInternational(true)
    try {
      // 1. Mandatory fresh fetch of accountId before sending
      console.log('Fetching fresh accountId from /api/accounts...')
      let accountsRes
      try {
        accountsRes = await api.get('/accounts')
      } catch (err: any) {
        if (err.response?.status === 403) {
          console.log('403 on /accounts, trying fallback /api/user/accounts...')
          accountsRes = await api.get('/user/accounts')
        } else {
          throw err
        }
      }
      const accountList = Array.isArray(accountsRes.data) ? accountsRes.data : (accountsRes.data?.data || []);

      // 2. Resolve the correct accountId from the list
      const selectedAccount = accountList.find((acc: any) =>
        String(acc.accountId) === String(intlForm.fromAccountId) ||
        String(acc.id) === String(intlForm.fromAccountId)
      );

      if (!selectedAccount) {
        throw new Error('The selected source account could not be verified. Please try again.');
      }

      const verifiedAccountId = selectedAccount.accountId || selectedAccount.id;

      // 3. Construct payload from form fields
      const payload = {
        fromAccountId: verifiedAccountId,
        counterpartyName: intlForm.counterpartyName,
        counterpartyAccount: intlForm.counterpartyAccount,
        amount: Number(intlForm.amount),
        targetCurrency: intlForm.targetCurrency,
        memo: intlForm.memo
      };

      console.log('Sending international payment with verified accountId:', payload);

      // 4. Call the international payment API
      const response = await api.post('/payments/international', payload);

      // 5. Success handling
      const res = response.data;
      alert(`✅ International Payment Sent!\n\nTransaction ID: ${res.transactionId || res.id || 'Pending'}\nAmount: ${intlForm.amount} (to ${intlForm.targetCurrency})\nStatus: ${res.status || 'Success'}`);

      // 6. Refresh and reset
      dispatch(fetchPayments());
      dispatch(fetchAccounts());
      setIntlForm(prev => ({
        ...prev,
        counterpartyName: '',
        counterpartyAccount: '',
        amount: '',
        memo: ''
      }));

    } catch (error: any) {
      console.error('International payment failed:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Payment failed. Please try again.';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsSendingInternational(false);
    }
  }

  const handleDomesticPayment = async () => {
    const isAch = domMethod === 'ach';
    const form = isAch ? achForm : neftForm;
    
    if (!form.amount || !form.counterpartyName || !form.counterpartyAccount || !form.fromAccountId) {
      alert('Please fill in all required fields.');
      return;
    }
    
    setIsTransferring(true);
    try {
      // 1. Mandatory fresh fetch of accountId before sending
      console.log(`Verifying accountId for ${isAch ? 'ACH' : 'NEFT'} transfer...`)
      let accRes;
      try {
        accRes = await api.get('/accounts');
      } catch (err: any) {
        if (err.response?.status === 403) {
          console.log('403 on /accounts, trying fallback /api/user/accounts...')
          accRes = await api.get('/user/accounts');
        } else {
          throw err;
        }
      }
      
      const accList = Array.isArray(accRes.data) ? accRes.data : (accRes.data?.data || []);
      const selected = accList.find((a: any) => 
        String(a.accountId) === String(form.fromAccountId) || 
        String(a.id) === String(form.fromAccountId)
      );
      
      if (!selected) throw new Error('The selected source account could not be verified. Please try again.');
      const verifiedId = selected.accountId || selected.id;

      // 2. Resolve endpoint and construct payload
      const endpoint = isAch ? '/payments/ach' : '/payments/neft';
      const payload = { 
        ...form, 
        fromAccountId: verifiedId, 
        amount: Number(form.amount) 
      };
      
      console.log(`Sending ${isAch ? 'ACH' : 'NEFT'} payment with verified accountId:`, payload);

      // 3. Post to backend
      const response = await api.post(endpoint, payload);
      const res = response.data;
      
      alert(`✅ ${isAch ? 'ACH' : 'NEFT'} Payment Sent Successfully!\n\nReference: ${res.transactionId || res.id || 'Confirmed'}\nAmount: ${isAch ? '$' : '₹'}${form.amount}`);
      
      // 4. Reset specific form
      if (isAch) {
        setAchForm(prev => ({ ...prev, counterpartyName: '', counterpartyAccount: '', amount: '', memo: '', category: '' }));
      } else {
        setNeftForm(prev => ({ ...prev, counterpartyName: '', counterpartyAccount: '', amount: '', memo: '', category: '' }));
      }
      
      // 5. Refresh data
      dispatch(fetchPayments());
      dispatch(fetchAccounts());
    } catch (err: any) {
      console.error(`${isAch ? 'ACH' : 'NEFT'} payment failed:`, err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Payment failed. Please try again.';
      alert(`❌ Error: ${msg}`);
    } finally {
      setIsTransferring(false);
    }
  }

  const handleTransfer = async () => {
    if (!formData.amount || !formData.upiId || !formData.upiPin) return;
    setIsTransferring(true)
    try {
      // 1. Mandatory fresh fetch of accountId before sending
      console.log('Verifying accountId from /api/accounts for UPI transfer...')
      let accountsRes
      try {
        accountsRes = await api.get('/accounts')
      } catch (err: any) {
        if (err.response?.status === 403) {
          console.log('403 on /accounts, trying fallback /api/user/accounts...')
          accountsRes = await api.get('/user/accounts')
        } else {
          throw err
        }
      }
      const accountList = Array.isArray(accountsRes.data) ? accountsRes.data : (accountsRes.data?.data || [])
      
      const selectedAccount = accountList.find((acc: any) => 
        String(acc.accountId) === String(formData.fromAccount) || 
        String(acc.id) === String(formData.fromAccount)
      )

      if (!selectedAccount) {
        throw new Error('The selected source account could not be verified. Please try again.')
      }

      const verifiedAccountId = selectedAccount.accountId || selectedAccount.id

      // 2. Submit payment to api/payments/upi
      const payload = {
        accountId: verifiedAccountId,
        amount: Number(formData.amount),
        upiId: formData.upiId,
        counterpartyName: formData.counterpartyName,
        memo: formData.memo,
        category: formData.category
      }

      console.log('Sending UPI transfer with verified accountId:', payload)
      const response = await api.post('/payments/upi', payload)
      
      const res = response.data
      alert(`✅ UPI Transfer Successful!\n\nReference: ${res.transactionId || res.id || 'Confirmed'}\nAmount: ₹${formData.amount}\nTo: ${formData.counterpartyName || formData.upiId}`)
      
      setIsTransferOpen(false)
      dispatch(fetchPayments())
      dispatch(fetchAccounts())
      
      // Reset form
      setFormData({
        fromAccount: verifiedAccountId,
        upiId: '',
        counterpartyName: '',
        amount: '',
        memo: '',
        category: '',
        upiPin: ''
      })
    } catch (error: any) {
      console.error("UPI Transfer failed:", error)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Transfer failed. Please try again.'
      alert(`❌ Error: ${errorMsg}`)
    } finally {
      setIsTransferring(false)
    }
  }

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendorForm.name || !vendorForm.accountNumber) {
      alert('Name and Account Number are required.')
      return
    }

    setIsAddingVendor(true)
    try {
      console.log('Adding new vendor...')
      let res;
      try {
        res = await api.post('/vendors', vendorForm)
      } catch (err: any) {
        if (err.response?.status === 403) {
          console.log('403 on /api/vendors, trying fallback /api/user/vendors...')
          res = await api.post('/user/vendors', vendorForm)
        } else {
          throw err
        }
      }
      
      alert('✅ Vendor Added Successfully!')
      setIsAddVendorOpen(false)
      // Reset form
      setVendorForm({
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
      // Refresh list
      const fetchVendors = async () => {
        const r = await api.get('/vendors').catch(e => e.response?.status === 403 ? api.get('/user/vendors') : Promise.reject(e))
        setApiVendors(Array.isArray(r.data) ? r.data : (r.data?.data || []))
      }
      fetchVendors()
    } catch (err: any) {
      console.error('Failed to add vendor:', err)
      alert(`❌ Error: ${err.response?.data?.message || err.message}`)
    } finally {
      setIsAddingVendor(false)
    }
  }

  return (
    <div className="space-y-7">

      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Efficient capital movement across your global accounts.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Send Form */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-lg font-semibold text-gray-900">Send New Payment</h2>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {(['Domestic', 'International'] as const).map(t => (
                <button key={t} onClick={() => setPaymentTab(t)} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  paymentTab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}>{t}</button>
              ))}
            </div>
          </div>

          {paymentTab === 'Domestic' ? (
            /* ── Domestic Form (Dynamic based on domMethod) ── */
            <div className="space-y-6">
              {domMethod === 'upi' ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 text-center">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">UPI Payments Coming Soon</h3>
                  <p className="text-sm text-gray-500 max-w-xs mt-2">We're working hard to bring UPI support to Aureon. Stay tuned for updates!</p>
                </div>
              ) : domMethod === 'ach' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="form-label">Source Account</label>
                    <select 
                      value={achForm.fromAccountId}
                      onChange={(e) => setAchForm({...achForm, fromAccountId: e.target.value})}
                      className="form-select"
                    >
                      {displayAccounts.map((acc: any) => (
                        <option key={acc.accountId || acc.id} value={acc.accountId || acc.id}>
                          {acc.nickname || 'Account'} (****{String(acc.accountNumber || '').slice(-4)}) - ${acc.balance || 0}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Counterparty Name</label>
                    <input 
                      type="text" 
                      value={achForm.counterpartyName}
                      onChange={(e) => setAchForm({...achForm, counterpartyName: e.target.value})}
                      placeholder="Full Name" 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Counterparty Account</label>
                    <input 
                      type="text" 
                      value={achForm.counterpartyAccount}
                      onChange={(e) => setAchForm({...achForm, counterpartyAccount: e.target.value})}
                      placeholder="Account Number" 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Counterparty Routing</label>
                    <input 
                      type="text" 
                      value={achForm.counterpartyRouting}
                      onChange={(e) => setAchForm({...achForm, counterpartyRouting: e.target.value})}
                      placeholder="9-digit ABA Routing" 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Amount (USD)</label>
                    <input 
                      type="number" 
                      value={achForm.amount}
                      onChange={(e) => setAchForm({...achForm, amount: e.target.value})}
                      placeholder="0.00" 
                      className="form-input font-bold" 
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="sameDay"
                      checked={achForm.sameDay}
                      onChange={(e) => setAchForm({...achForm, sameDay: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                    />
                    <label htmlFor="sameDay" className="text-sm font-medium text-gray-700 cursor-pointer">Request Same-Day ACH Settlement (Additional fees may apply)</label>
                  </div>
                  <div>
                    <label className="form-label">Memo</label>
                    <input 
                      type="text" 
                      value={achForm.memo}
                      onChange={(e) => setAchForm({...achForm, memo: e.target.value})}
                      placeholder="Optional note" 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Category</label>
                    <input 
                      type="text" 
                      value={achForm.category}
                      onChange={(e) => setAchForm({...achForm, category: e.target.value})}
                      placeholder="e.g. Payroll" 
                      className="form-input" 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="form-label">Source Account</label>
                    <select 
                      value={neftForm.fromAccountId}
                      onChange={(e) => setNeftForm({...neftForm, fromAccountId: e.target.value})}
                      className="form-select"
                    >
                      {displayAccounts.map((acc: any) => (
                        <option key={acc.accountId || acc.id} value={acc.accountId || acc.id}>
                          {acc.nickname || 'Account'} (****{String(acc.accountNumber || '').slice(-4)}) - ${acc.balance || 0}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Counterparty Name</label>
                    <input 
                      type="text" 
                      value={neftForm.counterpartyName}
                      onChange={(e) => setNeftForm({...neftForm, counterpartyName: e.target.value})}
                      placeholder="Full Name" 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Counterparty Account</label>
                    <input 
                      type="text" 
                      value={neftForm.counterpartyAccount}
                      onChange={(e) => setNeftForm({...neftForm, counterpartyAccount: e.target.value})}
                      placeholder="Account Number" 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">IFSC Code</label>
                    <input 
                      type="text" 
                      value={neftForm.ifscCode}
                      onChange={(e) => setNeftForm({...neftForm, ifscCode: e.target.value})}
                      placeholder="e.g. SBIN0001234" 
                      className="form-input font-mono" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Amount (INR)</label>
                    <input 
                      type="number" 
                      value={neftForm.amount}
                      onChange={(e) => setNeftForm({...neftForm, amount: e.target.value})}
                      placeholder="0.00" 
                      className="form-input font-bold" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Memo</label>
                    <input 
                      type="text" 
                      value={neftForm.memo}
                      onChange={(e) => setNeftForm({...neftForm, memo: e.target.value})}
                      placeholder="Optional note" 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Category</label>
                    <input 
                      type="text" 
                      value={neftForm.category}
                      onChange={(e) => setNeftForm({...neftForm, category: e.target.value})}
                      placeholder="e.g. Vendor Payment" 
                      className="form-input" 
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── International Form ── */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
                <div>
                  <label className="form-label">From Account</label>
                  <select
                    value={intlForm.fromAccountId}
                    onChange={(e) => setIntlForm({...intlForm, fromAccountId: e.target.value})}
                    className="form-select"
                  >
                    <option value="" disabled>Select an account</option>
                    {displayAccounts.map((acc: any, index: number) => {
                      const id = acc.accountId || acc.id || acc._id || String(index);
                      const name = acc.nickname || acc.accountName || acc.accountType || acc.type || 'Account';
                      const num = String(acc.accountNumber || acc.accountId || acc.id || acc.number || '0000').slice(-4);
                      return (
                        <option key={id} value={id}>
                          {name} (****{num}) - ${acc.balance || 0}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="form-label">Counterparty Name</label>
                  <input
                    type="text"
                    value={intlForm.counterpartyName}
                    onChange={(e) => setIntlForm({...intlForm, counterpartyName: e.target.value})}
                    placeholder="Recipient full name"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
                <div>
                  <label className="form-label">Counterparty Account</label>
                  <input
                    type="text"
                    value={intlForm.counterpartyAccount}
                    onChange={(e) => setIntlForm({...intlForm, counterpartyAccount: e.target.value})}
                    placeholder="IBAN / Account number"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    value={intlForm.amount}
                    onChange={(e) => setIntlForm({...intlForm, amount: e.target.value})}
                    placeholder="0.00"
                    className="form-input font-bold text-gray-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
                <div>
                  <label className="form-label">Target Currency</label>
                  <select
                    value={intlForm.targetCurrency}
                    onChange={(e) => setIntlForm({...intlForm, targetCurrency: e.target.value})}
                    className="form-select"
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="INR">INR — Indian Rupee</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Memo</label>
                  <input
                    type="text"
                    value={intlForm.memo}
                    onChange={(e) => setIntlForm({...intlForm, memo: e.target.value})}
                    placeholder="Optional note"
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          {/* Payment Method – dynamic based on tab */}
          <div className="mb-7">
            <label className="form-label mb-3">Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(paymentTab === 'Domestic' ? domesticMethods : intlMethods).map(pm => {
                const currentMethod = paymentTab === 'Domestic' ? domMethod : intlMethod;
                const setMethod = paymentTab === 'Domestic' ? setDomMethod : setIntlMethod;
                const isActive = currentMethod === pm.id;
                
                return (
                  <button
                    key={pm.id}
                    onClick={() => setMethod(pm.id)}
                    className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all relative ${
                      isActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`absolute top-3.5 right-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isActive ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                    </div>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                      isActive ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-500 border border-gray-100 shadow-xs'
                    }`}>
                      <pm.icon size={18}/>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{pm.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pm.sub}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Est. delivery: <span className="font-semibold text-gray-900">{paymentTab === 'International' ? '2–4 Business days' : 'Today, 4:30 PM'}</span></p>
              <p className="text-sm text-gray-500 mt-0.5">Processing fee: <span className="font-semibold text-success-dark">$0.00 (Platinum)</span></p>
            </div>
            {paymentTab === 'International' ? (
              <button
                onClick={handleInternationalPayment}
                disabled={isSendingInternational || !intlForm.fromAccountId || !intlForm.amount || !intlForm.counterpartyName || !intlForm.counterpartyAccount}
                className="btn-primary px-8 py-3 rounded-xl text-base gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingInternational ? <Loader2 size={16} className="animate-spin" /> : null}
                Review & Send
              </button>
            ) : domMethod === 'upi' ? (
              <button disabled className="btn-secondary px-8 py-3 rounded-xl text-base opacity-50 cursor-not-allowed">
                Coming Soon
              </button>
            ) : (
              <button 
                onClick={handleDomesticPayment}
                disabled={isTransferring}
                className="btn-primary px-8 py-3 rounded-xl text-base gap-2"
              >
                {isTransferring ? <Loader2 size={16} className="animate-spin" /> : null}
                Review & Send
              </button>
            )}
          </div>
        </motion.div>

        {/* Vendors */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <p className="section-title">Vendors</p>
            <button 
              onClick={() => navigate('/dashboard/vendors')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Manage All
            </button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1">
            {apiVendors === null ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-2 opacity-50">
                <Loader2 className="animate-spin text-primary-600" size={20} />
                <p className="text-sm font-medium text-gray-500">Loading vendors...</p>
              </div>
            ) : apiVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-2 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <p className="text-sm font-medium text-gray-400">No vendors found</p>
                <p className="text-xs text-gray-300">Add your first vendor to get started</p>
              </div>
            ) : (
              apiVendors.map((v: any, index: number) => {
                const name = v.name || v.vendorName || v.companyName || 'Vendor';
                const initials = name.split(' ').map((n: any) => n[0]).join('').toUpperCase().slice(0, 2);
                const colors = [
                  'bg-emerald-100 text-emerald-700',
                  'bg-primary-100 text-primary-700',
                  'bg-amber-100 text-amber-700',
                  'bg-rose-100 text-rose-700',
                  'bg-indigo-100 text-indigo-700'
                ];
                const colorClass = v.color || colors[index % colors.length];
                
                return (
                  <button key={v.id || index} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colorClass}`}>
                      {v.initials || initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">{v.desc || v.category || v.email || 'Service Provider'}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"/>
                  </button>
                );
              })
            )}
          </div>
          <button 
            onClick={() => setIsAddVendorOpen(true)}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
          >
            + Add Vendor
          </button>
        </motion.div>
      </div>

      {/* Add Vendor Modal */}
      {isAddVendorOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Add New Vendor</h3>
              <button onClick={() => setIsAddVendorOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVendor} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})}
                    placeholder="Company or individual name"
                    className="form-input"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})}
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
                    value={vendorForm.bankName}
                    onChange={(e) => setVendorForm({...vendorForm, bankName: e.target.value})}
                    placeholder="e.g. Chase Bank"
                    className="form-input"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Currency</label>
                  <select
                    value={vendorForm.currency}
                    onChange={(e) => setVendorForm({...vendorForm, currency: e.target.value})}
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
                    value={vendorForm.accountNumber}
                    onChange={(e) => setVendorForm({...vendorForm, accountNumber: e.target.value})}
                    placeholder="Account Number"
                    className="form-input"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Routing Number</label>
                  <input
                    type="text"
                    value={vendorForm.routingNumber}
                    onChange={(e) => setVendorForm({...vendorForm, routingNumber: e.target.value})}
                    placeholder="9-digit routing"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Payment Method</label>
                <select
                  value={vendorForm.paymentMethod}
                  onChange={(e) => setVendorForm({...vendorForm, paymentMethod: e.target.value})}
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
                  value={vendorForm.address}
                  onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})}
                  placeholder="Street, City, State, Zip"
                  className="form-input resize-none"
                />
              </div>

              <div>
                <label className="form-label">Internal Notes</label>
                <input
                  type="text"
                  value={vendorForm.notes}
                  onChange={(e) => setVendorForm({...vendorForm, notes: e.target.value})}
                  placeholder="e.g. Primary cloud provider"
                  className="form-input"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddVendorOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingVendor}
                  className="btn-primary px-6 py-2 rounded-xl text-sm gap-2"
                >
                  {isAddingVendor ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Vendor
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Quick Transfer Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">UPI Quick Transfer</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                <select
                  value={formData.fromAccount}
                  onChange={(e) => setFormData({...formData, fromAccount: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="" disabled>Select an account</option>
                  {accounts.map((acc: any, index: number) => {
                    const id = acc.accountId || acc.id || acc._id || String(index);
                    const name = acc.nickname || acc.accountName || acc.accountType || acc.type || 'Account';
                    const num = String(acc.accountNumber || acc.accountId || acc.id || acc.number || '0000').slice(-4);
                    return (
                      <option key={id} value={id}>
                        {name} (****{num}) - ${acc.balance || 0}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                    placeholder="name@bank"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Counterparty Name</label>
                  <input
                    type="text"
                    value={formData.counterpartyName}
                    onChange={(e) => setFormData({...formData, counterpartyName: e.target.value})}
                    placeholder="Recipient Name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Services"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Memo</label>
                <input
                  type="text"
                  value={formData.memo}
                  onChange={(e) => setFormData({...formData, memo: e.target.value})}
                  placeholder="Optional note"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  value={formData.upiPin}
                  onChange={(e) => setFormData({...formData, upiPin: e.target.value})}
                  placeholder="••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setIsTransferOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={isTransferring || !formData.upiId || !formData.amount || !formData.upiPin}
                className="btn-primary gap-2"
              >
                {isTransferring ? <Loader2 size={15} className="animate-spin" /> : null}
                Send Transfer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
