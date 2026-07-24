import { useParams, useNavigate } from 'react-router-dom'
import { useGetDeveloperOrganizationDetailsQuery } from '../store/api/api'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function DeveloperOrganizationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useGetDeveloperOrganizationDetailsQuery(id)

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />
  if (!data) return <p className="text-stone-400 text-center mt-20">Organization not found</p>

  const { organization: org, users, complianceItems, stats } = data

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/developer')}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{org.name}</h1>
          <p className="text-sm text-stone-500 mt-1">{org.companyId} | {org.sector} sector</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-4 shadow-sm">
          <p className="text-sm text-stone-500">Verification</p>
          <div className="mt-2"><StatusBadge status={org.verificationStatus} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 p-4 shadow-sm">
          <p className="text-sm text-stone-500">Total Compliance</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 p-4 shadow-sm">
          <p className="text-sm text-stone-500">Overdue</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats?.overdue || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 p-4 shadow-sm">
          <p className="text-sm text-stone-500">Users</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{users?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-4">Company Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">GSTIN</span>
              <span className="text-stone-900">{org.gstin || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">PAN</span>
              <span className="text-stone-900">{org.pan || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Industry</span>
              <span className="text-stone-900">{org.industry || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Company Type</span>
              <span className="text-stone-900 capitalize">{org.companyType?.replace('_', ' ') || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Employees</span>
              <span className="text-stone-900">{org.employeeCount || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Created</span>
              <span className="text-stone-900">{new Date(org.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-4">Users ({users?.length || 0})</h3>
          {users?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{user.name}</p>
                    <p className="text-xs text-stone-400">{user.email}</p>
                  </div>
                  <StatusBadge status={user.role} type="priority" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-sm py-4 text-center">No users</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-4">Recent Compliance Items</h3>
        {complianceItems?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left py-2 px-3 font-medium text-stone-500">Title</th>
                  <th className="text-left py-2 px-3 font-medium text-stone-500">Law</th>
                  <th className="text-left py-2 px-3 font-medium text-stone-500">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-stone-500">Priority</th>
                  <th className="text-left py-2 px-3 font-medium text-stone-500">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((item) => (
                  <tr key={item._id} className="border-b border-stone-50">
                    <td className="py-2 px-3 text-stone-900">{item.title}</td>
                    <td className="py-2 px-3 text-stone-600">{item.law}</td>
                    <td className="py-2 px-3"><StatusBadge status={item.status} /></td>
                    <td className="py-2 px-3"><StatusBadge status={item.priority} type="priority" /></td>
                    <td className="py-2 px-3 text-stone-500 text-xs">{new Date(item.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-stone-400 text-sm py-4 text-center">No compliance items</p>
        )}
      </div>
    </div>
  )
}
