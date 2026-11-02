import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function StatCard({ title, value, icon, color = 'primary', subtitle, onClick, index = 0 }) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
    slate: 'bg-slate-100 text-slate-600',
    teal: 'bg-primary-50 text-primary-600',
    amber: 'bg-warning-50 text-warning-600',
    rose: 'bg-danger-50 text-danger-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={onClick ? { y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -4px rgba(0, 0, 0, 0.04)' } : undefined}
      className={clsx(
        'bg-white rounded-[var(--radius-card)] border border-slate-200/60 p-4 sm:p-5 shadow-sm',
        onClick && 'cursor-pointer transition-all duration-200'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={clsx('p-2.5 rounded-xl', colorClasses[color] || colorClasses.primary)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  )
}
