import { useParams, Link } from 'react-router-dom'
import { useGetComplianceItemQuery, useUpdateComplianceStatusMutation } from '../store/api/api'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function ComplianceDetail() {
  const { id } = useParams()
  const { data: item, isLoading } = useGetComplianceItemQuery(id)
  const [updateStatus] = useUpdateComplianceStatusMutation()

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />
  if (!item) return <p className="text-stone-500 mt-20 text-center text-lg">Item not found</p>

  const handleStatusChange = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap()
      toast.success('Status updated')
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed')
    }
  }

  const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'completed' && item.status !== 'waived'

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/compliance" className="flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors text-base font-medium">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Compliance
        </Link>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/60 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold text-stone-900 tracking-tight">{item.title}</h1>
              <div className="flex gap-2">
                <StatusBadge status={item.status} />
                <StatusBadge status={item.priority} type="priority" />
              </div>
            </div>

            {item.description && (
              <div className="mb-6 p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Description</p>
                <p className="text-base text-stone-700 leading-relaxed">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">Law</p>
                <p className="text-lg font-semibold text-stone-900">{item.law}</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">Category</p>
                <p className="text-lg font-semibold text-stone-900 capitalize">{item.category}</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">Frequency</p>
                <p className="text-lg font-semibold text-stone-900 capitalize">{item.frequency}</p>
              </div>
              <div className={`p-4 rounded-xl ${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-stone-50'}`}>
                <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${isOverdue ? 'text-red-500' : 'text-stone-500'}`}>Due Date</p>
                <p className={`text-lg font-semibold ${isOverdue ? 'text-red-700' : 'text-stone-900'}`}>
                  {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {isOverdue && <p className="text-sm text-red-500 mt-1">Overdue</p>}
              </div>
              <div className="p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">Risk Score</p>
                <p className="text-lg font-semibold text-stone-900">{item.riskScore || 0}/100</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">Recurring</p>
                <p className="text-lg font-semibold text-stone-900">{item.isRecurring ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {item.regulation && (
              <div className="mt-5 p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">Regulation</p>
                <p className="text-base text-stone-700">{item.regulation}</p>
              </div>
            )}

            {item.assignedTo?.length > 0 && (
              <div className="mt-5 p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Assigned To</p>
                <div className="flex flex-wrap gap-2">
                  {item.assignedTo.map((user, i) => (
                    <span key={i} className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                      {user.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.documents?.length > 0 && (
              <div className="mt-5 p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Documents</p>
                <div className="flex flex-wrap gap-2">
                  {item.documents.map((doc, i) => (
                    <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                      {doc.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Actions</h2>
            <Link to={`/compliance/${id}/edit`}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Item
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Update Status</h2>
            <div className="space-y-2">
              {['pending', 'in-progress', 'completed', 'overdue', 'waived'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`w-full text-left px-4 py-3 text-base font-semibold rounded-xl border transition-all duration-200 ${
                    item.status === status
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 mb-3">Timeline</h2>
            <div className="space-y-3 text-base">
              <div className="flex justify-between text-stone-600">
                <span>Created</span>
                <span className="font-medium text-stone-900">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Last Updated</span>
                <span className="font-medium text-stone-900">{new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              {item.completedAt && (
                <div className="flex justify-between text-stone-600">
                  <span>Completed</span>
                  <span className="font-medium text-green-700">{new Date(item.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
