import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetComplianceItemsQuery, useDeleteComplianceItemMutation, useGetUsersQuery, useAssignComplianceUsersMutation, useBulkAssignComplianceMutation } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { toast } from 'react-hot-toast'

export default function ComplianceList() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [lawFilter, setLawFilter] = useState(searchParams.get('law') || '')
  const [frequencyFilter, setFrequencyFilter] = useState('')
  const [hideCompletedOneTime, setHideCompletedOneTime] = useState(false)
  const [search, setSearch] = useState('')

  const [selectedIds, setSelectedIds] = useState([])
  const [deleteId, setDeleteId] = useState(null)
  const [assignModal, setAssignModal] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)

  const params = { page, limit: 20 }
  if (statusFilter) {
    params.status = statusFilter === 'incomplete'
      ? 'pending,in-progress,overdue,waived'
      : statusFilter
  }
  if (lawFilter) params.law = lawFilter
  if (frequencyFilter) params.frequency = frequencyFilter
  if (search) params.search = search

  const { data, isLoading } = useGetComplianceItemsQuery(params)
  const [deleteCompliance] = useDeleteComplianceItemMutation()
  const { data: users = [] } = useGetUsersQuery()
  const [assignUsers] = useAssignComplianceUsersMutation()
  const [bulkAssign] = useBulkAssignComplianceMutation()

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const items = data?.items || []
  const filteredItems = hideCompletedOneTime
    ? items.filter(item => !(item.frequency === 'one-time' && item.status === 'completed'))
    : items
  const pagination = data?.pagination || {}

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isManager = user?.role === 'manager'
  const canManage = isAdmin || isManager

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCompliance(deleteId).unwrap()
      toast.success('Compliance item deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed')
    }
  }

  const openAssignModal = (itemId, currentAssigned = []) => {
    setAssignModal(itemId)
    setSelectedUsers(currentAssigned.map(u => u._id || u))
  }

  const handleAssign = async () => {
    setAssigning(true)
    try {
      await assignUsers({ id: assignModal, assignedTo: selectedUsers }).unwrap()
      toast.success('Users assigned successfully')
      setAssignModal(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredItems.map(i => i._id))
    }
  }

  const openBulkAssign = () => {
    if (selectedIds.length === 0) {
      toast.error('Select compliance items first')
      return
    }
    setAssignModal('bulk')
    setSelectedUsers([])
  }

  const handleBulkAssign = async () => {
    setAssigning(true)
    try {
      await bulkAssign({ complianceIds: selectedIds, assignedTo: selectedUsers }).unwrap()
      toast.success(`${selectedIds.length} items assigned successfully`)
      setAssignModal(null)
      setSelectedIds([])
      setBulkMode(false)
    } catch (err) {
      toast.error(err?.data?.message || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Compliance Obligations"
        description={user?.role === 'user' ? 'View your assigned compliance items' : 'Track and manage all your compliance items'}
      />

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm w-full">
        <div className="p-5 border-b border-slate-200/60">
          <div className="flex flex-col lg:flex-row gap-3">
            <input
              type="text"
              placeholder="Search compliance items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 px-4 py-3 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={lawFilter} onChange={(e) => setLawFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
              <option value="">All Laws</option>
              <option value="GST Act">GST Act</option>
              <option value="Companies Act">Companies Act</option>
              <option value="Income Tax Act">Income Tax Act</option>
              <option value="Labour Laws">Labour Laws</option>
              <option value="PF Act">PF Act</option>
              <option value="ESI Act">ESI Act</option>
              <option value="Factory Act">Factory Act</option>
              <option value="Environment Act">Environment Act</option>
            </select>
            <select value={frequencyFilter} onChange={(e) => setFrequencyFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
              <option value="">All Frequencies</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-Time</option>
              <option value="event-based">Event-Based</option>
            </select>
            {canManage && (
              <button
                onClick={() => { setBulkMode(!bulkMode); setSelectedIds([]); }}
                className={`px-4 py-3 rounded-xl text-base font-semibold border transition-all ${
                  bulkMode
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {bulkMode ? 'Exit Bulk' : 'Bulk Assign'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideCompletedOneTime}
                onChange={(e) => setHideCompletedOneTime(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 font-medium">Hide completed registrations</span>
            </label>
          </div>

          {bulkMode && selectedIds.length > 0 && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
              <span className="text-sm font-semibold text-primary-700">{selectedIds.length} selected</span>
              <button
                onClick={toggleSelectAll}
                className="text-sm font-semibold text-primary-600 hover:text-primary-800 underline"
              >
                {selectedIds.length === filteredItems.length ? 'Deselect all' : 'Select all'}
              </button>
              <div className="ml-auto">
                <Button size="sm" onClick={openBulkAssign}>Assign to Users</Button>
              </div>
            </div>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            title="No compliance items"
            description="Create your first compliance item to get started."
            action={() => navigate('/compliance/new')}
            actionLabel="Create Item"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  {bulkMode && (
                    <th className="px-5 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                      />
                    </th>
                  )}
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Law</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Frequency</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Assigned To</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Due Date</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  {canManage && <th className="text-right px-5 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-primary-50/50 transition-colors group ${bulkMode ? '' : 'cursor-pointer'}`}
                    onClick={() => !bulkMode && navigate(`/compliance/${item._id}`)}
                  >
                    {bulkMode && (
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => toggleSelect(item._id)}
                          className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                        />
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <p className={`text-base font-semibold ${bulkMode ? 'text-slate-900' : 'text-slate-900 group-hover:text-primary-600 transition-colors'}`}>{item.title}</p>
                        {item.frequency === 'one-time' && item.status === 'completed' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">DONE</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 md:hidden mt-1">{item.law}</p>
                    </td>
                    <td className="px-5 py-4 text-base text-slate-600 hidden md:table-cell">{item.law}</td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        item.frequency === 'monthly' ? 'bg-blue-100 text-blue-700' :
                        item.frequency === 'quarterly' ? 'bg-purple-100 text-purple-700' :
                        item.frequency === 'yearly' ? 'bg-green-100 text-green-700' :
                        item.frequency === 'one-time' ? 'bg-slate-100 text-slate-600' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {item.frequency}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                      {item.assignedTo?.length > 0 ? (
                        <div className="flex flex-wrap gap-1 items-center">
                          {item.assignedTo.slice(0, 2).map((u, i) => (
                            <span key={i} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                              {u.name}
                            </span>
                          ))}
                          {item.assignedTo.length > 2 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                              +{item.assignedTo.length - 2}
                            </span>
                          )}
                          {canManage && (
                            <button
                              onClick={() => openAssignModal(item._id, item.assignedTo)}
                              className="ml-1 p-1 text-slate-400 hover:text-primary-500 rounded transition-colors"
                              title="Assign users"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-slate-400">Unassigned</span>
                          {canManage && (
                            <button
                              onClick={() => openAssignModal(item._id, [])}
                              className="p-1 text-slate-400 hover:text-primary-500 rounded transition-colors"
                              title="Assign users"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-base text-slate-600 hidden lg:table-cell">
                      <span className={new Date(item.dueDate) < new Date() && item.status !== 'completed' ? 'text-red-600 font-semibold' : ''}>
                        {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell"><StatusBadge status={item.priority} type="priority" /></td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    {canManage && (
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openAssignModal(item._id, item.assignedTo)}
                            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                            title="Assign"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteId(item._id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200/60">
            <p className="text-base text-slate-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} items)
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Compliance Item" size="sm">
        <p className="text-base text-slate-600 mb-5">Are you sure you want to delete this compliance item? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={assignModal === 'bulk' ? `Assign ${selectedIds.length} Items` : 'Assign Users'}
        size="md"
      >
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
          <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
          <Button
            onClick={assignModal === 'bulk' ? handleBulkAssign : handleAssign}
            loading={assigning}
          >
            {assignModal === 'bulk' ? 'Assign All Selected' : 'Save Assignment'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
