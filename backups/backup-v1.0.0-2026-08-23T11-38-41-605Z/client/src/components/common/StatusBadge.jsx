import { motion } from 'framer-motion'

const statusStyles = {
  completed: 'bg-success-50 text-success-700 border border-success-100',
  'in-progress': 'bg-primary-50 text-primary-700 border border-primary-100',
  pending: 'bg-warning-50 text-warning-700 border border-warning-100',
  overdue: 'bg-danger-50 text-danger-700 border border-danger-100',
  waived: 'bg-slate-100 text-slate-600 border border-slate-200',
  active: 'bg-success-50 text-success-700 border border-success-100',
  expired: 'bg-danger-50 text-danger-700 border border-danger-100',
  draft: 'bg-slate-100 text-slate-600 border border-slate-200',
  terminated: 'bg-danger-50 text-danger-700 border border-danger-100',
  renewed: 'bg-primary-50 text-primary-700 border border-primary-100',
  verified: 'bg-success-50 text-success-700 border border-success-100',
  rejected: 'bg-danger-50 text-danger-700 border border-danger-100',
  pending_review: 'bg-warning-50 text-warning-700 border border-warning-100',
  not_submitted: 'bg-slate-100 text-slate-600 border border-slate-200',
  submitted: 'bg-primary-50 text-primary-700 border border-primary-100',
}

const priorityStyles = {
  critical: 'bg-danger-50 text-danger-700 border border-danger-100',
  high: 'bg-primary-50 text-primary-700 border border-primary-100',
  medium: 'bg-warning-50 text-warning-700 border border-warning-100',
  low: 'bg-slate-100 text-slate-600 border border-slate-200',
  identified: 'bg-danger-50 text-danger-700 border border-danger-100',
  mitigated: 'bg-success-50 text-success-700 border border-success-100',
  accepted: 'bg-warning-50 text-warning-700 border border-warning-100',
  monitoring: 'bg-primary-50 text-primary-700 border border-primary-100',
}

const dotColors = {
  completed: 'bg-success-500',
  'in-progress': 'bg-primary-500',
  pending: 'bg-warning-500',
  overdue: 'bg-danger-500',
  waived: 'bg-slate-400',
  active: 'bg-success-500',
  expired: 'bg-danger-500',
  draft: 'bg-slate-400',
  critical: 'bg-danger-500',
  high: 'bg-primary-500',
  medium: 'bg-warning-500',
  low: 'bg-slate-400',
  verified: 'bg-success-500',
  rejected: 'bg-danger-500',
  pending_review: 'bg-warning-500',
  not_submitted: 'bg-slate-400',
  submitted: 'bg-primary-500',
}

export default function StatusBadge({ status, type = 'status' }) {
  const styles = type === 'priority' ? priorityStyles : statusStyles
  const base = styles[status] || 'bg-slate-100 text-slate-600 border border-slate-200'
  const dotColor = dotColors[status] || 'bg-slate-400'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${base}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status?.replace('-', ' ')}
    </motion.span>
  )
}
