import { Link } from 'react-router-dom'

import { Logo } from '@/components/ui/Logo'

export default function Footer() {
  return (
    <footer className="bg-[#05060f] border-t border-dark-200/30 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo size="md" />
              <span className="text-xl font-heading font-bold text-white tracking-tight">Aureon</span>
            </Link>
            <p className="text-dark-600 text-sm mb-6">
              The standard for modern finance. Engineered for velocity, scaled for growth.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-full bg-dark-100 border border-dark-300 flex items-center justify-center text-dark-500 hover:text-white hover:border-primary-500 transition-colors">
                  <span className="sr-only">{s}</span>
                  <div className="w-4 h-4 bg-current" style={{mask: 'url(/vite.svg) no-repeat center', WebkitMask: 'url(/vite.svg) no-repeat center'}} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-dark-600">
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">Business Banking</Link></li>
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">Payments</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Interactive Demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-dark-600">
              <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Customers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-dark-600">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-dark-200/30 flex flex-col md:flex-row items-center justify-between text-xs text-dark-600">
          <p>© 2025 Aureon Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>FDIC Insured</span>
            <span>•</span>
            <span>Global Support</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
