export default function EmptyState({ title, description, action, actionLabel }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto h-16 w-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
        <svg className="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
      {action && (
        <button
          onClick={action}
          className="mt-5 inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl text-sm font-medium hover:from-orange-700 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
