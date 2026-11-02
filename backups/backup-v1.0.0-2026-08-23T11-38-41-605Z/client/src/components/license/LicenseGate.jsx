import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetLicenseStatusQuery, useActivateLicenseMutation } from '../../store/api/api'
import { toast } from 'react-hot-toast'

export default function LicenseGate({ children }) {
  const user = useSelector((state) => state.auth.user)
  const { data: licenseData, isLoading, refetch } = useGetLicenseStatusQuery()
  const [activateLicense] = useActivateLicenseMutation()
  const [keyInput, setKeyInput] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (user?.role === 'developer' || user?.role === 'superadmin') {
    return children
  }

  const hasLicense = licenseData?.hasLicense
  const isActive = licenseData?.isActive
  const isExpired = licenseData?.isExpired

  if (hasLicense && isActive) {
    return children
  }

  const handleActivate = async () => {
    if (!keyInput.trim()) return toast.error('Enter a license key')
    try {
      const result = await activateLicense({ key: keyInput.trim() }).unwrap()
      toast.success(result.message)
      setKeyInput('')
      setShowKeyInput(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid key')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleActivate()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ComplyTrack</h1>
          <p className="text-slate-400">
            {isExpired
              ? 'Your license has expired. Please activate a new key to continue.'
              : 'No active license found. Please enter your license key to use ComplyTrack.'}
          </p>
        </div>

        {hasLicense && licenseData?.license && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="text-sm font-medium text-slate-300">
                {isExpired ? 'Expired' : 'Active'} - {licenseData.license.tierLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Key</p>
                <p className="text-slate-300 font-mono">{licenseData.license.key}</p>
              </div>
              <div>
                <p className="text-slate-500">Expires</p>
                <p className="text-slate-300">
                  {new Date(licenseData.license.expiresAt).toLocaleDateString()}
                </p>
              </div>
              {!isExpired && (
                <div className="col-span-2">
                  <p className="text-slate-500">Days Remaining</p>
                  <p className="text-primary-400 text-lg font-bold">{licenseData.license.daysRemaining} days</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showKeyInput ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Enter License Key</h3>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              maxLength={19}
              autoFocus
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-center font-mono text-lg tracking-wider focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowKeyInput(false); setKeyInput('') }}
                className="flex-1 px-4 py-2.5 border border-slate-600 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all"
              >
                Activate
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowKeyInput(true)}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold text-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Enter License Key
          </button>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">
          Contact your administrator for a license key.
        </p>
      </div>
    </div>
  )
}
