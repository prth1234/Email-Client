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

const EmailList = ({ emails, selectedEmail, onSelectEmail, loading, onLoadMore, hasMore }) => {

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
                            backgroundColor: selectedEmail?.id === email.id ? 'actionListItem.default.selectedBg' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'actionListItem.default.hoverBg'
                            },
                            py: 3,
                            px: 3,
                            display: 'flex',
                            alignItems: 'center'
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
                                        color: 'fg.default',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                        minWidth: 0
                                    }}
                                >
                                    {email.senderName}
                                </Text>
                                <Text sx={{ fontSize: 0, color: 'fg.muted', flexShrink: 0 }}>
                                    {formatDate(email.date)}
                                </Text>
                            </Box>

                            {/* Subject */}
                            <Text
                                as="div"
                                sx={{
                                    fontSize: 1,
                                    fontWeight: email.isUnread ? 'semibold' : 'normal',
                                    color: 'fg.default',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    mb: 1
                                }}
                            >
                                {email.subject || <Text as="span" fontStyle="italic">(No Subject)</Text>}
                            </Text>

                            {/* Snippet and category */}
                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                                <Text
                                    sx={{
                                        fontSize: 0,
                                        color: 'fg.muted',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                        minWidth: 0
                                    }}
                                >
                                    {email.snippet}
                                </Text>

                                {email.category !== 'Primary' && (
                                    <Label variant={CATEGORY_CONFIG[email.category]?.color || 'default'} size="small" sx={{ flexShrink: 0 }}>
                                        {email.category}
                                    </Label>
                                )}
                            </Box>
                        </Box>

                        {email.isUnread && (
                            <ActionList.TrailingVisual>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bg: 'accent.fg'
                                    }}
                                />
                            </ActionList.TrailingVisual>
                        )}
                    </ActionList.Item>
                ))}
                {loading && hasMore && (
                    <Box display="flex" justifyContent="center" p={2}>
                        <Spinner size="small" />
                    </Box>
                )}
            </ActionList>
        </Box>
    )
}

export default EmailList
