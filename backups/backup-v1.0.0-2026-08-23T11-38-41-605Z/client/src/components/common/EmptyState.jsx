import { motion } from 'framer-motion'
import Button from './Button'

export default function EmptyState({ title, description, action, actionLabel, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center py-16"
    >
      <div className="mx-auto h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-200/60">
        {icon || (
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {action && (
        <div className="mt-5">
          <Button onClick={action}>{actionLabel}</Button>
        </div>
      )}
    </motion.div>
  )
}
