const statusStyles = {
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  'in-progress': 'bg-orange-50 text-orange-700 border border-orange-200/60',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  overdue: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  waived: 'bg-stone-100 text-stone-600 border border-stone-200/60',
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  expired: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  draft: 'bg-stone-100 text-stone-600 border border-stone-200/60',
  terminated: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  renewed: 'bg-orange-50 text-orange-700 border border-orange-200/60'
}

const priorityStyles = {
  critical: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  high: 'bg-orange-50 text-orange-700 border border-orange-200/60',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  low: 'bg-stone-100 text-stone-600 border border-stone-200/60',
  identified: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  mitigated: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  accepted: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  monitoring: 'bg-orange-50 text-orange-700 border border-orange-200/60'
}

export default function StatusBadge({ status, type = 'status' }) {
  const styles = type === 'priority' ? priorityStyles : statusStyles
  const base = styles[status] || 'bg-stone-100 text-stone-600 border border-stone-200/60'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${base}`}>
      {status?.replace('-', ' ')}
    </span>
  )
}
