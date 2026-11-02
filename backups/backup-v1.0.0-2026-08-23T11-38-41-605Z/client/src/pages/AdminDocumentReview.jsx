import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  useGetDeveloperPendingVerificationsQuery,
  useReviewDocumentMutation
} from '../store/api/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { toast } from 'react-hot-toast'

export default function AdminDocumentReview() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [reviewing, setReviewing] = useState(null)

  const { data, isLoading, refetch } = useGetDeveloperPendingVerificationsQuery(
    statusFilter === 'all' ? {} : { status: statusFilter }
  )
  const [reviewDocument] = useReviewDocumentMutation()

  const verifications = data?.verifications || []

  const groupedByOrg = verifications.reduce((acc, v) => {
    const orgId = v.organization?._id || 'unknown'
    if (!acc[orgId]) {
      acc[orgId] = {
        org: v.organization,
        docs: []
      }
    }
    acc[orgId].docs.push(v)
    return acc
  }, {})

  const handleApprove = async (verificationId) => {
    setReviewing(verificationId)
    try {
      await reviewDocument({ id: verificationId, status: 'approved' }).unwrap()
      toast.success('Document approved')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve')
    } finally {
      setReviewing(null)
    }
  }

  const handleRejectClick = (verification) => {
    setRejectModal(verification)
    setRejectReason('')
  }

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters')
      return
    }
    setReviewing(rejectModal._id)
    try {
      await reviewDocument({
        id: rejectModal._id,
        status: 'rejected',
        rejectionReason: rejectReason.trim()
      }).unwrap()
      toast.success('Document rejected')
      setRejectModal(null)
      setRejectReason('')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject')
    } finally {
      setReviewing(null)
    }
  }

  const getFileUrl = (fileUrl, download = false) => {
    const filename = fileUrl?.split('/').pop()
    if (!filename) return '#'
    const base = `/api/files/public/${encodeURIComponent(filename)}`
    return download ? `${base}?download=1` : base
  }

  const handleViewDoc = (doc) => {
    const url = getFileUrl(doc.fileUrl)
    if (url === '#') {
      toast.error('File not found')
      return
    }
    window.open(url, '_blank')
  }

  const formatDocType = (type) => type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || ''

  if (user?.role !== 'admin' && user?.role !== 'superadmin' && user?.role !== 'developer') {
    return (
      <div className="min-h-screen canvas-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Access Denied</p>
          <button onClick={() => navigate('/dashboard')} className="text-primary-400 hover:text-primary-300">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Document Review</h1>
          <p className="text-slate-500 mt-1">Review and approve organization verification documents</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              statusFilter === status
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="mt-20" />
      ) : Object.keys(groupedByOrg).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 shadow-sm text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500 text-lg">No {statusFilter === 'all' ? '' : statusFilter} documents found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByOrg).map(([orgId, { org, docs }]) => (
            <div key={orgId} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              {/* Organization Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{org?.name || 'Unknown Organization'}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      {org?.companyId && (
                        <span className="text-xs font-medium text-slate-500">ID: {org.companyId}</span>
                      )}
                      {org?.sector && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-primary-100 text-primary-600 rounded-md capitalize">
                          {org.sector}
                        </span>
                      )}
                      {org?.verificationStatus && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          org.verificationStatus === 'verified' ? 'bg-success-100 text-success-700' :
                          org.verificationStatus === 'rejected' ? 'bg-danger-100 text-danger-600' :
                          org.verificationStatus === 'under_review' ? 'bg-warning-100 text-warning-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {org.verificationStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Documents */}
              <div className="divide-y divide-slate-100">
                {docs.map((doc) => (
                  <div key={doc._id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        doc.status === 'approved' ? 'bg-success-100 text-success-600' :
                        doc.status === 'rejected' ? 'bg-danger-100 text-danger-500' :
                        'bg-warning-100 text-warning-600'
                      }`}>
                        {doc.status === 'approved' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : doc.status === 'rejected' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{doc.originalName}</p>
                        <p className="text-xs text-slate-500">{formatDocType(doc.documentType)}</p>
                        {doc.rejectionReason && (
                          <p className="text-xs text-danger-500 mt-1">Reason: {doc.rejectionReason}</p>
                        )}
                        {doc.reviewedAt && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Reviewed: {new Date(doc.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewDoc(doc)}
                        className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <a
                        href={getFileUrl(doc.fileUrl, true)}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                      {doc.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(doc._id)}
                            disabled={reviewing === doc._id}
                            className="px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {reviewing === doc._id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectClick(doc)}
                            disabled={reviewing === doc._id}
                            className="px-3 py-1.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {doc.status === 'approved' && (
                        <span className="text-xs font-semibold text-success-600 px-2 py-1 bg-success-50 rounded-lg">Approved</span>
                      )}
                      {doc.status === 'rejected' && (
                        <span className="text-xs font-semibold text-danger-500 px-2 py-1 bg-danger-50 rounded-lg">Rejected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Document" size="md">
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-sm font-semibold text-slate-900">{rejectModal?.originalName}</p>
            <p className="text-xs text-slate-500">{formatDocType(rejectModal?.documentType)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Reason for Rejection <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a detailed reason for rejecting this document (min 10 characters)..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-danger-500/20 focus:border-danger-500 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">{rejectReason.length}/500 characters</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectModal(null)}
              className="px-5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || rejectReason.trim().length < 10 || reviewing === rejectModal?._id}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-danger-500 to-danger-600 text-white rounded-xl hover:from-rose-700 hover:to-red-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {reviewing === rejectModal?._id ? 'Rejecting...' : 'Reject Document'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
