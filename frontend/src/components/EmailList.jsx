import React from 'react'
import { ActionList, Box, Text, Label, Spinner } from '@primer/react'

const CATEGORY_CONFIG = {
    Primary: { color: 'accent', icon: null },
    Social: { color: 'success', icon: null },
    Promotion: { color: 'sponsors', icon: null },
    Update: { color: 'done', icon: null }
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const day = 24 * 60 * 60 * 1000

    if (diff < day) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (diff < 7 * day) {
        return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const EmailList = ({ emails, selectedEmail, onSelectEmail, loading, onLoadMore, hasMore, colorMode }) => {
    const isLight = colorMode === 'light'
    const activeBg = isLight ? '#eef2f6' : 'rgba(17, 24, 39, 1)'
    const hoverBg = isLight ? '#f6f8fa' : 'rgba(17, 24, 39, 0.4)'
    const textPrimary = isLight ? '#24292f' : '#e6edf3'
    const textSecondary = isLight ? '#57606a' : '#8b949e'
    const textMuted = isLight ? '#656d76' : '#7d8590'

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        // Trigger load more when 50px from bottom
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasMore && !loading) {
                onLoadMore()
            }
        }
    }

    if (loading && emails.length === 0) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <Spinner size="medium" />
            </Box>
        )
    }

    return (
        <Box sx={{ flex: 1, overflow: 'auto' }} onScroll={handleScroll}>
            <ActionList>
                {emails.map((email) => (
                    <ActionList.Item
                        key={email.id}
                        active={selectedEmail?.id === email.id}
                        onSelect={() => onSelectEmail(email)}
                        sx={{
                            cursor: 'pointer',
                            backgroundColor: selectedEmail?.id === email.id ? activeBg : 'transparent',
                            '&:hover': {
                                backgroundColor: hoverBg
                            },
                            py: 3,
                            px: 3,
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative' // Added for absolute positioning of unread indicator
                        }}
                    >
                        <ActionList.LeadingVisual>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.senderName)}&background=random&rounded=false`}
                                    alt={email.senderName}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Box>
                        </ActionList.LeadingVisual>

                        <Box sx={{ flex: 1, minWidth: 0, pr: 2, ml: 3 }}>
                            {/* Sender name and time row */}
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1} gap={2}>
                                <Text
                                    sx={{
                                        fontWeight: email.isUnread ? 'bold' : 'normal',
                                        fontSize: 1,
                                        color: textPrimary,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1
                                    }}
                                >
                                    {email.senderName}
                                </Text>
                                <Text
                                    sx={{
                                        fontSize: 0,
                                        color: textSecondary,
                                        flexShrink: 0,
                                        ml: 1
                                    }}
                                >
                                    {formatDate(email.date)}
                                </Text>
                            </Box>

                            {/* Subject */}
                            <Text
                                sx={{
                                    fontWeight: email.isUnread ? 'bold' : 'normal',
                                    fontSize: 1,
                                    color: textPrimary,
                                    mb: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block'
                                }}
                            >
                                {email.subject || '(No Subject)'}
                            </Text>

                            {/* Snippet row */}
                            <Box display="flex" alignItems="center" gap={2}>
                                <Text
                                    sx={{
                                        fontSize: 0,
                                        color: textMuted,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1
                                    }}
                                >
                                    {email.snippet}
                                </Text>
                            </Box>

                            {/* Unread indicator */}
                            {email.isUnread && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: 'accent.fg'
                                    }}
                                />
                            )}
                        </Box>
                    </ActionList.Item>
                ))}
            </ActionList>

            {/* Load more indicator - visible when loading more emails */}
            {loading && emails.length > 0 && (
                <Box display="flex" justifyContent="center" p={4} sx={{ backgroundColor: 'transparent' }}>
                    <Spinner size="small" />
                </Box>
            )}

            {/* End of list indicator */}
            {!hasMore && emails.length > 0 && (
                <Box display="flex" justifyContent="center" p={3}>
                    <Text sx={{ fontSize: 0, color: isLight ? '#656d76' : '#7d8590' }}>
                        No more emails
                    </Text>
                </Box>
            )}
        </Box>
    )
}

export default EmailList
