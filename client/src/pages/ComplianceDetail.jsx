import { useParams, Link } from 'react-router-dom'
import { useGetComplianceItemQuery, useUpdateComplianceStatusMutation} from '../store/api/api'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function ComplianceDetail() {
  const { id } = useParams()
  const { data: item, isLoading } = useGetComplianceItemQuery(id)
  const [updateStatus] = useUpdateComplianceStatusMutation()

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />
  if (!item) return <p className="text-stone-500 mt-20 text-center">Item not found</p>

  const handleStatusChange = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap()
      toast.success('Status updated')
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed')
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-3 mb-6">
        <Link to="/compliance" className="text-stone-400 hover:text-stone-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{item.title}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 space-y-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={item.status} />
          <StatusBadge status={item.priority} type="priority" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Law</p>
            <p className="text-sm text-stone-900 mt-1">{item.law}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Regulation</p>
            <p className="text-sm text-stone-900 mt-1">{item.regulation || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Category</p>
            <p className="text-sm text-stone-900 mt-1 capitalize">{item.category}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Frequency</p>
            <p className="text-sm text-stone-900 mt-1 capitalize">{item.frequency}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Due Date</p>
            <p className="text-sm text-stone-900 mt-1">{new Date(item.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Risk Score</p>
            <p className="text-sm text-stone-900 mt-1">{item.riskScore || 0}/100</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Assigned To</p>
            <p className="text-sm text-stone-900 mt-1">
              {item.assignedTo?.length > 0 ? item.assignedTo.map(u => u.name).join(', ') : 'Unassigned'}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Recurring</p>
            <p className="text-sm text-stone-900 mt-1">{item.isRecurring ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {item.description && (
          <div>
            <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider mb-1">Description</p>
            <p className="text-sm text-stone-700">{item.description}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider mb-3">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {['pending', 'in-progress', 'completed', 'overdue', 'waived'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                  item.status === status
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-stone-200/60">
          <Link to={`/compliance/${id}/edit`}
            className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">Edit</Link>
        </div>
      </div>
    </div>
  )
}
