import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useGetUnreadCountQuery, useLogoutMutation } from '../../store/api/api'
import { logout } from '../../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function Header({ onMenuToggle, collapsed }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const { data: unreadData } = useGetUnreadCountQuery()
  const [serverLogout] = useLogoutMutation()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    try { await serverLogout().unwrap() } catch { }
    dispatch(logout())
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-stone-100 -ml-2 transition-colors"
        aria-label="Toggle menu"
      >
        {collapsed ? (
          <svg className="w-6 h-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        )}
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/alerts" className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors">
          <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadData?.count > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {unreadData.count > 9 ? '9+' : unreadData.count}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-sm font-medium text-stone-700 block">{user?.name}</span>
              {user?.organization?.companyId && (
                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                  {user.organization.companyId}
                </span>
              )}
            </div>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-stone-200/80 py-1 z-20 overflow-hidden">
                <Link
                  to="/settings"
                  className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/company-report"
                  className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Company Report
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
