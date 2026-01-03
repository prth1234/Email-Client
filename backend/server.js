const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load credentials from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/oauth2callback`;

let oAuth2Client;

if (CLIENT_ID && CLIENT_SECRET) {
    oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );
} else {
    console.warn("WARNING: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set in .env");
}

// Scopes for Gmail API
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email'
];

// Helper: Extract header value
const getHeader = (headers, name) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
};

// Helper: Decode base64url
const decodeBase64 = (str) => {
    try {
        return Buffer.from(str, 'base64').toString('utf-8');
    } catch (e) {
        return str;
    }
};

// Helper: Strip HTML tags and decode entities
const stripHtml = (html) => {
    if (!html) return '';

    // Remove HTML tags
    let text = html.replace(/<style[^>]*>.*?<\/style>/gis, '');
    text = text.replace(/<script[^>]*>.*?<\/script>/gis, '');
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&rsquo;/g, "'");
    text = text.replace(/&ldquo;/g, '"');
    text = text.replace(/&rdquo;/g, '"');

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n\n');
    text = text.trim();

    return text;
};

// Helper: Extract email body
const extractBody = (payload) => {
    let plainText = '';
    let htmlText = '';

    const extractFromPart = (part) => {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
            plainText = decodeBase64(part.body.data);
        }
        if (part.mimeType === 'text/html' && part.body && part.body.data) {
            htmlText = decodeBase64(part.body.data);
        }
        if (part.parts) {
            for (const subPart of part.parts) {
                extractFromPart(subPart);
            }
        }
    };

    // First check if body is directly in payload
    if (payload.body && payload.body.data) {
        const decoded = decodeBase64(payload.body.data);
        if (payload.mimeType === 'text/plain') {
            plainText = decoded;
        } else if (payload.mimeType === 'text/html') {
            htmlText = decoded;
        }
    }

    // Extract from parts
    if (payload.parts) {
        extractFromPart(payload);
    }

    return {
        html: htmlText,
        text: plainText
    };
};

// Helper: Categorize email based on headers and content
const categorizeEmail = (headers, snippet) => {
    const from = getHeader(headers, 'from').toLowerCase();
    const subject = getHeader(headers, 'subject').toLowerCase();
    const listUnsubscribe = getHeader(headers, 'list-unsubscribe');

    // Social networks
    if (from.includes('linkedin') || from.includes('twitter') || from.includes('facebook') ||
        from.includes('instagram') || from.includes('github')) {
        return 'Social';
    }

    // Promotions/Marketing
    if (listUnsubscribe || subject.includes('offer') || subject.includes('sale') ||
        subject.includes('discount') || subject.includes('deal') || snippet.toLowerCase().includes('unsubscribe')) {
        return 'Promotion';
    }

    // Updates (newsletters, notifications)
    if (subject.includes('update') || subject.includes('newsletter') ||
        subject.includes('notification') || from.includes('noreply') || from.includes('no-reply')) {
        return 'Update';
    }

    return 'Primary';
};

// Helper: Parse email message
const parseMessage = (message) => {
    const headers = message.payload.headers;
    const from = getHeader(headers, 'from');
    const subject = getHeader(headers, 'subject');
    const date = getHeader(headers, 'date');
    const snippet = message.snippet || '';
    const bodyContent = extractBody(message.payload);

    // Extract sender name and email
    const fromMatch = from.match(/(.*?)\s*<(.+)>/) || [null, from, from];
    const senderName = fromMatch[1] ? fromMatch[1].replace(/"/g, '').trim() : fromMatch[2];
    const senderEmail = fromMatch[2] || from;

    const category = categorizeEmail(headers, snippet);

    return {
        id: message.id,
        threadId: message.threadId,
        senderName,
        senderEmail,
        subject,
        snippet,
        bodyHtml: bodyContent.html,
        bodyText: bodyContent.text,
        date: new Date(date).toISOString(),
        timestamp: new Date(date).getTime(),
        category,
        isUnread: message.labelIds?.includes('UNREAD') || false,
        isStarred: message.labelIds?.includes('STARRED') || false,
        labels: message.labelIds || []
    };
};

// 1. Route to generate Auth URL
app.get('/auth/url', (req, res) => {
    if (!oAuth2Client) return res.status(500).json({ error: 'OAuth client not configured' });

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    res.json({ url: authUrl });
});

// 1b. Direct Google Auth (for same-page flow)
app.get('/auth/google', (req, res) => {
    if (!oAuth2Client) return res.status(500).send('OAuth client not configured');

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    res.redirect(authUrl);
});

// 2. OAuth Callback Handler
app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    if (!oAuth2Client) {
        return res.status(500).send('OAuth client not configured. Please check your .env file and restart the server.');
    }

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        console.log('Tokens acquired:', tokens);

        // Redirect back to frontend instead of showing success message
        res.redirect('http://localhost:5173/');
    } catch (error) {
        console.error('Error retrieving access token', error);
        res.status(500).send(`Error retrieving access token: ${error.message}`);
    }
});

// Middleware to check if authenticated
const checkAuth = (req, res, next) => {
    if (!oAuth2Client || !oAuth2Client.credentials) {
        return res.status(401).json({ error: 'Not authenticated. Go to /auth/url first.' });
    }
    next();
};

// Get Profile
app.get('/api/gmail/profile', checkAuth, async (req, res) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const profile = await gmail.users.getProfile({ userId: 'me' });
        res.json(profile.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Emails (Parsed and Categorized)
// Get Emails (Parsed and Categorized)
app.get('/api/emails', checkAuth, async (req, res) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const maxResults = parseInt(req.query.limit) || 20;
        const query = req.query.q || '';
        const pageToken = req.query.pageToken;

        // List messages
        const listResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults,
            q: query,
            pageToken: pageToken
        });

        if (!listResponse.data.messages) {
            return res.json({ emails: [], nextPageToken: null });
        }

        // Fetch full message details
        const messagePromises = listResponse.data.messages.map(msg =>
            gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full'
            })
        );

        const messages = await Promise.all(messagePromises);
        const parsedEmails = messages.map(m => parseMessage(m.data));

        // Sort by timestamp (newest first)
        parsedEmails.sort((a, b) => b.timestamp - a.timestamp);

        res.json({
            emails: parsedEmails,
            nextPageToken: listResponse.data.nextPageToken || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Email
app.get('/api/emails/:id', checkAuth, async (req, res) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: req.params.id,
            format: 'full'
        });

        const parsed = parseMessage(response.data);
        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark as Read
app.post('/api/emails/:id/read', checkAuth, async (req, res) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        await gmail.users.messages.modify({
            userId: 'me',
            id: req.params.id,
            requestBody: {
                removeLabelIds: ['UNREAD']
            }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
