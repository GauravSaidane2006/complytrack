import { motion } from 'framer-motion'

export default function PageHeader({ title, description, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  )
}
