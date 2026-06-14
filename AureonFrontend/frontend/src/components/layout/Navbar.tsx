import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const navLinks = [
  { label: 'Product', path: '/features' },
  { label: 'Pricing', path: '/pricing'  },
  { label: 'About',   path: '/'         },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 h-18 flex items-center justify-between py-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span className={`text-base font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            Aureon
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <Link
              key={l.label}
              to={l.path}
              className={`text-sm font-semibold transition-colors ${
                scrolled ? 'text-gray-900' : 'text-white/80 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className={`text-sm font-semibold transition-colors px-4 py-2 ${
              scrolled ? 'text-gray-900' : 'text-white/80 hover:text-white'
            }`}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'}`}
        >
          {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-2"
        >
          {navLinks.map(l => (
            <Link
              key={l.label}
              to={l.path}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link to="/login"  onClick={() => setMobileOpen(false)} className="btn-secondary py-2.5 text-sm">Log in</Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary py-2.5 text-sm">Get Started</Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
