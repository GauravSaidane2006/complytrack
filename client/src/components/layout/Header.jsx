import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useGetUnreadCountQuery, useGetAlertsQuery, useMarkAlertReadMutation, useMarkAllAlertsReadMutation, useLogoutMutation, api } from '../../store/api/api'
import { logout } from '../../store/slices/authSlice'
import { toast } from 'react-hot-toast'
import UpdateChecker from '../common/UpdateChecker'
import { useGetMainServerStatusQuery } from '../../store/api/api'

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  exit: { opacity: 0, y: -4, scale: 0.96, transition: { duration: 0.12 } },
}

export default function Header({ onMenuToggle, collapsed }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const { data: unreadData } = useGetUnreadCountQuery()
  const { data: alertsData } = useGetAlertsQuery({ limit: 5, isRead: 'false' })
  const { data: mainServerData } = useGetMainServerStatusQuery(undefined, { pollingInterval: 15000 })
  const [markRead] = useMarkAlertReadMutation()
  const [markAllRead] = useMarkAllAlertsReadMutation()
  const [serverLogout] = useLogoutMutation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try { await serverLogout().unwrap() } catch { /* ignore */ }
    dispatch(logout())
    dispatch(api.util.resetApiState())
    sessionStorage.clear()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const handleMarkRead = async (id) => {
    try { await markRead(id).unwrap() } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap()
      toast.success('All alerts marked as read')
    } catch { toast.error('Failed') }
  }

  const alerts = alertsData?.alerts || []
  const unreadCount = unreadData?.count || 0

  return (
    <header className="h-14 sm:h-16 glass-strong flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-white/30 -ml-2 transition-colors active:scale-95"
        aria-label="Toggle menu"
      >
        {collapsed ? (
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        )}
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Main Server Connection Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/60 border border-slate-200/60"
          title={
            mainServerData?.monitor?.online === false
              ? `Main server unreachable: ${mainServerData.monitor.error || ''}`
              : `Main server ${mainServerData?.monitor?.online ? 'connected' : 'checking...'}${mainServerData?.monitor?.latencyMs ? ` · ${mainServerData.monitor.latencyMs}ms` : ''}`
          }
        >
          <span className="relative flex h-2 w-2">
            {mainServerData?.monitor?.online === false && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              mainServerData?.monitor?.online === false ? 'bg-danger-500'
              : mainServerData?.monitor?.online ? 'bg-emerald-500'
              : 'bg-slate-400 animate-pulse'
            }`} />
          </span>
          <span className={`text-[11px] font-medium ${
            mainServerData?.monitor?.online === false ? 'text-danger-600'
            : mainServerData?.monitor?.online ? 'text-emerald-600'
            : 'text-slate-500'
          }`}>
            {mainServerData?.monitor?.online === false ? 'Main Server Down'
              : mainServerData?.monitor?.online ? 'Main Server Online'
              : 'Connecting...'}
          </span>
        </div>

        {/* Update Checker */}
        <UpdateChecker currentVersion="1.0.0" />

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setShowNotifPanel(!showNotifPanel); setShowDropdown(false) }}
            className="relative p-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {showNotifPanel && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNotifPanel(false)}
                />
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-glass-lg border border-slate-200/60 z-40 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
                          Mark all read
                        </button>
                      )}
                      <Link to="/alerts" onClick={() => setShowNotifPanel(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                        View all
                      </Link>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-6 text-center">
                        <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-sm text-slate-500">No new notifications</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <motion.div
                          key={alert._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => { handleMarkRead(alert._id); setShowNotifPanel(false); navigate('/alerts') }}
                          className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                            !alert.isRead ? 'bg-primary-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                              alert.priority === 'critical' || alert.priority === 'high' ? 'bg-danger-500' :
                              alert.priority === 'medium' ? 'bg-primary-500' : 'bg-slate-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${!alert.isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                                {alert.title}
                              </p>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{alert.message}</p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                {new Date(alert.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => { setShowDropdown(!showDropdown); setShowNotifPanel(false) }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-sm font-medium text-slate-700 block">{user?.name}</span>
              {user?.organization?.companyId && (
                <span className="text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                  {user.organization.companyId}
                </span>
              )}
            </div>
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-glass-lg border border-slate-200/60 py-1 z-20 overflow-hidden"
                >
                  <Link
                    to="/settings"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    to="/company-report"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Company Report
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
