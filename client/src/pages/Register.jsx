import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useRegisterMutation } from '../store/api/api'
import { setCredentials } from '../store/slices/authSlice'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { LogoWithTagline } from '../components/common/Logo'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [register, { isLoading }] = useRegisterMutation()
  const [form, setForm] = useState({
    name: '', email: '', password: '', organizationName: '', phone: '', industry: '', employeeCount: '',
    companyType: '', sector: 'service', licenseKey: '', pan: ''
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
    if (!form.password || form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (form.password && !/[A-Z]/.test(form.password)) newErrors.password = 'Password must contain an uppercase letter'
    if (form.password && !/[0-9]/.test(form.password)) newErrors.password = 'Password must contain a number'
    if (form.password && !/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) newErrors.password = 'Password must contain a special character'
    if (!form.organizationName.trim()) newErrors.organizationName = 'Company name is required'
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      newErrors.phone = 'Must be a valid 10-digit Indian phone number'
    }
    if (!form.licenseKey.trim()) {
      newErrors.licenseKey = 'License key is required'
    } else {
      const cleanKey = form.licenseKey.replace(/[-\s]/g, '').toUpperCase()
      if (cleanKey.length !== 16) newErrors.licenseKey = 'Invalid license key format'
    }
    if (!form.pan.trim()) {
      newErrors.pan = 'PAN is required'
    } else {
      const cleanPan = form.pan.replace(/[\s-]/g, '').toUpperCase()
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
        newErrors.pan = 'Invalid PAN format. Expected: AAAAA9999A'
      }
    }

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors)

    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '' && v !== null)
    )
    if (payload.employeeCount) payload.employeeCount = Number(payload.employeeCount)
    payload.licenseKey = form.licenseKey.replace(/[-\s]/g, '').toUpperCase()
    payload.pan = form.pan.replace(/[\s-]/g, '').toUpperCase()

    try {
      const result = await register(payload).unwrap()
      dispatch(setCredentials(result))
      toast.success('Account created and license activated!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen canvas-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <LogoWithTagline light className="mb-6" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200/60">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.name ? 'border-danger-300' : 'border-slate-200'}`} />
                {errors.name && <p className="text-xs text-danger-500 mt-1.5">{errors.name}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.email ? 'border-danger-300' : 'border-slate-200'}`} />
                {errors.email && <p className="text-xs text-danger-500 mt-1.5">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
              <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min 8 chars, uppercase, number, special char"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.password ? 'border-danger-300' : 'border-slate-200'}`} />
              {errors.password && <p className="text-xs text-danger-500 mt-1.5">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name *</label>
              <input type="text" value={form.organizationName} onChange={(e) => handleChange('organizationName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.organizationName ? 'border-danger-300' : 'border-slate-200'}`} />
              {errors.organizationName && <p className="text-xs text-danger-500 mt-1.5">{errors.organizationName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g., 9876543210" maxLength={10}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.phone ? 'border-danger-300' : 'border-slate-200'}`} />
                {errors.phone && <p className="text-xs text-danger-500 mt-1.5">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                <input type="text" value={form.industry} onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="e.g., Manufacturing" />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">License & Verification</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Company PAN *
                    <span className="text-xs text-slate-400 font-normal ml-1">(Format: AAAAA9999A)</span>
                  </label>
                  <input type="text" value={form.pan} maxLength={10}
                    onChange={(e) => handleChange('pan', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="ABCDE1234F"
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-mono uppercase tracking-wider focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.pan ? 'border-danger-300' : 'border-slate-200'}`} />
                  {errors.pan && <p className="text-xs text-danger-500 mt-1.5">{errors.pan}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    License Key *
                    <span className="text-xs text-slate-400 font-normal ml-1">(Required to activate account)</span>
                  </label>
                  <input type="text" value={form.licenseKey} maxLength={19}
                    onChange={(e) => handleChange('licenseKey', e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-mono text-center tracking-wider focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${errors.licenseKey ? 'border-danger-300' : 'border-slate-200'}`} />
                  {errors.licenseKey && <p className="text-xs text-danger-500 mt-1.5">{errors.licenseKey}</p>}
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all duration-200">
              {isLoading ? <><LoadingSpinner size="sm" /> Validating...</> : 'Create Account & Activate License'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-700 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
