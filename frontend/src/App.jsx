import { useState, useEffect, useRef } from 'react'
import { Box, TextInput, Spinner } from '@primer/react'
import { SearchIcon, XIcon } from '@primer/octicons-react'
import Sidebar from './components/Sidebar'
import EmailList from './components/EmailList'
import EmailDetail from './components/EmailDetail'
import LoginView from './components/LoginView'

const API_URL = 'http://localhost:3001'

function App() {
  const [emails, setEmails] = useState([])
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(450) // Wider default width
  const [isResizing, setIsResizing] = useState(false)

  const [nextPageToken, setNextPageToken] = useState(null)
  const searchInputRef = useRef(null)

  // Auth check
  useEffect(() => {
    checkAuth()
  }, [])

  // Search shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if not already typing in an input
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sidebar resize logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      e.preventDefault() // Prevent selection
      const newWidth = e.clientX
      // Enforce limits
      if (newWidth >= 280 && newWidth <= 800) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none' // formatting fix
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [isResizing])

  const handleResizeStart = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gmail/profile`)
      if (res.ok) {
        setAuthenticated(true)
        fetchEmails(true)
      } else {
        setAuthenticated(false)
      }
    } catch (e) {
      console.error('Auth check failed:', e)
      setAuthenticated(false)
    }
  }

  const handleAuth = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  const fetchEmails = async (reset = false) => {
    if (loading) return

    setLoading(true)
    try {
      let url = `${API_URL}/api/emails?limit=20`
      if (!reset && nextPageToken) {
        url += `&pageToken=${nextPageToken}`
      }

      // If searching, append query (this mock logic needs backend support for search+pagination)
      // The backend supports q param.
      // Note: We might want to filter client side if backend doesn't support complex search, 
      // but current backend passes q to gmail.
      // However, the current code filtered client side. 
      // Let's rely on backend search if possible layer, but for now we keep client filtering 
      // or we accept that 'emails' list grows.
      // Actually, if we use pagination, client-side filtering of *fetched* emails is weird 
      // because we might not have fetched the matching ones yet.
      // For now, let's just fetch, and if search is local, it works on loaded items. 
      // Ideally we pass q to backend.

      const res = await fetch(url)
      const data = await res.json()

      // Handle the new object response format
      const newEmails = data.emails || []
      const newToken = data.nextPageToken || null

      if (reset) {
        setEmails(newEmails)
        if (newEmails.length > 0) {
          setSelectedEmail(newEmails[0])
        }
      } else {
        setEmails(prev => [...prev, ...newEmails])
      }

      setNextPageToken(newToken)

    } catch (e) {
      console.error('Error fetching emails:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailClick = async (email) => {
    setSelectedEmail(email)

    if (email.isUnread) {
      // Optimistic update
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isUnread: false } : e))

      try {
        await fetch(`${API_URL}/api/emails/${email.id}/read`, { method: 'POST' })
      } catch (e) {
        console.error('Error marking as read:', e)
      }
    }
  }

  // Client-side filtering works on the *loaded* emails. 
  // To truly simple fix: keep it this way.
  const filteredEmails = emails.filter(email =>
    email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box bg="#0d1117" position="relative" display="flex" height="100vh" overflow="hidden">
      {authenticated ? (
        <>
          <Sidebar
            width={sidebarWidth}
            onResizeStart={handleResizeStart}
          >
            {/* Search Bar */}
            <Box p={3} pt={2} pb={2}>
              <TextInput
                ref={searchInputRef}
                leadingVisual={SearchIcon}
                trailingAction={
                  searchQuery ? (
                    <TextInput.Action
                      onClick={() => setSearchQuery('')}
                      icon={XIcon}
                      aria-label="Clear search"
                    />
                  ) : null
                }
                placeholder="Search emails... (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: '100%',
                  borderRadius: '16px',
                  '& input': {
                    borderRadius: '16px'
                  }
                }}
              />
            </Box>

            {/* Email List */}
            <EmailList
              emails={filteredEmails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleEmailClick}
              loading={loading && emails.length === 0} // Only show full loader if initial load
              onLoadMore={() => fetchEmails(false)}
              hasMore={!!nextPageToken}
            />
          </Sidebar>

          {/* Detail View */}
          <EmailDetail email={selectedEmail} />
        </>
      ) : (
        <LoginView onAuth={handleAuth} />
      )}

      {/* Global Resize Overlay - Prevents iframe from stealing mouse events */}
      {isResizing && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: 'col-resize',
            userSelect: 'none'
          }}
        />
      )}

      {/* Global Resize Cursor Override */}
      <style>{`
        body {
          margin: 0;
          overflow: hidden; /* Prevent body scroll */
          background-color: #0d1117; /* Global dark bg */
        }
        ::selection {
            background-color: rgba(31, 111, 235, 0.4);
        }
      `}</style>
    </Box>
  )
}

export default App
