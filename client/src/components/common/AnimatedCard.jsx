import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

export default function AnimatedCard({ children, index = 0, className = '', ...props }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -4px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-[var(--radius-card)] border border-slate-200/60 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
