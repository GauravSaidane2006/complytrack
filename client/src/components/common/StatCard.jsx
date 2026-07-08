export default function StatCard({ title, value, icon, color = 'orange', subtitle, onClick }) {
  const colorClasses = {
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/80 text-orange-600',
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-600',
    rose: 'bg-gradient-to-br from-rose-50 to-rose-100/80 text-rose-600',
    stone: 'bg-gradient-to-br from-stone-100 to-stone-200/80 text-stone-600',
    teal: 'bg-gradient-to-br from-teal-50 to-teal-100/80 text-teal-600'
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/60 p-4 sm:p-5 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-orange-200/80 transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="text-2xl font-bold text-stone-900 mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-stone-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl ${colorClasses[color] || colorClasses.orange}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
