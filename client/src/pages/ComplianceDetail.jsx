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
  if (!item) return <p className="text-slate-500 mt-20 text-center">Item not found</p>

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
      <div className="flex items-center gap-3 mb-6">
        <Link to="/compliance" className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={item.status} />
          <StatusBadge status={item.priority} type="priority" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Law</p>
            <p className="text-sm text-slate-900 mt-1">{item.law}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Regulation</p>
            <p className="text-sm text-slate-900 mt-1">{item.regulation || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Category</p>
            <p className="text-sm text-slate-900 mt-1 capitalize">{item.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Frequency</p>
            <p className="text-sm text-slate-900 mt-1 capitalize">{item.frequency}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Due Date</p>
            <p className="text-sm text-slate-900 mt-1">{new Date(item.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Risk Score</p>
            <p className="text-sm text-slate-900 mt-1">{item.riskScore || 0}/100</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Assigned To</p>
            <p className="text-sm text-slate-900 mt-1">
              {item.assignedTo?.length > 0 ? item.assignedTo.map(u => u.name).join(', ') : 'Unassigned'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Recurring</p>
            <p className="text-sm text-slate-900 mt-1">{item.isRecurring ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {item.description && (
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium mb-1">Description</p>
            <p className="text-sm text-slate-700">{item.description}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-slate-500 uppercase font-medium mb-2">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {['pending', 'in-progress', 'completed', 'overdue', 'waived'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  item.status === status
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Link to={`/compliance/${id}/edit`}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Edit</Link>
        </div>
      </div>
    </div>
  )
}
