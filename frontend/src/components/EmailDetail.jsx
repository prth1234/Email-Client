import React from 'react'
import { Box, Heading, Text, Label } from '@primer/react'

const CATEGORY_CONFIG = {
    Primary: { color: 'accent', icon: null },
    Social: { color: 'success', icon: null },
    Promotion: { color: 'sponsors', icon: null },
    Update: { color: 'done', icon: null }
}

const DARK_MODE_SCRIPT = `
(function() {
    function enforceDarkMode() {
        try {
            var styleId = 'dark-mode-style';
            var existingStyle = document.getElementById(styleId);
            if (!existingStyle) {
                var style = document.createElement('style');
                style.id = styleId;
                style.innerHTML = \`
                    :root { color-scheme: dark; }
                    html, body {
                        background-color: #000000 !important;
                        background: #000000 !important;
                        color: #e6edf3 !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif !important;
                        min-height: 100vh;
                        margin: 0;
                        padding: 24px;
                        box-sizing: border-box;
                    }
                    /* Hiding Scrollbar */
                    ::-webkit-scrollbar {
                        display: none;
                    }
                    html {
                        scrollbar-width: none; /* Firefox */
                        -ms-overflow-style: none; /* IE/Edge */
                    }
                    body * {
                        background-color: transparent !important;
                        background: transparent !important;
                        color: inherit !important;
                        border-color: #1a1a1a !important;
                    }
                    a { color: #58a6ff !important; text-decoration: none !important; }
                    a:hover { text-decoration: underline !important; }
                    
                    /* STRICT Image Sizing - Force containment */
                    img { 
                        opacity: 0.9; 
                        max-width: 100% !important; 
                        height: auto !important; 
                        object-fit: contain !important;
                        display: block; 
                        border-radius: 4px; 
                    }
                \`;
                (document.head || document.body).appendChild(style);
            }

            var all = document.querySelectorAll('*');
            for (var i=0; i < all.length; i++) {
                var el = all[i];
                var tagName = el.tagName;
                
                if (tagName === 'HTML' || tagName === 'BODY') {
                    el.style.setProperty('background-color', '#000000', 'important');
                    el.style.setProperty('background', '#000000', 'important');
                    el.style.setProperty('color', '#e6edf3', 'important');
                    continue;
                }

                if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'TITLE', 'LINK', 'BASE'].includes(tagName)) continue;

                el.removeAttribute('bgcolor');
                el.removeAttribute('background');
                el.removeAttribute('text');

                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('background', 'transparent', 'important');
                
                el.style.setProperty('border-color', '#1a1a1a', 'important');

                if (tagName !== 'A') {
                    el.style.setProperty('color', '#e6edf3', 'important');
                }

                if (tagName === 'A') {
                    el.setAttribute('target', '_blank');
                    el.style.setProperty('color', '#58a6ff', 'important');
                }
                
                // Extra safety for images
                if (tagName === 'IMG') {
                   el.style.setProperty('max-width', '100%', 'important');
                   el.style.setProperty('height', 'auto', 'important');
                }
            }
        } catch(e) { console.error('Dark mode error:', e); }
    }
    
    enforceDarkMode();
    setInterval(enforceDarkMode, 100);
    window.addEventListener('load', enforceDarkMode);
})();
`;

const EmailDetail = ({ email }) => {
    if (!email) {
        return (
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                bg="#000000"
            >
                <Text sx={{ color: 'fg.muted', fontSize: 2 }}></Text>
            </Box>
        )
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000000', overflow: 'hidden' }}>
            {/* Email Header - Full Width */}
            <div style={{ flexShrink: 0, padding: '24px', paddingBottom: '16px', backgroundColor: '#000000', borderBottom: '1px solid #1a1a1a' }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Heading as="h3" sx={{ fontSize: 3, mb: 1, flex: 1, color: '#e6edf3' }}>
                        {email.subject || '(No Subject)'}
                    </Heading>
                    <Box display="flex" gap={2} alignItems="center">
                        {email.category !== 'Primary' && (
                            <Box
                                sx={{
                                    display: 'inline-block',
                                    py: '2px',
                                    px: '6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    color: '#2ea043',
                                    border: '1px solid #2ea043',
                                    backgroundColor: 'rgba(46, 160, 67, 0.1)',
                                    textTransform: 'uppercase',
                                    ml: 2
                                }}
                            >
                                {email.category}
                            </Box>
                        )}
                        <Text sx={{ fontSize: 1, color: '#8b949e', ml: 2 }}>
                            {new Date(email.date).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                            })}
                        </Text>
                    </Box>
                </Box>

                <Box display="flex" alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#000000'
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
                    <Box ml={3}>
                        <Text sx={{ fontSize: 2, color: '#e6edf3', fontWeight: 'bold', display: 'block' }}>
                            {email.senderName}
                        </Text>
                        <Text sx={{ fontSize: 1, color: '#8b949e' }}>
                            &lt;{email.senderEmail}&gt;
                        </Text>
                    </Box>
                </Box>
            </div>

            {/* Email Body - Centered with Padding */}
            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#000000', padding: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '800px', height: '100%', backgroundColor: 'transparent' }}>
                    {email.bodyHtml ? (
                        <iframe
                            srcDoc={`
                  <!DOCTYPE html>
                  <html style="background-color: #000000;">
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <base target="_blank">
                      <style>
                        :root { color-scheme: dark; }
                        html, body {
                          background-color: #000000 !important;
                          color: #e6edf3 !important;
                          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                          font-size: 16px !important;
                          line-height: 1.6;
                          margin: 0;
                          padding: 40px 0; /* Vertical padding */
                          min-height: 100vh;
                          overflow-x: hidden;
                        }
                        *, *::before, *::after {
                          background-color: transparent !important;
                          color: inherit !important;
                          border-color: #1a1a1a !important;
                        }
                        a { color: #58a6ff !important; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                        img { max-width: 100% !important; height: auto !important; border-radius: 4px; }
                        ::-webkit-scrollbar { width: 10px; height: 10px; }
                        ::-webkit-scrollbar-track { background: #000000; }
                        ::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 5px; }
                      </style>
                      <script>${DARK_MODE_SCRIPT}</script>
                    </head>
                    <body style="background-color: #000000;">${email.bodyHtml}</body>
                  </html>
                `}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                backgroundColor: 'transparent',
                                display: 'block'
                            }}
                            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-scripts"
                            title="Email Content"
                        />
                    ) : (
                        <Box
                            p={5}
                            sx={{
                                fontSize: 3,
                                lineHeight: 1.6,
                                color: '#e6edf3',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                height: '100%',
                                overflow: 'auto',
                                backgroundColor: '#000000'
                            }}
                        >
                            {email.bodyText || email.snippet}
                        </Box>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmailDetail
