import { motion } from 'framer-motion'

function formatMessage(text) {
  if (!text) return text
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function ChatMessage({ message, onSuggestionClick }) {
  const isBot = message.sender === 'bot'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className={`max-w-[80%] ${isBot ? '' : ''}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isBot
              ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-sm shadow-md'
          }`}
          dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
        />

        {isBot && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors border border-blue-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
