import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary hover:shadow-primary-lg active:bg-primary-700',
  secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-md hover:shadow-lg active:bg-danger-700',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
  text: 'text-primary-500 hover:text-primary-600 underline-offset-2 hover:underline',
  outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-sm gap-2',
  xl: 'px-7 py-3.5 text-base gap-2.5',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, disabled, loading, children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      disabled={disabled || loading}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-[var(--radius-button)] transition-all duration-200 cursor-pointer select-none',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
})

export default Button
