import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} p-6 z-10 border border-stone-200/60`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
