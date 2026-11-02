import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSendChatMessageMutation } from '../../store/api/api'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

const WELCOME_MESSAGE = {
  sender: 'bot',
  text: "Hi! I'm **ComplyTrackAI**, your compliance assistant. I can help you navigate the app, check your compliance status, view alerts, and more.\n\nWhat would you like to know?",
  suggestions: ['My compliance status', 'Show overdue items', 'Go to dashboard', 'How to use']
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [sendMessage] = useSendChatMessageMutation()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = async (text) => {
    const userMessage = { sender: 'user', text }
    setMessages(prev => [...prev, userMessage])

    try {
      const result = await sendMessage(text).unwrap()

      const botMessage = {
        sender: 'bot',
        text: result.response,
        suggestions: result.suggestions || []
      }
      setMessages(prev => [...prev, botMessage])

      if (result.navigate) {
        setTimeout(() => {
          navigate(result.navigate)
          setIsOpen(false)
        }, 800)
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I encountered an error. Please try again.',
          suggestions: ['Try again']
        }
      ])
    }
  }

  const handleSuggestionClick = (suggestion) => {
    const navKeywords = ['go to', 'navigate', 'open', 'view', 'show']
    const isNav = navKeywords.some(kw => suggestion.toLowerCase().startsWith(kw))

    if (isNav) {
      const path = suggestion.toLowerCase()
        .replace(/^(go to|navigate to|open|view|show me|show)\s+/, '')
        .replace(/\s+/g, '-')

      const routeMap = {
        'dashboard': '/dashboard',
        'compliance': '/compliance',
        'alerts': '/alerts',
        'reports': '/reports',
        'contracts': '/contracts',
        'risks': '/risks',
        'risk assessment': '/risks',
        'templates': '/templates',
        'settings': '/settings',
        'users': '/users',
        'notices': '/notices',
        'reference pdfs': '/sector-pdfs',
        'sector pdfs': '/sector-pdfs',
        'company report': '/company-report',
        'verification': '/verification-status',
        'questionnaire': '/questionnaire',
        'compliance profile': '/questionnaire',
        'document review': '/document-review'
      }

      const route = Object.entries(routeMap).find(([key]) => path.includes(key))
      if (route) {
        handleSend(`Go to ${suggestion}`)
        return
      }
    }

    handleSend(suggestion)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[360px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">ComplyTrackAI</h3>
                  <p className="text-blue-100 text-xs">Your compliance assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  message={msg}
                  onSuggestionClick={handleSuggestionClick}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={handleSend} disabled={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
