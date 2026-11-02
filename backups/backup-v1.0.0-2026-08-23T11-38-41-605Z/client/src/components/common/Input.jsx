import { forwardRef } from 'react'
import clsx from 'clsx'

const Input = forwardRef(function Input(
  { label, error, className, containerClassName, ...props },
  ref
) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-4 py-3 border rounded-[var(--radius-input)] text-sm bg-white text-slate-800',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
          'transition-all duration-200',
          error ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500 mt-1.5">{error}</p>}
    </div>
  )
})

export default Input
