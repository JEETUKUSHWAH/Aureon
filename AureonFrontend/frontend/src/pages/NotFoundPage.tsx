import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
            <AlertCircle size={32} className="text-danger-dark" />
          </div>
          
          <h1 className="text-4xl font-bold font-heading text-gray-900 tracking-tight mb-3">
            404
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Page not found
          </h2>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved. Check the URL or head back to safety.
          </p>
          
          <Link to="/" className="btn-primary inline-flex gap-2">
            <ArrowLeft size={16} /> Return to Homepage
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
