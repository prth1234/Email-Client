import { useState, useEffect, useRef } from 'react'
import { Box, TextInput, Spinner, ThemeProvider, BaseStyles } from '@primer/react'
import { SearchIcon, XIcon } from '@primer/octicons-react'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
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

  // Initialize from localStorage or default to 420
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth')
    return saved ? parseInt(saved, 10) : 420
  })
  const [isResizing, setIsResizing] = useState(false)
  const [colorMode, setColorMode] = useState('dark')

  // Save width to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString())
  }, [sidebarWidth])

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
        // Focus without selecting
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
      document.body.style.userSelect = 'none'
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
      const url = new URL(`${API_URL}/api/emails?limit=20`)
      if (!reset && nextPageToken) {
        url.searchParams.append('pageToken', nextPageToken)
      }
      if (searchQuery) {
        url.searchParams.append('q', searchQuery)
      }

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

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchEmails(true)
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
  const bg = colorMode === 'light' ? '#ffffff' : '#000000'
  const isLight = colorMode === 'light'
  const inputBg = isLight ? '#f6f8fa' : '#0d1117'
  const inputBorder = isLight ? '#d0d7de' : '#30363d'
  const inputText = isLight ? '#24292f' : '#e6edf3'

  return (
    <ThemeProvider colorMode={colorMode === 'light' ? 'day' : 'night'}>
      <BaseStyles>
        <Box sx={{ backgroundColor: bg, pl: '12px', transition: 'background 0.2s' }} position="relative" display="flex" height="100vh" overflow="hidden">
          {authenticated ? (
            <>
              <Sidebar
                width={sidebarWidth}
                onResizeStart={handleResizeStart}
                colorMode={colorMode}
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
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: inputText,
                      '& input': {
                        borderRadius: '16px',
                        backgroundColor: inputBg,
                        color: inputText,
                        '&::placeholder': {
                          color: isLight ? '#656d76' : '#7d8590'
                        }
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
                  colorMode={colorMode}
                />
              </Sidebar>

              {/* Detail View */}
              <EmailDetail email={selectedEmail} colorMode={colorMode} />
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

          {/* Theme Toggle Button */}
          {authenticated && (
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000 }}>
              <button
                onClick={() => setColorMode(prev => prev === 'dark' ? 'light' : 'dark')}
                style={{
                  background: colorMode === 'dark' ? '#f0f6fc' : '#24292f',
                  color: colorMode === 'dark' ? '#24292f' : '#ffffff',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                }}
                title="Toggle Theme"
              >
                {colorMode === 'dark' ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
              </button>
            </div>
          )}

          {/* Global Styles */}
          <style>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: ${bg} !important;
        }
        #root {
            background-color: ${bg} !important;
            height: 100vh;
        }
        /* UNIVERSAL IMAGE FIX */
        img {
            max-width: 100% !important;
            height: auto !important;
            width: auto !important;
            object-fit: contain !important;
        }
        ::selection {
            background-color: rgba(31, 111, 235, 0.4);
        }
      `}</style>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  )
}

export default App
