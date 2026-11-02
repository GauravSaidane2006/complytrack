import { motion } from 'framer-motion'

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -8 },
}

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 16, md: 32, lg: 48 }
  const s = sizes[size] || 32
  const dotSize = Math.max(6, s / 5)

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full bg-primary-500"
            style={{ width: dotSize, height: dotSize }}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonRow({ className = '' }) {
  return <div className={`skeleton h-4 rounded-lg ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-[var(--radius-card)] border border-slate-200/60 p-5 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonRow className="w-3/4" />
          <SkeletonRow className="w-1/2 h-3" />
        </div>
      </div>
    </div>
  )
}
