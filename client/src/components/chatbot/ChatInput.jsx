import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-slate-100 bg-white">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask ComplyTrackAI..."
        disabled={disabled}
        className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
        autoFocus
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="submit"
        disabled={!input.trim() || disabled}
        className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </motion.button>
    </form>
  )
}
