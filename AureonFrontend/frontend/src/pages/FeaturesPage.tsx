import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CreditCard, Shield, Globe, Zap, BarChart3, Users } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const features = [
  { icon: CreditCard, title: 'Corporate Cards', desc: 'Issue physical and virtual cards instantly. Set custom spending limits and merchant controls.' },
  { icon: Globe,      title: 'Global Payments', desc: 'Send wire transfers to over 140 countries. Settle in multi-currencies with competitive FX rates.' },
  { icon: Zap,        title: 'Automated Workflows', desc: 'Set up rules to automatically transfer funds, pay recurring invoices, and flag unusual behavior.' },
  { icon: BarChart3,  title: 'Real-time Analytics', desc: 'Visual dashboards tracking cash flow, burn rate, and departmental spending as it happens.' },
  { icon: Users,      title: 'Team Management', desc: 'Invite your whole team with granular Role-Based Access Control (RBAC). Empower them safely.' },
  { icon: Shield,     title: 'Enterprise Security', desc: 'Bank-grade infrastructure. SOC2 Type II, PCI-DSS Level 1 compliant, with mandatory 2FA.' }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-18">
      <Navbar />

      <main className="flex-1 py-20 px-5 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6"
          >
            A perfectly tuned financial engine
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 text-balance"
          >
            Aureon replaces your fragmented stack of banking apps, expense platforms, and AP software with one beautiful, unified platform.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors duration-300">
                <f.icon size={24} className="text-primary-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Deep Dive Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 opacity-20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="p-10 md:p-16 flex-1 flex flex-col justify-center relative z-10">
            <h2 className="text-3xl font-bold font-heading text-white mb-4">Programmable Money</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Use our robust API to issue cards programmatically, reconcile transactions instantly within your own app, and build custom financial workflows.
            </p>
            <div>
              <Link to="/signup" className="btn-primary w-auto inline-flex py-3 px-6">
                Explore the API Docs <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-800 p-8 border-t md:border-t-0 md:border-l border-gray-700 relative z-10">
            <pre className="text-sm text-accent-300 font-mono overflow-x-auto p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <code>
{`// Issue a virtual card instantly
const card = await zenith.cards.create({
  type: 'virtual',
  currency: 'USD',
  limit: 500000, // $5,000.00
  metadata: {
    department: 'marketing',
    campaign: 'Q4_Launch'
  }
});

console.log(card.id); 
// crd_...`}</code>
            </pre>
          </div>
        </motion.div>

      </main>
    </div>
  )
}
