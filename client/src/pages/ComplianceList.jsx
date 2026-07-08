import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useGetComplianceItemsQuery, useDeleteComplianceItemMutation, useUpdateComplianceStatusMutation } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import { toast } from 'react-hot-toast'

export default function ComplianceList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [lawFilter, setLawFilter] = useState(searchParams.get('law') || '')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [statusModal, setStatusModal] = useState(null)

  const params = { page, limit: 20 }
  if (statusFilter) params.status = statusFilter
  if (lawFilter) params.law = lawFilter
  if (search) params.search = search

  const { data, isLoading } = useGetComplianceItemsQuery(params)
  const [deleteItem] = useDeleteComplianceItemMutation()
  const [updateStatus] = useUpdateComplianceStatusMutation()

  const handleDelete = async () => {
    try {
      await deleteItem(deleteId).unwrap()
      toast.success('Compliance item deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed')
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusModal) return
    try {
      await updateStatus({ id: statusModal._id, status: statusModal.newStatus }).unwrap()
      toast.success('Status updated')
      setStatusModal(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed')
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const items = data?.items || []
  const pagination = data?.pagination || {}

  return (
    <div>
      <PageHeader
        title="Compliance Obligations"
        description="Track all your compliance items"
        actions={
          <Link to="/compliance/new" className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl text-sm font-medium hover:from-orange-700 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all duration-200">
            + New Item
          </Link>
        }
      />

      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm">
        <div className="p-4 border-b border-stone-200/60 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select value={lawFilter} onChange={(e) => setLawFilter(e.target.value)}
            className="px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
            <option value="">All Laws</option>
            <option value="GST Act">GST Act</option>
            <option value="Companies Act">Companies Act</option>
            <option value="Income Tax Act">Income Tax Act</option>
            <option value="Labour Laws">Labour Laws</option>
            <option value="PF Act">PF Act</option>
            <option value="ESI Act">ESI Act</option>
          </select>
        </div>

        {items.length === 0 ? (
          <EmptyState title="No compliance items" description="Create your first compliance item to get started."
            action={() => window.location.href = '/compliance/new'} actionLabel="Create Item" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50/80">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:table-cell">Law</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:table-cell">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link to={`/compliance/${item._id}`} className="text-sm font-medium text-stone-900 hover:text-orange-600 transition-colors">
                        {item.title}
                      </Link>
                      <p className="text-xs text-stone-500 sm:hidden mt-0.5">{item.law}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-stone-600 hidden sm:table-cell">{item.law}</td>
                    <td className="px-4 py-3.5 text-sm text-stone-600 hidden md:table-cell">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><StatusBadge status={item.priority} type="priority" /></td>
                    <td className="px-4 py-3.5"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => setStatusModal({ _id: item._id, newStatus: e.target.value })}
                          className="text-xs border border-stone-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                          <option value="waived">Waived</option>
                        </select>
                        <Link to={`/compliance/${item._id}/edit`}
                          className="p-1 text-stone-400 hover:text-orange-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button onClick={() => setDeleteId(item._id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200/60">
            <p className="text-sm text-stone-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} items)
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1 text-sm border border-stone-200 rounded-lg disabled:opacity-50 hover:bg-stone-50 transition-colors">Previous</button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm border border-stone-200 rounded-lg disabled:opacity-50 hover:bg-stone-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Compliance Item" size="sm">
        <p className="text-sm text-stone-600 mb-5">Are you sure you want to delete this compliance item? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl hover:from-rose-700 hover:to-red-700 shadow-md transition-all duration-200">Delete</button>
        </div>
      </Modal>

      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Status" size="sm">
        <p className="text-sm text-stone-600 mb-5">Change status to <strong className="text-stone-900">{statusModal?.newStatus}</strong>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
          <button onClick={handleStatusUpdate} className="px-4 py-2 text-sm bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all duration-200">Update</button>
        </div>
      </Modal>
    </div>
  )
}
