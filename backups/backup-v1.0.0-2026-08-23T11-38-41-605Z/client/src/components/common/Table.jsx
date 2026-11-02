import clsx from 'clsx'

export default function Table({ children, className }) {
  return (
    <div className={clsx('glass rounded-[var(--radius-card)] overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  )
}

export function Thead({ children, className }) {
  return (
    <thead className={clsx('bg-white/40 border-b border-slate-200/60', className)}>
      {children}
    </thead>
  )
}

export function Th({ children, className, align = 'left' }) {
  const aligns = { left: 'text-left', center: 'text-center', right: 'text-right' }
  return (
    <th
      className={clsx(
        'px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider',
        aligns[align],
        className
      )}
    >
      {children}
    </th>
  )
}

export function Tbody({ children, className }) {
  return <tbody className={clsx('divide-y divide-slate-100', className)}>{children}</tbody>
}

export function Tr({ children, className, hover = true }) {
  return (
    <tr
      className={clsx(
        'bg-white/60 transition-colors',
        hover && 'hover:bg-primary-50/30',
        className
      )}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className, align = 'left' }) {
  const aligns = { left: 'text-left', center: 'text-center', right: 'text-right' }
  return (
    <td className={clsx('px-4 py-3 text-sm text-slate-700', aligns[align], className)}>
      {children}
    </td>
  )
}
