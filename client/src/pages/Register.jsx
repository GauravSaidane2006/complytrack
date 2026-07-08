import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useRegisterMutation } from '../store/api/api'
import { setCredentials } from '../store/slices/authSlice'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [register, { isLoading }] = useRegisterMutation()
  const [form, setForm] = useState({
    name: '', email: '', password: '', organizationName: '', phone: '', industry: '', employeeCount: ''
  })
  const [errors, setErrors] = useState({})

  if (isAuthenticated || sessionStorage.getItem('user')) return <Navigate to="/dashboard" replace />

  const handleChange = (field, value) => setForm({ ...form, [field]: value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!form.organizationName.trim()) newErrors.organizationName = 'Company name is required'

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors)

    const payload = Object.fromEntries(
      Object.entries(form).filter(([_, v]) => v !== '' && v !== null)
    )
    if (payload.employeeCount) payload.employeeCount = Number(payload.employeeCount)

    try {
      const result = await register(payload).unwrap()
      dispatch(setCredentials(result))
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-xl shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ComplyTrack India</h1>
          <p className="text-stone-400 mt-2">Create your organization account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-stone-200/60">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${errors.name ? 'border-rose-300' : 'border-stone-200'}`} />
                {errors.name && <p className="text-xs text-rose-500 mt-1.5">{errors.name}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${errors.email ? 'border-rose-300' : 'border-stone-200'}`} />
                {errors.email && <p className="text-xs text-rose-500 mt-1.5">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password *</label>
              <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${errors.password ? 'border-rose-300' : 'border-stone-200'}`} />
              {errors.password && <p className="text-xs text-rose-500 mt-1.5">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Company Name *</label>
              <input type="text" value={form.organizationName} onChange={(e) => handleChange('organizationName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${errors.organizationName ? 'border-rose-300' : 'border-stone-200'}`} />
              {errors.organizationName && <p className="text-xs text-rose-500 mt-1.5">{errors.organizationName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Industry</label>
                <input type="text" value={form.industry} onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" placeholder="e.g., Manufacturing" />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium text-sm hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-200">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
