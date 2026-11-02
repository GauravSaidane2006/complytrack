import { useState } from 'react'
import { useGetNoticesQuery, useMarkNoticeReadMutation, useMarkAllNoticesReadMutation, useDeleteNoticeMutation } from '../store/api/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

export default function Notices() {
  const [typeFilter, setTypeFilter] = useState('')
  const [readFilter, setReadFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const params = {}
  if (typeFilter) params.type = typeFilter
  if (readFilter === 'read') params.isRead = 'true'
  if (readFilter === 'unread') params.isRead = 'false'

  const { data, isLoading, refetch } = useGetNoticesQuery(params)
  const [markRead] = useMarkNoticeReadMutation()
  const [markAllRead] = useMarkAllNoticesReadMutation()
  const [deleteNotice] = useDeleteNoticeMutation()

  const handleMarkRead = async (id) => {
    try {
      await markRead(id).unwrap()
      toast.success('Marked as read')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap()
      toast.success('All notices marked as read')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteNotice(deleteId).unwrap()
      toast.success('Notice deleted')
      setDeleteId(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed')
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const notices = data?.notices || []
  const unreadCount = notices.filter(n => !n.isRead).length

  const getTypeBadge = (type) => {
    const colors = {
      compliance_change: 'bg-primary-100 text-primary-700 border-primary-200',
      status_change: 'bg-purple-100 text-purple-800 border-purple-200',
      deadline_warning: 'bg-warning-100 text-warning-700 border-warning-200',
      overdue_alert: 'bg-red-100 text-red-800 border-red-200',
      summary: 'bg-green-100 text-green-800 border-green-200',
      general: 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return colors[type] || colors.general
  }

  const getTypeLabel = (type) => {
    const labels = {
      compliance_change: 'Compliance Change',
      status_change: 'Status Change',
      deadline_warning: 'Deadline Warning',
      overdue_alert: 'Overdue Alert',
      summary: 'Summary',
      general: 'General'
    }
    return labels[type] || type
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-warning-100 text-warning-700 border-warning-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[priority] || colors.low
  }

  const getPdfUrl = (id) => `/api/notices/${id}/pdf`
  const getDownloadUrl = (id) => `/api/notices/${id}/download`

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-slate-900 mb-2">Notices & Alerts</h1>
          <p className="text-xl text-slate-600">View compliance changes, deadline warnings, and system alerts</p>
        </div>

        {unreadCount > 0 && (
          <div className="mb-6 flex items-center justify-between bg-warning-50 border border-warning-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-warning-500 rounded-full animate-pulse" />
              <span className="text-lg font-semibold text-warning-700">
                You have {unreadCount} unread notice{unreadCount !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={handleMarkAllRead}
              className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-base font-semibold hover:bg-amber-700 transition-all"
            >
              Mark All as Read
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-5 py-3 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
          >
            <option value="">All Types</option>
            <option value="compliance_change">Compliance Change</option>
            <option value="status_change">Status Change</option>
            <option value="deadline_warning">Deadline Warning</option>
            <option value="overdue_alert">Overdue Alert</option>
            <option value="summary">Summary</option>
            <option value="general">General</option>
          </select>
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="px-5 py-3 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
          >
            <option value="">All</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        {notices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center">
            <div className="text-6xl mb-4 text-slate-300">📭</div>
            <p className="text-2xl font-semibold text-slate-500">No notices found</p>
            <p className="text-lg text-slate-400 mt-2">Notices will appear here when compliance items change or deadlines approach</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
                  notice.isRead
                    ? 'border-slate-200/60'
                    : 'border-amber-300 shadow-amber-100'
                }`}
              >
                <div
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-all"
                  onClick={() => {
                    setExpandedId(expandedId === notice._id ? null : notice._id)
                    if (!notice.isRead) handleMarkRead(notice._id)
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {!notice.isRead && (
                          <div className="w-2.5 h-2.5 bg-warning-500 rounded-full flex-shrink-0" />
                        )}
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getTypeBadge(notice.type)}`}>
                          {getTypeLabel(notice.type)}
                        </span>
                        {notice.priority && (
                          <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getPriorityBadge(notice.priority)}`}>
                            {notice.priority}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl font-bold text-slate-900 ${notice.isRead ? '' : 'text-slate-900'}`}>
                        {notice.title}
                      </h3>
                      <p className="text-base text-slate-500 mt-1">{notice.message}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-slate-400">
                        {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-slate-400">
                        {format(new Date(notice.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                {expandedId === notice._id && (
                  <div className="border-t border-slate-100 p-6 bg-slate-50">
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-slate-700 mb-2">Details</h4>
                      <p className="text-base text-slate-600">{notice.message}</p>
                      {notice.changes && notice.changes.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-base font-bold text-slate-700 mb-2">Changes</h5>
                          <div className="space-y-2">
                            {notice.changes.map((change, idx) => (
                              <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200">
                                <span className="text-sm font-semibold text-slate-500">{change.field}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-red-600 line-through">{change.oldValue}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-sm text-green-600 font-semibold">{change.newValue}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={getPdfUrl(notice._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View PDF
                      </a>
                      <a
                        href={getDownloadUrl(notice._id)}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-base font-semibold hover:bg-green-700 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download PDF
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(notice._id)
                        }}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-base font-semibold hover:bg-red-700 transition-all ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Delete Notice</h3>
              <p className="text-lg text-slate-600 mb-6">Are you sure you want to delete this notice? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-5 py-3 border border-slate-200 rounded-xl text-base font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl text-base font-semibold hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
