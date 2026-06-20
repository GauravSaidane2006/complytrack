const statusStyles = {
  completed: 'bg-emerald-100 text-emerald-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  waived: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-100 text-emerald-800',
  expired: 'bg-red-100 text-red-800',
  draft: 'bg-slate-100 text-slate-600',
  terminated: 'bg-red-100 text-red-800',
  renewed: 'bg-blue-100 text-blue-800'
}

const priorityStyles = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-slate-100 text-slate-600',
  identified: 'bg-red-100 text-red-800',
  mitigated: 'bg-emerald-100 text-emerald-800',
  accepted: 'bg-yellow-100 text-yellow-800',
  monitoring: 'bg-blue-100 text-blue-800'
}

export default function StatusBadge({ status, type = 'status' }) {
  const styles = type === 'priority' ? priorityStyles : statusStyles
  const base = styles[status] || 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${base}`}>
      {status?.replace('-', ' ')}
    </span>
  )
}
