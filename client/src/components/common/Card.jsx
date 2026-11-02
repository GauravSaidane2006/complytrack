import clsx from 'clsx'

const variants = {
  default: 'bg-white border border-slate-200/60 shadow-sm',
  glass: 'glass',
  'glass-strong': 'glass-strong',
  'glass-subtle': 'glass-subtle',
  ghost: 'bg-transparent',
}

export default function Card({
  variant = 'default',
  padding = true,
  hover = false,
  className,
  children,
  ...props
}) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-card)]',
        variants[variant],
        padding && 'p-6',
        hover && 'hover:shadow-glass-lg hover:border-primary-200/60 transition-all duration-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={clsx('flex items-center justify-between mb-5', className)}>
      <div>
        {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  )
}
