import { useState } from 'react'
import { useGetAlertsQuery, useMarkAlertReadMutation, useMarkAllAlertsReadMutation, useGenerateDeadlineAlertsMutation, useDeleteAlertMutation } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
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
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [readFilter, setReadFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const params = { page, limit: 15 }
  if (typeFilter) params.type = typeFilter
  if (readFilter) params.isRead = readFilter

  const { data: alertsData, isLoading } = useGetAlertsQuery(params)
  const [markRead] = useMarkAlertReadMutation()
  const [markAllRead] = useMarkAllAlertsReadMutation()
  const [generateAlerts] = useGenerateDeadlineAlertsMutation()
  const [deleteAlert] = useDeleteAlertMutation()

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const alerts = alertsData?.alerts || []
  const pagination = alertsData?.pagination || {}

  const handleMarkRead = async (id) => {
    try { await markRead(id).unwrap() } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap()
      toast.success('All alerts marked as read')
    } catch { toast.error('Failed') }
  }

  const handleGenerate = async () => {
    try {
      await generateAlerts().unwrap()
      toast.success('Deadline alerts generated')
    } catch { toast.error('Failed to generate') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteAlert(deleteId).unwrap()
      toast.success('Alert deleted')
      setDeleteId(null)
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <PageHeader
        title="Alerts & Notifications"
        description="Stay informed about deadlines and compliance changes"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleGenerate}>
              Check Deadlines
            </Button>
            <Button onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
            <option value="">All Types</option>
            <option value="deadline">Deadline</option>
            <option value="reminder">Reminder</option>
            <option value="regulation-change">Regulation Change</option>
            <option value="show-cause">Show Cause</option>
            <option value="risk">Risk</option>
            <option value="general">General</option>
          </select>
          <select value={readFilter} onChange={(e) => { setReadFilter(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
            <option value="">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
      </div>

      {alerts.length === 0 ? (
        <EmptyState title="No alerts" description="You're all caught up!" />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-4 hover:shadow-sm transition-all duration-200 ${
                !alert.isRead ? 'border-primary-300 bg-primary-50/40 shadow-sm' : 'border-slate-200/60'
              }`}
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                alert.priority === 'high' || alert.priority === 'critical' ? 'bg-danger-100' : 'bg-primary-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  alert.priority === 'high' || alert.priority === 'critical' ? 'text-danger-500' : 'text-primary-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={alertIcons[alert.type] || alertIcons.general} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-medium ${!alert.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                    {alert.title}
                  </p>
                  {!alert.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-500">{alert.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={alert.type} />
                  <span className="text-xs text-slate-400">{new Date(alert.createdAt).toLocaleString()}</span>
                  {alert.complianceItem?.title && (
                    <span className="text-xs text-slate-400">· {alert.complianceItem.title}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!alert.isRead && (
                  <button onClick={() => handleMarkRead(alert._id)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Mark as read">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button onClick={() => setDeleteId(alert._id)}
                  className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                  title="Delete">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-slate-200/60 px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.pages} ({pagination.total} alerts)
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Alert" size="sm">
        <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete this alert?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
