import { useState } from 'react'
import { useGetLicenseStatusQuery, useActivateLicenseMutation, useGetAllLicensesQuery } from '../../store/api/api'
import { toast } from 'react-hot-toast'

export default function LicenseStatus() {
  const { data: status, isLoading, refetch } = useGetLicenseStatusQuery()
  const { data: allLicenses } = useGetAllLicensesQuery()
  const [activateLicense] = useActivateLicenseMutation()
  const [keyInput, setKeyInput] = useState('')

  const handleActivate = async () => {
    if (!keyInput.trim()) return toast.error('Enter a license key')
    try {
      const result = await activateLicense({ key: keyInput.trim() }).unwrap()
      toast.success(result.message)
      setKeyInput('')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid key')
    }
  }

  if (isLoading) {
    return <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
  }

  const license = status?.license
  const isActive = status?.isActive
  const isExpired = status?.isExpired

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">License Status</h3>
        <p className="text-sm text-slate-500 mb-4">Manage your ComplyTrack license key</p>

        {license ? (
          <div className={`p-4 rounded-xl border ${isActive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`font-semibold ${isActive ? 'text-green-700' : 'text-red-700'}`}>
                {isActive ? 'Active' : 'Expired'} - {license.tierLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Key</p>
                <p className="font-mono font-semibold text-slate-700">{license.key}</p>
              </div>
              <div>
                <p className="text-slate-500">Activated</p>
                <p className="text-slate-700">{new Date(license.activatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Expires</p>
                <p className="text-slate-700">{new Date(license.expiresAt).toLocaleDateString()}</p>
              </div>
              {isActive && (
                <div>
                  <p className="text-slate-500">Remaining</p>
                  <p className="text-primary-600 font-bold">{license.daysRemaining} days</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-700 font-medium">No active license. Enter a key below to activate.</p>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            maxLength={19}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          <button
            onClick={handleActivate}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all"
          >
            Activate
          </button>
        </div>
      </div>

      {allLicenses?.licenses?.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">License History</h3>
          <div className="space-y-2">
            {allLicenses.licenses.map((lic) => (
              <div key={lic._id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl text-sm">
                <div className={`w-2 h-2 rounded-full ${lic.isRevoked ? 'bg-red-400' : lic.expiresAt < new Date() ? 'bg-amber-400' : 'bg-green-400'}`} />
                <span className="font-mono text-slate-700">{lic.key}</span>
                <span className="text-slate-500">{lic.tierLabel}</span>
                <span className="text-slate-400">{new Date(lic.activatedAt).toLocaleDateString()}</span>
                {lic.isRevoked && <span className="text-red-500 text-xs font-semibold">REVOKED</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
