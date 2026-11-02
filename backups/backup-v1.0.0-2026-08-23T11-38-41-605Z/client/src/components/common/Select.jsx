import { forwardRef } from 'react'
import clsx from 'clsx'

const Select = forwardRef(function Select(
  { label, error, children, className, containerClassName, ...props },
  ref
) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      )}
      <select
        ref={ref}
        className={clsx(
          'w-full px-4 py-3 border rounded-[var(--radius-input)] text-sm bg-white text-slate-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
          'transition-all duration-200 appearance-none',
          'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2024%2024%27%20stroke-width%3D%272%27%20stroke%3D%27%238c9dae%27%3E%3Cpath%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20d%3D%27M19.5%208.25l-7.5%207.5-7.5-7.5%27/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10',
          error ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : 'border-slate-200',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger-500 mt-1.5">{error}</p>}
    </div>
  )
})

export default Select
