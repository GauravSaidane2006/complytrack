import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useLoginMutation } from '../store/api/api'
import { setCredentials } from '../store/slices/authSlice'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { LogoWithTagline } from '../components/common/Logo'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [login, { isLoading }] = useLoginMutation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!form.email) return setErrors({ email: 'Email is required' })
    if (!form.password) return setErrors({ password: 'Password is required' })

    try {
      const result = await login(form).unwrap()
      dispatch(setCredentials(result))
      toast.success(`Welcome back, ${result.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen canvas-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogoWithTagline light className="mb-6" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200/60">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.email ? 'border-danger-300' : 'border-slate-200'}`}
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-xs text-danger-500 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.password ? 'border-danger-300' : 'border-slate-200'}`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-xs text-danger-500 mt-1.5">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all duration-200"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-700 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
