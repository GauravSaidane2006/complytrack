import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetDeveloperStatsQuery, useGetDeveloperOrganizationsQuery } from '../store/api/api'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function DeveloperDashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useGetDeveloperStatsQuery()
  const [search, setSearch] = useState('')
  const { data: orgsData, isLoading: orgsLoading } = useGetDeveloperOrganizationsQuery({ search, limit: 10 })

  if (statsLoading) return <LoadingSpinner size="lg" className="mt-20" />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Developer Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Global overview of all organizations and compliance data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Organizations"
          value={stats?.organizations?.total || 0}
          color="teal"
          icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          color="primary"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
        <StatCard
          title="Compliance Score"
          value={`${stats?.compliance?.score || 0}%`}
          color="amber"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          subtitle={`${stats?.compliance?.completed || 0} completed`}
        />
        <StatCard
          title="Overdue Items"
          value={stats?.compliance?.overdue || 0}
          color="rose"
          icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Active Compliance"
          value={stats?.compliance?.active || 0}
          color="teal"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
        <StatCard
          title="Total Contracts"
          value={stats?.contracts?.total || 0}
          color="primary"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <StatCard
          title="Risk Assessments"
          value={stats?.risks?.total || 0}
          color="rose"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
        <StatCard
          title="Unread Alerts"
          value={stats?.alerts?.unread || 0}
          color="amber"
          icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">All Organizations</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 w-64"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {orgsLoading ? (
          <LoadingSpinner size="md" className="py-8" />
        ) : orgsData?.organizations?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Sector</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Compliance</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Users</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Created</th>
                </tr>
              </thead>
              <tbody>
                {orgsData.organizations.map((org) => (
                  <tr
                    key={org._id}
                    className="border-b border-slate-50 hover:bg-primary-50/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/developer/organizations/${org._id}`)}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{org.name}</p>
                        <p className="text-xs text-slate-400">{org.companyId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600">{org.sector || '-'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={org.verificationStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-medium">{org.stats?.complianceTotal || 0}</span>
                        {org.stats?.complianceOverdue > 0 && (
                          <span className="text-xs text-danger-500">({org.stats.complianceOverdue} overdue)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{org.stats?.users || 0}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm py-8 text-center">No organizations found</p>
        )}

        {orgsData?.pagination?.pages > 1 && (
          <div className="mt-4 flex justify-center">
            <p className="text-xs text-slate-400">
              Page {orgsData.pagination.page} of {orgsData.pagination.pages} ({orgsData.pagination.total} total)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
