import React from 'react'
import { Box, Heading } from '@primer/react'
import logo from '../assets/query-pilot-logo.png'

const Sidebar = ({ width, onResizeStart, children, colorMode }) => {
    const handleMouseDown = (e) => {
        e.preventDefault()
        e.stopPropagation() // Prevent issues with selection or other events
        onResizeStart(e)
    }

    const isLight = colorMode === 'light'
    const bg = isLight ? '#f6f8fa' : '#000000'
    const borderColor = isLight ? '#d0d7de' : '#30363d'
    const textPrimary = isLight ? '#24292f' : '#e6edf3'

    return (
        <Box
            sx={{
                width: `${width}px`,
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flexShrink: 0,
                backgroundColor: bg,
                transition: 'width 0.05s linear',
                borderRight: `1px solid ${borderColor}`
            }}
        >
            {/* Logo Header */}
            <Box
                p={4}
                pb={3}
                display="flex"
                alignItems="center"
                sx={{ flexShrink: 0, gap: '24px' }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
                <Heading as="h2" sx={{ fontSize: 5, fontWeight: 'bold', whiteSpace: 'nowrap', color: textPrimary }}>
                    Inbox
                </Heading>
            </Box>

            {/* Sidebar Content */}
            <Box display="flex" flexDirection="column" flex="1" overflow="hidden">
                {children}
            </Box>

            {/* Resize Handle */}
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    position: 'absolute',
                    right: '-8px', // Centered 16px wide handle over the border
                    top: 0,
                    bottom: 0,
                    width: '16px',
                    cursor: 'col-resize',
                    zIndex: 9999, // Ensure it's on top of everything
                    userSelect: 'none',
                    touchAction: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    '&:hover .visual-handle': {
                        opacity: 1,
                        backgroundColor: 'accent.emphasis'
                    }
                }}
            >
                {/* Visual indicator (line) */}
                <Box
                    className="visual-handle"
                    sx={{
                        width: '4px',
                        height: '100%',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        backgroundColor: 'accent.emphasis',
                        borderRadius: '2px'
                    }}
                />
            </Box>
        </Box>
    )
}

export default Sidebar
