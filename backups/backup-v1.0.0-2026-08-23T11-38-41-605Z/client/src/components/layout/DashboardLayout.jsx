import { useState, useEffect } from 'react'
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import { useGetVerificationStatusQuery } from '../../store/api/api'

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
}

export default function DashboardLayout() {
  const { isAuthenticated, user, organization } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { data: verificationData } = useGetVerificationStatusQuery(undefined, { skip: !isAuthenticated })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const verificationStatus = verificationData?.verificationStatus || organization?.verificationStatus
  const isVerified = verificationStatus === 'verified' || user?.isDev

  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) {
      setCollapsed((prev) => !prev)
    } else {
      setSidebarOpen((prev) => !prev)
    }
  }

  return (
    <div className="min-h-screen canvas-gradient">
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-warning-500 to-primary-500 text-white px-4 py-3 text-center text-sm shadow-md"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Your account is pending verification. Some features may be limited.</span>
            <button
              onClick={() => navigate('/onboarding')}
              className="underline font-medium hover:text-white/80 transition-colors"
            >
              Complete Onboarding
            </button>
          </div>
        </motion.div>
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
      />

      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header onMenuToggle={handleMenuToggle} collapsed={collapsed} />
        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              {...pageTransition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
