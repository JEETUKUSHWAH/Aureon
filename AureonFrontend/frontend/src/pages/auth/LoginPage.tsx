import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Lock, Star, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

const features = [
  'Multi-account treasury management',
  'Real-time global wire transfers',
  'AI-powered expense intelligence',
  'Corporate card issuance in seconds',
]

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [showPass, setShowPass] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    password: '',
    rememberMe: false,

    // Expanded Signup fields
    legalName: '',
    displayName: '',
    ein: '',
    businessType: 'LLC',
    industry: '',
    website: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'USA',
    postalCode: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPhone: '',
    incorporationState: '',
    incorporationDate: ''
  })

  const [signupStep, setSignupStep] = useState(1)

  const { login, signup, onboard, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Your session has expired. Please log in again.', {
        id: 'session-expired',
        duration: 5000,
      })
      // Clean up the URL to prevent showing the toast again on manual refresh
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (tab === 'login') {
        await login({
          email: formData.email,
          password: formData.password,
          rememberMe: !!formData.rememberMe
        })
        toast.success('Welcome back to Aureon')
      } else {
        // Full company onboarding
        await onboard(formData)
        toast.success('Company registered successfully')
      }
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      let errorMessage = typeof err === 'string' ? err : (err?.message || 'Authentication failed. Please check your credentials.')

      // Specific check requested by user
      if (errorMessage === 'Invalid credentials' || err?.status === 401 || err?.status === 404) {
        errorMessage = 'Invalid credentials or user doesn\'t exist'
      }

      toast.error(errorMessage, {
        id: 'login-error', // Prevent duplicate toasts
      })
    }
  }

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #06B6D4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3B82F6 0%, transparent 50%)' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 mb-14">
            <Logo size="md" />
            <span className="text-xl font-bold tracking-tight">Aureon</span>
          </Link>


          <h1 className="text-4xl font-bold leading-tight mb-5">
            The modern standard<br />
            for <span className="text-accent-300">startup finance.</span>
          </h1>
          <p className="text-primary-200 text-base leading-relaxed mb-8">
            Everything your team needs to move money, manage cards, and grow with confidence.
          </p>

          <ul className="space-y-3">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-primary-100">
                <div className="w-5 h-5 rounded-full bg-accent-400/20 border border-accent-400/30 flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={11} className="text-accent-300" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="relative z-10 space-y-5">

          {/* Trust badges */}
          <div className="flex gap-5 text-xs text-white/50 font-semibold">
            <span className="flex items-center gap-1.5"><Shield size={12} /> PCI-DSS Compliant</span>
            <span className="flex items-center gap-1.5"><Lock size={12} /> AES-256 Encrypted</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile brand */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Logo size="md" />
            <span className="text-lg font-bold text-gray-900">Aureon</span>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
            {tab === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-500 text-sm mb-7">
            {tab === 'login' ? 'Sign in to your dashboard to continue.' : 'Start your financial transformation today.'}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-7">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button type="button" onClick={() => toast('This authentication method will be implemented soon', { icon: '🚧' })} className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 0 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.523 2.932 15.19 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761h-9.426z" /></svg>
              Google
            </button>
            <button type="button" onClick={() => toast('This authentication method will be implemented soon', { icon: '🚧' })} className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.68.727-1.303 2.152-1.118 3.52 1.353.104 2.689-.607 3.405-1.508z" /></svg>
              Apple
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">or email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' ? (
              <div className="space-y-5">
                {/* Step Indicators */}
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${signupStep >= s ? 'bg-primary-600' : 'bg-gray-200'}`} />
                  ))}
                </div>

                {signupStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Business Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Legal Name</label>
                        <input name="legalName" type="text" className="form-input" value={formData.legalName} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <label className="form-label">Display Name</label>
                        <input name="displayName" type="text" className="form-input" value={formData.displayName} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">EIN</label>
                        <input name="ein" type="text" placeholder="12-3456789" className="form-input" value={formData.ein} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <label className="form-label">Business Type</label>
                        <select name="businessType" className="form-input" value={formData.businessType} onChange={(e: any) => handleInputChange(e)} required>
                          <option value="LLC">LLC</option>
                          <option value="Corporation">Corporation</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Sole Proprietorship">Sole Proprietorship</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Industry</label>
                      <input name="industry" type="text" placeholder="Technology, Fintech, etc." className="form-input" value={formData.industry} onChange={handleInputChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Website</label>
                        <input name="website" type="url" placeholder="https://company.com" className="form-input" value={formData.website} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="form-label">Business Phone</label>
                        <input name="phone" type="tel" className="form-input" value={formData.phone} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <button type="button" onClick={() => setSignupStep(2)} className="btn-primary w-full py-3">Next: Address Details <ArrowRight size={16} className="ml-2 inline" /></button>
                  </motion.div>
                )}

                {signupStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Address & Incorporation</h3>
                    <div>
                      <label className="form-label">Address Line 1</label>
                      <input name="addressLine1" type="text" className="form-input" value={formData.addressLine1} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <label className="form-label">Address Line 2 (Optional)</label>
                      <input name="addressLine2" type="text" className="form-input" value={formData.addressLine2} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">City</label>
                        <input name="city" type="text" className="form-input" value={formData.city} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <label className="form-label">State / Province</label>
                        <input name="state" type="text" className="form-input" value={formData.state} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Postal Code</label>
                        <input name="postalCode" type="text" className="form-input" value={formData.postalCode} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <label className="form-label">Country</label>
                        <input name="country" type="text" className="form-input" value={formData.country} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Inc. State</label>
                        <input name="incorporationState" type="text" placeholder="Delaware" className="form-input" value={formData.incorporationState} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <label className="form-label">Inc. Date</label>
                        <input name="incorporationDate" type="date" className="form-input" value={formData.incorporationDate} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setSignupStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                      <button type="button" onClick={() => setSignupStep(3)} className="btn-primary flex-[2] py-3">Next: Owner Details <ArrowRight size={16} className="ml-2 inline" /></button>
                    </div>
                  </motion.div>
                )}

                {signupStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Owner / Administrator</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">First Name</label>
                        <input name="ownerFirstName" type="text" className="form-input" value={formData.ownerFirstName} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <label className="form-label">Last Name</label>
                        <input name="ownerLastName" type="text" className="form-input" value={formData.ownerLastName} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Owner Email</label>
                      <input name="ownerEmail" type="email" placeholder="owner@company.com" className="form-input" value={formData.ownerEmail} onChange={handleInputChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Password</label>
                        <input name="ownerPassword" type="password" className="form-input" value={formData.ownerPassword} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <label className="form-label">Owner Phone</label>
                        <input name="ownerPhone" type="tel" className="form-input" value={formData.ownerPhone} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setSignupStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                      <button type="submit" disabled={loading} className="btn-primary flex-[2] py-3 flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Finish & Create Account <ArrowRight size={16} /></>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              // Login Form
              <>
                <div>
                  <label className="form-label">Work email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="form-label mb-0">Password</label>
                    <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="form-input pr-11"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    name="rememberMe"
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-500">Stay logged in for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base mt-1 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>Log into Aureon <ArrowRight size={16} /></>
                  )}
                </button>
              </>
            )}
          </form>
        </motion.div>

        {/* Footer links */}
        <div className="absolute bottom-6 flex gap-5 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Support</a>
        </div>
      </div>
    </div>
  )
}
