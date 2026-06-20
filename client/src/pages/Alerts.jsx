import { useGetAlertsQuery, useMarkAlertReadMutation, useMarkAllAlertsReadMutation, useGenerateDeadlineAlertsMutation } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { toast } from 'react-hot-toast'

const alertIcons = {
  deadline: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'regulation-change': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  'show-cause': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  risk: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  reminder: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  general: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

export default function Alerts() {
  const { data: alertsData, isLoading } = useGetAlertsQuery()
  const [markRead] = useMarkAlertReadMutation()
  const [markAllRead] = useMarkAllAlertsReadMutation()
  const [generateAlerts] = useGenerateDeadlineAlertsMutation()

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const alerts = alertsData?.alerts || []

  const handleMarkRead = async (id) => {
    try {
      await markRead(id).unwrap()
    } catch (err) { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap()
      toast.success('All alerts marked as read')
    } catch (err) {
      toast.error('Failed')
    }
  }

  const handleGenerate = async () => {
    try {
      await generateAlerts().unwrap()
      toast.success('Deadline alerts generated')
    } catch (err) {
      toast.error('Failed to generate')
    }
  }

  return (
    <div>
      <PageHeader
        title="Alerts & Notifications"
        description="Stay informed about deadlines and compliance changes"
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={handleGenerate}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
              Check Deadlines
            </button>
            <button onClick={handleMarkAllRead}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
              Mark All Read
            </button>
          </div>
        }
      />

      {alerts.length === 0 ? (
        <EmptyState title="No alerts" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 cursor-pointer hover:shadow-sm transition-shadow ${
                !alert.isRead ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'
              }`}
              onClick={() => !alert.isRead && handleMarkRead(alert._id)}
            >
              <div className={`p-2 rounded-lg ${
                alert.priority === 'high' || alert.priority === 'critical' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  alert.priority === 'high' || alert.priority === 'critical' ? 'text-red-600' : 'text-blue-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={alertIcons[alert.type] || alertIcons.general} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-medium ${!alert.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                    {alert.title}
                  </p>
                  {!alert.isRead && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
                </div>
                <p className="text-xs text-slate-500">{alert.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={alert.type} />
                  <span className="text-xs text-slate-400">{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
