import { useState } from 'react'
import { useGetOrganizationQuery, useUpdateOrganizationMutation, useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useRefreshHealthScoreMutation } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function Settings() {
  const { data: org, isLoading: orgLoading } = useGetOrganizationQuery()
  const { data: profile } = useGetProfileQuery()
  const [updateOrg] = useUpdateOrganizationMutation()
  const [updateProfile] = useUpdateProfileMutation()
  const [changePassword] = useChangePasswordMutation()
  const [refreshHealth] = useRefreshHealthScoreMutation()

  const [orgForm, setOrgForm] = useState(null)
  const [profileForm, setProfileForm] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })

  if (orgLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const currentOrg = orgForm || org || {}
  const currentProfile = profileForm || profile || {}

  const handleOrgSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateOrg(orgForm).unwrap()
      toast.success('Organization updated')
      setOrgForm(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(profileForm).unwrap()
      toast.success('Profile updated')
      setProfileForm(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    try {
      await changePassword(passwordForm).unwrap()
      toast.success('Password changed')
      setPasswordForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const handleRefreshHealth = async () => {
    try {
      const result = await refreshHealth().unwrap()
      toast.success(`Health score: ${result.complianceHealthScore}%`)
    } catch (err) {
      toast.error('Failed to refresh')
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title="Settings" description="Manage your organization and account" />

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Organization</h2>
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input type="text" value={currentOrg.name || ''}
                onChange={(e) => setOrgForm({ ...org, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <input type="text" value={currentOrg.industry || ''}
                onChange={(e) => setOrgForm({ ...org, industry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
              <input type="text" value={currentOrg.gstin || ''}
                onChange={(e) => setOrgForm({ ...org, gstin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN</label>
              <input type="text" value={currentOrg.pan || ''}
                onChange={(e) => setOrgForm({ ...org, pan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input type="text" value={currentOrg.city || ''}
                onChange={(e) => setOrgForm({ ...org, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input type="text" value={currentOrg.state || ''}
                onChange={(e) => setOrgForm({ ...org, state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-sm text-slate-500">Compliance Health: </span>
              <span className={`text-sm font-bold ${(org?.complianceHealthScore || 0) >= 70 ? 'text-emerald-600' : (org?.complianceHealthScore || 0) >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {org?.complianceHealthScore || 0}%
              </span>
              <button type="button" onClick={handleRefreshHealth}
                className="ml-2 text-xs text-emerald-600 hover:text-emerald-700">Refresh</button>
            </div>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
              Save Organization
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" defaultValue={profile?.name || ''}
                onChange={(e) => setProfileForm({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" defaultValue={profile?.phone || ''}
                onChange={(e) => setProfileForm({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            Save Profile
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input type="password" value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input type="password" value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}
