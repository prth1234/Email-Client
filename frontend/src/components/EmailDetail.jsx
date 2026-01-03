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
            // 1. Force global CSS overrides via a style tag
            var styleId = 'dark-mode-style';
            var existingStyle = document.getElementById(styleId);
            if (!existingStyle) {
                var style = document.createElement('style');
                style.id = styleId;
                style.innerHTML = \`
                    html, body {
                        background-color: #0d1117 !important;
                        color: #e6edf3 !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif !important;
                        min-height: 100vh;
                    }
                    /* Target all elements to strip backgrounds */
                    body * {
                        background-color: transparent !important;
                        color: inherit !important;
                        border-color: #30363d !important;
                    }
                    a { color: #58a6ff !important; text-decoration: none !important; }
                    a:hover { text-decoration: underline !important; }
                    img { opacity: 0.9; max-width: 100%; height: auto; }
                    
                    /* Exceptions for our button injection */
                    .injected-button {
                        background-color: #1f6feb !important;
                        color: #ffffff !important;
                        display: inline-block !important;
                    }
                \`;
                // Append to head or body
                (document.head || document.body).appendChild(style);
            }

            // 2. Inline style overrides (aggressive)
            var all = document.querySelectorAll('*');
            for (var i=0; i < all.length; i++) {
                var el = all[i];
                var tagName = el.tagName;
                if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'TITLE', 'LINK'].includes(tagName)) continue;

                // Remove legacy attributes
                el.removeAttribute('bgcolor');
                el.removeAttribute('background');
                el.removeAttribute('text');
                el.removeAttribute('link');
                el.removeAttribute('vlink');
                el.removeAttribute('alink');

                // Force inline styles
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('background', 'transparent', 'important'); // Catch shorthand
                if (tagName !== 'A' && !el.classList.contains('injected-button')) {
                    el.style.setProperty('color', '#e6edf3', 'important');
                }

                // Handle links and buttons
                if (tagName === 'A') {
                    el.style.setProperty('color', '#58a6ff', 'important');
                    var text = el.textContent || el.innerText || '';
                    text = text.trim().toUpperCase();
                    
                    // Button detection
                    if (text === 'CLICK HERE' || text.includes('VIEW') || text.includes('CHECK') || text.includes('VERIFY')) {
                        el.classList.add('injected-button');
                        el.style.setProperty('background-color', '#1f6feb', 'important');
                        el.style.setProperty('color', '#ffffff', 'important');
                        el.style.border = '1px solid rgba(240,246,252,0.1)';
                        el.style.borderRadius = '6px';
                        el.style.padding = '10px 20px';
                        el.style.textDecoration = 'none';
                        el.style.fontWeight = '600';
                        el.style.textAlign = 'center';
                    }
                }
            }
        } catch(e) { console.error('Dark mode enforcement error:', e); }
    }
    
    // Run immediately and periodically
    enforceDarkMode();
    setInterval(enforceDarkMode, 500);
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
        bg="#0d1117"
      >
        <Text sx={{ color: 'fg.muted', fontSize: 2 }}></Text>
      </Box>
    )
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', bg: '#0d1117' }}>
      {/* Email Header */}
      <Box p={4} pb={3} borderColor="border.default" borderBottomWidth={1} borderBottomStyle="solid" sx={{ flexShrink: 0, bg: '#0d1117' }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Heading as="h3" sx={{ fontSize: 3, mb: 1, flex: 1, color: 'fg.default' }}>
            {email.subject || '(No Subject)'}
          </Heading>
          <Box display="flex" gap={2} alignItems="center">
            {email.category !== 'Primary' && (
              <Label variant={CATEGORY_CONFIG[email.category]?.color || 'default'} sx={{ ml: 2 }}>
                {email.category}
              </Label>
            )}
            <Text sx={{ fontSize: 1, color: 'fg.muted', ml: 2 }}>
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
          <Box ml={3}>
            <Text sx={{ fontSize: 2, color: 'fg.default', fontWeight: 'bold', display: 'block' }}>
              {email.senderName}
            </Text>
            <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
              &lt;{email.senderEmail}&gt;
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Email Body */}
      <Box sx={{ flex: 1, overflow: 'hidden', backgroundColor: '#0d1117', p: 0 }}>
        {email.bodyHtml ? (
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    :root { color-scheme: dark; }
                    html, body {
                      background-color: #0d1117 !important;
                      color: #e6edf3 !important;
                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                      font-size: 16px !important;
                      line-height: 1.6;
                      margin: 0;
                      padding: 32px; /* Consistent padding */
                      min-height: 100vh;
                      overflow-x: hidden;
                    }
                    /* Base Reset */
                    table, tr, td, th, tbody, thead, tfoot, div, p, span, h1, h2, h3, h4, h5, h6 {
                      background-color: transparent !important;
                      color: inherit !important;
                      border-color: #30363d !important;
                    }
                    a { color: #58a6ff !important; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    img { max-width: 100% !important; height: auto !important; border-radius: 4px; }
                    ::-webkit-scrollbar { width: 10px; height: 10px; }
                    ::-webkit-scrollbar-track { background: #0d1117; }
                    ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 5px; }
                  </style>
                  <script>${DARK_MODE_SCRIPT}</script>
                </head>
                <body>${email.bodyHtml}</body>
              </html>
            `}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#0d1117'
            }}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-scripts"
            title="Email Content"
          />
        ) : (
          <Box
            p={4}
            sx={{
              fontSize: 3,
              lineHeight: 1.6,
              color: 'fg.default',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              height: '100%',
              overflow: 'auto',
              bg: '#0d1117'
            }}
          >
            {email.bodyText || email.snippet}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default EmailDetail
