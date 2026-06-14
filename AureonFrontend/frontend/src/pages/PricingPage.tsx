import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const plans = [
  {
    name: 'Starter', price: '$0', desc: 'Perfect for early-stage startups and solo founders.',
    features: ['Up to 3 team members', '1 corporate card', 'Basic analytics', 'Standard support']
  },
  {
    name: 'Pro', price: '$299', desc: 'For growing teams that need advanced control.',
    features: ['Unlimited team members', 'Unlimited virtual cards', 'Advanced analytics & custom reports', 'Priority 24/7 support', 'API access'],
    popular: true
  },
  {
    name: 'Enterprise', price: 'Custom', desc: 'Custom solutions for large organizations.',
    features: ['Everything in Pro', 'Dedicated account manager', 'Custom contract & SLAs', 'Volume discounts on FX']
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-18">
      <Navbar />

      <main className="flex-1 py-20 px-5 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-500">Start for free, upgrade when you need more power. No hidden fees or surprise charges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 bg-white border flex flex-col ${
                p.popular ? 'border-primary-500 shadow-xl scale-[1.02] z-10' : 'border-gray-200 shadow-sm'
              }`}
            >
              {p.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{p.desc}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{p.price}</span>
                {p.price !== 'Custom' && <span className="text-gray-500 font-medium"> / mo</span>}
              </div>

              <button className={`w-full py-3 rounded-lg font-semibold mb-8 transition-colors ${
                p.popular ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}>
                {p.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </button>

              <div className="space-y-4 flex-1">
                <p className="text-sm font-semibold text-gray-900">What's included:</p>
                {p.features.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <Check size={16} className={`mt-0.5 flex-shrink-0 ${p.popular ? 'text-primary-500' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
