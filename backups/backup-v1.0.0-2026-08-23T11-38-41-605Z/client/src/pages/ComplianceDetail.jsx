import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  useGetComplianceItemQuery,
  useUpdateComplianceStatusMutation,
  useUpdateComplianceItemMutation,
  useDeleteComplianceItemMutation,
  useGetUsersQuery,
  useAssignComplianceUsersMutation,
  useUploadComplianceProofMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation
} from '../store/api/api'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import { toast } from 'react-hot-toast'

export default function ComplianceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, accessToken } = useSelector((state) => state.auth)
  const { data: item, isLoading } = useGetComplianceItemQuery(id)
  const [updateStatus] = useUpdateComplianceStatusMutation()
  const [updateComplianceItem] = useUpdateComplianceItemMutation()
  const [deleteComplianceItem] = useDeleteComplianceItemMutation()
  const { data: users = [] } = useGetUsersQuery()
  const [assignUsers] = useAssignComplianceUsersMutation()
  const [uploadProof] = useUploadComplianceProofMutation()
  const { data: comments = [] } = useGetCommentsQuery(id)
  const [addComment] = useAddCommentMutation()
  const [deleteComment] = useDeleteCommentMutation()

  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [statusModal, setStatusModal] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [reminderDays, setReminderDays] = useState([])
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [customDay, setCustomDay] = useState('')
  const [savingReminders, setSavingReminders] = useState(false)
  const fileInputRef = useRef(null)

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />
  if (!item) return <p className="text-slate-500 mt-20 text-center text-lg">Item not found</p>

  const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'completed' && item.status !== 'waived'
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isManager = user?.role === 'manager'
  const isDevUser = user?.role === 'developer' || user?.role === 'superadmin'
  const canAssign = isAdmin || isManager || isDevUser

  // Check if current user is assigned to this item
  const isAssignedToMe = item.assignedTo?.some(u => (u._id || u) === user?._id)

  // Can this user manage this item? (admin/developer/superadmin = all, manager/user = only assigned)
  const canManage = isAdmin || isDevUser || isAssignedToMe
  // Can this user change status? Managers can work on any task in the org.
  // admin/developer/superadmin = all, manager = all, user = only assigned
  const canChangeStatus = isAdmin || isDevUser || isManager || isAssignedToMe

  const currentReminderDays = reminderDays.length > 0
    ? reminderDays
    : (item.reminderSettings?.daysBefore?.length ? item.reminderSettings.daysBefore : [7])
  const currentReminderEnabled = reminderDays.length > 0
    ? reminderEnabled
    : (item.reminderSettings?.enabled !== undefined ? item.reminderSettings.enabled : true)
  const isPDF = (name) => /\.pdf$/i.test(name)

  const getFileUrl = (fileUrl, download = false) => {
    const filename = fileUrl?.split('/').pop()
    if (!filename) return '#'
    const base = `/api/files/${encodeURIComponent(filename)}?token=${accessToken}`
    return download ? `${base}&download=1` : base
  }

  const handleStatusChange = async (status) => {
    if (status === 'completed' && item.proofRequired && !item.proofUploaded && !proofFile) {
      toast.error('Proof upload is required before marking as complete')
      return
    }
    try {
      await updateStatus({ id, status }).unwrap()
      toast.success('Status updated')
      setStatusModal(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed')
    }
  }

  const handleAssign = async () => {
    setAssigning(true)
    try {
      await assignUsers({ id, assignedTo: selectedUsers }).unwrap()
      toast.success('Users assigned successfully')
      setShowAssign(false)
    } catch (err) {
      toast.error(err?.data?.message || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteComplianceItem(id).unwrap()
      toast.success('Compliance item deleted')
      navigate('/compliance')
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      await addComment({ complianceId: id, text: commentText.trim() }).unwrap()
      setCommentText('')
      toast.success('Comment added')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return
    try {
      await deleteComment(deleteCommentId).unwrap()
      toast.success('Comment deleted')
      setDeleteCommentId(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete comment')
    }
  }

  const handleProofUpload = async () => {
    if (!proofFile) return
    setUploadingProof(true)
    try {
      const formData = new FormData()
      formData.append('proof', proofFile)
      await uploadProof({ id, formData }).unwrap()
      toast.success('Proof uploaded successfully')
      setProofFile(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Upload failed')
    } finally {
      setUploadingProof(false)
    }
  }

  const toggleReminderDay = (day) => {
    setReminderDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => b - a)
    )
  }

  const addCustomDay = () => {
    const val = parseInt(customDay, 10)
    if (isNaN(val) || val < 1 || val > 365) {
      toast.error('Enter a value between 1 and 365')
      return
    }
    if (!reminderDays.includes(val)) {
      setReminderDays(prev => [...prev, val].sort((a, b) => b - a))
    }
    setCustomDay('')
  }

  const handleSaveReminders = async () => {
    setSavingReminders(true)
    try {
      await updateComplianceItem({
        id,
        reminderSettings: {
          daysBefore: currentReminderDays,
          enabled: currentReminderEnabled
        }
      }).unwrap()
      toast.success('Reminder settings saved')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save reminders')
    } finally {
      setSavingReminders(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetProof(file)
  }

  const validateAndSetProof = (file) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, PNG, and JPG files are allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB')
      return
    }
    setProofFile(file)
  }

  const openAssignModal = () => {
    setSelectedUsers(item.assignedTo?.map(u => u._id) || [])
    setShowAssign(true)
  }

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  return (
    <div className="w-full">
      {/* Back Navigation - Clear and Prominent */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/compliance"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Compliance
        </Link>
        <div className="flex gap-2">
          {canManage && (
            <Link
              to={`/compliance/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          )}
          {canManage && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Title & Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{item.title}</h1>
              <div className="flex gap-2">
                <StatusBadge status={item.status} />
                <StatusBadge status={item.priority} type="priority" />
              </div>
            </div>

            {item.description && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
                <p className="text-base text-slate-700 leading-relaxed">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Law</p>
                <p className="text-lg font-semibold text-slate-900">{item.law}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                <p className="text-lg font-semibold text-slate-900 capitalize">{item.category}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Frequency</p>
                <p className="text-lg font-semibold text-slate-900 capitalize">{item.frequency}</p>
              </div>
              <div className={`p-4 rounded-xl ${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
                <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>Due Date</p>
                <p className={`text-lg font-semibold ${isOverdue ? 'text-red-700' : 'text-slate-900'}`}>
                  {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {isOverdue && <p className="text-sm text-red-500 mt-1">Overdue</p>}
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Risk Score</p>
                <p className="text-lg font-semibold text-slate-900">{item.riskScore || 0}/100</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Recurring</p>
                <p className="text-lg font-semibold text-slate-900">{item.isRecurring ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {item.regulation && (
              <div className="mt-5 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Regulation</p>
                <p className="text-base text-slate-700">{item.regulation}</p>
              </div>
            )}

            {item.assignedTo?.length > 0 && (
              <div className="mt-5 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Assigned To</p>
                <div className="flex flex-wrap gap-2">
                  {item.assignedTo.map((u, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                      {u.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Proof Documents Section */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Proof & Documents</h2>
            {item.documents?.length > 0 ? (
              <div className="space-y-3">
                {item.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPDF(doc.name) ? 'bg-red-100' : 'bg-primary-100'}`}>
                        {isPDF(doc.name) ? (
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={getFileUrl(doc.url)} target="_blank" rel="noreferrer"
                        className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        View
                      </a>
                      <a href={getFileUrl(doc.url, true)}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-base">No documents uploaded yet.</p>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Comments</h2>

            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment about work progress..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || submittingComment}
                    loading={submittingComment}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">{comment.user?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' at '}
                          {new Date(comment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {(comment.user?._id === user?._id || user?.role === 'admin' || user?.role === 'superadmin') && (
                          <button
                            onClick={() => setDeleteCommentId(comment._id)}
                            className="opacity-0 group-hover:opacity-100 ml-auto p-1 text-slate-400 hover:text-danger-500 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-base text-center py-4">No comments yet. Be the first to update on progress.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Assignment Section - Admin/Manager/Developer Only */}
          {canAssign && (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Assignment</h2>
                <Button variant="ghost" size="sm" onClick={openAssignModal}>
                  Edit
                </Button>
              </div>
              {item.assignedTo?.length > 0 ? (
                <div className="space-y-2">
                  {item.assignedTo.map((u, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white font-bold text-xs">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm mb-3">No users assigned yet.</p>
                  <Button variant="outline" size="sm" onClick={openAssignModal}>
                    Assign Users
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Proof Upload Section */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Upload Proof</h2>
            {item.proofRequired && (
              <div className="mb-3 p-3 bg-warning-50 border border-warning-200 rounded-xl">
                <p className="text-sm font-semibold text-warning-700">Proof required to mark as complete</p>
              </div>
            )}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragOver ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => { if (e.target.files[0]) validateAndSetProof(e.target.files[0]) }}
                className="hidden"
              />
              <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-slate-600">
                {dragOver ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>
            </div>

            {proofFile && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPDF(proofFile.name) ? 'bg-red-100' : 'bg-primary-100'}`}>
                      {isPDF(proofFile.name) ? (
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{proofFile.name}</p>
                      <p className="text-xs text-slate-500">{(proofFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => setProofFile(null)} className="p-1 text-slate-400 hover:text-danger-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Button
                  onClick={handleProofUpload}
                  disabled={uploadingProof}
                  loading={uploadingProof}
                  className="w-full mt-3"
                >
                  Upload Proof
                </Button>
              </div>
            )}

            {item.proofUploaded && !proofFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-semibold text-green-700">Proof uploaded</p>
              </div>
            )}
          </div>

          {/* Alerts & Reminders */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Alerts & Reminders</h2>
              <button
                onClick={() => setReminderEnabled(prev => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  currentReminderEnabled ? 'bg-primary-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  currentReminderEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {currentReminderEnabled && (
              <>
                <p className="text-sm text-slate-500 mb-3">Get alerted before the due date:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[30, 14, 7, 3, 1].map(day => (
                    <button
                      key={day}
                      onClick={() => toggleReminderDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                        currentReminderDays.includes(day)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                      }`}
                    >
                      {day}d
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={customDay}
                    onChange={(e) => setCustomDay(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomDay()}
                    placeholder="Custom days"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  <Button variant="outline" size="sm" onClick={addCustomDay}>
                    Add
                  </Button>
                </div>

                {currentReminderDays.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {currentReminderDays.map(day => (
                      <span key={day} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold">
                        {day} day{day !== 1 ? 's' : ''} before
                        <button onClick={() => toggleReminderDay(day)} className="ml-0.5 text-primary-400 hover:text-primary-700">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleSaveReminders}
                  disabled={savingReminders}
                  loading={savingReminders}
                  className="w-full"
                >
                  Save Reminders
                </Button>
              </>
            )}

            {!currentReminderEnabled && (
              <p className="text-sm text-slate-400">Reminders are paused for this item.</p>
            )}
          </div>

          {/* Update Status */}
          {canChangeStatus && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Update Status</h2>
            <div className="space-y-2">
              {['pending', 'in-progress', 'completed', 'overdue', 'waived'].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    if (status === 'completed' && item.proofRequired && !item.proofUploaded) {
                      toast.error('Upload proof first before marking as complete')
                      return
                    }
                    setStatusModal({ newStatus: status })
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-semibold rounded-xl border transition-all duration-200 ${
                    item.status === status
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-600 shadow-md shadow-primary/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Timeline</h2>
            <div className="space-y-3 text-base">
              <div className="flex justify-between text-slate-600">
                <span>Created</span>
                <span className="font-medium text-slate-900">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Last Updated</span>
                <span className="font-medium text-slate-900">{new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              {item.completedAt && (
                <div className="flex justify-between text-slate-600">
                  <span>Completed</span>
                  <span className="font-medium text-green-700">{new Date(item.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Assign Users" size="md">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {users.map((u) => (
            <label key={u._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedUsers.includes(u._id) ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={selectedUsers.includes(u._id)}
                onChange={() => toggleUser(u._id)}
                className="w-4 h-4 text-primary-500 rounded border-slate-300 focus:ring-primary-500"
              />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-xs">
                {u.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button>
          <Button onClick={handleAssign} loading={assigning}>Save Assignment</Button>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Status" size="sm">
        <p className="text-base text-slate-600 mb-5">Change status to <strong className="text-slate-900">{statusModal?.newStatus}</strong>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setStatusModal(null)}>Cancel</Button>
          <Button onClick={() => handleStatusChange(statusModal?.newStatus)}>Update</Button>
        </div>
      </Modal>

      {/* Delete Comment Modal */}
      <Modal isOpen={!!deleteCommentId} onClose={() => setDeleteCommentId(null)} title="Delete Comment" size="sm">
        <p className="text-base text-slate-600 mb-5">Are you sure you want to delete this comment?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteCommentId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteComment}>Delete</Button>
        </div>
      </Modal>

      {/* Delete Compliance Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Compliance Item" size="sm">
        <p className="text-base text-slate-600 mb-5">Are you sure you want to delete <strong>{item?.title}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
