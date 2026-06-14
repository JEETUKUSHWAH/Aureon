import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { BarChart3, Globe, Zap, Check } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { Logo } from '../components/ui/Logo'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: Globe, title: 'Global Accounts', desc: 'Hold, send, and receive funds in 40+ currencies with zero hidden fees.' },
  { icon: Zap, title: 'Instant Transfers', desc: 'Settle payments in seconds via SWIFT GPI, ACH, and local rails.' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Real-time visibility into your runway, burn rate, and projected cash flow.' },
]

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const handleLaptopClick = () => {
    setTimeout(() => {
      navigate(isAuthenticated ? '/dashboard' : '/login')
    }, 800)
  }

  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      {/* ── Hero Section (Premium Refined) ───────────────────── */}
      <section className="relative h-screen min-h-[700px] flex flex-col items-center justify-start pt-16 overflow-hidden px-5">

        {/* Background Image with Enhancements */}
        <div className="absolute inset-0 z-0">
          {/* Scenic Background */}
          <img
            src="/hero-bg.png"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />

          {/* Subtle dark overlay for contrast */}
          <div className="absolute inset-0 bg-black/40 z-10" />

          {/* Faint animated financial graph lines (simulated with CSS pattern) */}
          <div className="absolute inset-0 z-20 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          ></div>
          
          {/* Soft airy overlay for better text contrast without darkening too much */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-white/10 z-10" />
        </div>

        {/* Content Area (Moved upward) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-30 text-center max-w-4xl mx-auto pt-8"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-xl leading-[1.1]">
            Modern Banking for<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300 opacity-90">
              Modern Businesses
            </span>
          </h1>

          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-lg font-medium">
            Aureon is a powerful all-in-one financial operating system that brings<br className="hidden md:block" />
            together banking, payments, and expenses on a single platform.
          </p>

          {/* Single Centered CTA Button */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-xl whitespace-nowrap transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 active:scale-95 text-lg"
            >
              Get Started
            </button>
          </div>


        </motion.div>

      </section>


      {/* Dashboard Preview / App Mockup */}
      <section className="relative -mt-10 px-5 z-20 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-xl shadow-2xl p-2 md:p-4 overflow-hidden"
          style={{ y: yParallax }}
        >
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden relative shadow-inner">
            {/* Realistic Mockup UI inside */}
            <div className="bg-gray-50 flex h-[400px] md:h-[600px]">
              <div className="w-16 md:w-64 bg-white border-r border-gray-100 hidden sm:flex flex-col p-4">
                <div className="flex items-center gap-2 mb-8 px-2">
                  <Logo size="sm" />
                  <span className="font-bold text-gray-900 hidden md:block tracking-tight text-lg">Aureon</span>
                </div>
                <div className="space-y-1">
                  {['Dashboard', 'Transactions', 'Cards', 'Invoices'].map((item, idx) => (
                    <div key={item} className={`h-10 px-3 rounded-lg flex items-center gap-3 ${idx === 0 ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                      <div className="w-4 h-4 rounded-sm bg-current opacity-20" />
                      <span className="text-sm font-semibold hidden md:block">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-6 md:p-8 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Good morning, Abhay</h2>
                    <p className="text-sm text-gray-500">Here's what's happening with your accounts today.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">AS</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium mb-2">Total Balance</p>
                    <p className="text-3xl font-bold text-gray-900 font-mono mb-2">$1,284,500.00</p>
                    <span className="inline-flex text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">+12.5% this month</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hidden md:block">
                    <p className="text-sm text-gray-500 font-medium mb-2">Total Expense</p>
                    <p className="text-3xl font-bold text-gray-900 font-mono mb-2">$42,890.15</p>
                    <span className="inline-flex text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">-4.2% vs last month</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hidden md:block">
                    <p className="text-sm text-gray-500 font-medium mb-2">Active Cards</p>
                    <p className="text-3xl font-bold text-gray-900 font-mono mb-2">24</p>
                    <span className="inline-flex text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">3 pending approval</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                    <button className="text-sm text-primary-600 font-semibold">View All</button>
                  </div>
                  <div className="p-0 flex-1">
                    {[
                      { title: 'Stripe Checkout', desc: 'Software', amt: '+$2,400.00', pos: true },
                      { title: 'AWS Cloud', desc: 'Infrastructure', amt: '-$1,200.00', pos: false },
                      { title: 'Uber Technologies', desc: 'Travel', amt: '-$45.50', pos: false },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 hover:bg-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-500">
                            {tx.title[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{tx.title}</p>
                            <p className="text-xs text-gray-500">{tx.desc}</p>
                          </div>
                        </div>
                        <p className={`font-mono font-semibold text-sm ${tx.pos ? 'text-emerald-600' : 'text-gray-900'}`}>{tx.amt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By Logging */}
      <section className="py-10 border-t border-b border-gray-100 bg-white relative z-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Innovative teams trust Aureon</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-40 grayscale">
            {['Acme Corp', 'Nova Labs', 'Skyline', 'Vanguard', 'Pioneer'].map(l => (
              <span key={l} className="text-xl font-bold font-heading text-gray-900">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50 relative z-10 px-5 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Everything you need to scale</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We've rebuilt the financial stack from the ground up so you can focus on building your product, not navigating banking portals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100/50"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
                  <f.icon size={20} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-white px-5 border-t border-gray-100 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-gray-500">“</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-heading text-gray-900 leading-relaxed mb-8">
            Moving to Aureon completely transformed how we manage our runway. We closed our books in hours instead of weeks, and the corporate cards just work everywhere.
          </h2>
          <div className="flex items-center justify-center gap-4">
            <img src="/founder.png" alt="CEO" className="w-12 h-12 rounded-full border border-gray-200" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Abhay Sharma</p>
              <p className="text-sm text-gray-500">Founder & CEO, Aureon</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 px-5 border-t border-gray-100">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gray-900 text-white p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full mix-blend-screen filter blur-[80px] opacity-40 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">Ready to upgrade your finance stack?</h2>
            <p className="text-gray-400 mb-10 max-w-lg mx-auto text-balance">
              Join thousands of fast-growing startups already using Aureon to manage their capital.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="btn-primary py-3.5 px-8 text-base">
                Get Started for Free
              </Link>
              <Link to="/pricing" className="btn-ghost text-white hover:bg-white/10 py-3.5 px-8 text-base border-gray-700">
                View Pricing
              </Link>
            </div>
            <ul className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-400 font-medium">
              <li className="flex items-center gap-2"><Check size={16} className="text-primary-500" /> Approval in 10 mins</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-primary-500" /> No personal guarantee</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-5 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold text-gray-900">Aureon</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link to="/features" className="hover:text-gray-900">Product</Link>
            <Link to="/pricing" className="hover:text-gray-900">Pricing</Link>
            <a href="#" className="hover:text-gray-900">Security</a>
            <a href="#" className="hover:text-gray-900">Legal</a>
          </div>
          <p className="text-sm text-gray-400">© 2024 Aureon Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
