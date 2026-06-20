import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials, setAccessToken, logout } from '../../store/slices/authSlice'
import LoadingSpinner from './LoadingSpinner'

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch()
  const { user, accessToken } = useSelector((state) => state.auth)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user')
    if (!storedUser) {
      setChecking(false)
      return
    }

    if (accessToken) {
      setChecking(false)
      return
    }

    const refresh = async () => {
      try {
        const res = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.accessToken) {
            const parsedUser = JSON.parse(storedUser)
            dispatch(setCredentials({ ...data, user: data.user || parsedUser }))
          }
        } else {
          dispatch(logout())
        }
      } catch {
        dispatch(logout())
      } finally {
        setChecking(false)
      }
    }

    refresh()
  }, [dispatch, accessToken])

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-slate-500">Restoring session...</p>
        </div>
      </div>
    )
  }

  return children
}
