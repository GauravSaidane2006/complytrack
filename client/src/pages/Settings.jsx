import { useState } from 'react'
import { useGetOrganizationQuery, useUpdateOrganizationMutation, useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useRefreshHealthScoreMutation } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import LicenseStatus from '../components/license/LicenseStatus'
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

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Organization</h2>
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
              <input type="text" value={currentOrg.name || ''}
                onChange={(e) => setOrgForm({ ...org, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
              <input type="text" value={currentOrg.industry || ''}
                onChange={(e) => setOrgForm({ ...org, industry: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">GSTIN</label>
              <input type="text" value={currentOrg.gstin || ''}
                onChange={(e) => setOrgForm({ ...org, gstin: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">PAN</label>
              <input type="text" value={currentOrg.pan || ''}
                onChange={(e) => setOrgForm({ ...org, pan: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
              <input type="text" value={currentOrg.city || ''}
                onChange={(e) => setOrgForm({ ...org, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
              <input type="text" value={currentOrg.state || ''}
                onChange={(e) => setOrgForm({ ...org, state: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div>
              <span className="text-sm text-slate-500">Compliance Health: </span>
              <span className={`text-sm font-bold ${(org?.complianceHealthScore || 0) >= 70 ? 'text-success-600' : (org?.complianceHealthScore || 0) >= 40 ? 'text-warning-600' : 'text-danger-500'}`}>
                {org?.complianceHealthScore || 0}%
              </span>
              <button type="button" onClick={handleRefreshHealth}
                className="ml-2 text-xs text-primary-500 hover:text-primary-700 font-semibold transition-colors">Refresh</button>
            </div>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-primary-700 shadow-md shadow-primary/20 transition-all duration-200">
              Save Organization
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <input type="text" defaultValue={profile?.name || ''}
                onChange={(e) => setProfileForm({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input type="text" defaultValue={profile?.phone || ''}
                onChange={(e) => setProfileForm({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
          </div>
          <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-primary-700 shadow-md shadow-primary/20 transition-all duration-200">
            Save Profile
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
            <input type="password" value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <input type="password" value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-primary-700 shadow-md shadow-primary/20 transition-all duration-200">
            Change Password
          </button>
        </form>
      </div>

      <LicenseStatus />
    </div>
  )
}
