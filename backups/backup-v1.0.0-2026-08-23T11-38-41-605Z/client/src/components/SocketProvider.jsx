import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import { api } from '../store/api/api'

const EVENT_TAG_MAP = {
  'compliance:created':        ['Compliance', 'ComplianceStats', 'Dashboard'],
  'compliance:updated':        ['Compliance', 'ComplianceStats', 'Dashboard'],
  'compliance:deleted':        ['Compliance', 'ComplianceStats', 'Dashboard'],
  'compliance:status-changed': ['Compliance', 'ComplianceStats', 'Dashboard'],
  'compliance:assigned':       ['Compliance'],
  'compliance:proof-uploaded': ['Compliance'],
  'comment:created':           ['Comment'],
  'comment:deleted':           ['Comment'],
  'alert:new':                 ['Alert', 'ComplianceStats'],
  'template:created':          ['Template'],
  'template:updated':          ['Template'],
  'template:deleted':          ['Template'],
  'report:generated':          ['Report'],
  'report:deleted':            ['Report'],
  'user:created':              ['User', 'Dashboard'],
  'user:updated':              ['User', 'Dashboard'],
  'user:deleted':              ['User', 'Dashboard'],
  'risk:created':              ['Risk', 'Compliance', 'ComplianceStats'],
  'risk:updated':              ['Risk', 'Compliance', 'ComplianceStats'],
  'contract:created':          ['Contract'],
  'contract:updated':          ['Contract'],
  'contract:deleted':          ['Contract'],
  'organization:updated':      ['Organization', 'Dashboard'],
  'notice:deleted':            ['Notice'],
}

export default function SocketProvider({ children }) {
  const dispatch = useDispatch()
  const { user, accessToken, isAuthenticated } = useSelector((state) => state.auth)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) return

    const socket = io(window.location.origin, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    })

    socketRef.current = socket

    socket.on('connect', () => {})

    socket.on('disconnect', () => {})

    socket.on('connect_error', () => {})

    Object.entries(EVENT_TAG_MAP).forEach(([event, tags]) => {
      socket.on(event, () => {
        tags.forEach((tag) => {
          dispatch(api.util.invalidateTags([tag]))
        })
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, accessToken, user, dispatch])

  return children
}
