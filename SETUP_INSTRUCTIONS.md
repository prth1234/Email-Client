# Email Client Setup

## Step 1: Google Cloud Configuration (Crucial)
To query your Gmail, you must set up a project in Google Cloud.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. In the sidebar, go to **APIs & Services > Library**.
4. Search for "**Gmail API**" and enable it.
5. Go to **APIs & Services > OAuth consent screen**.
   - Select **External**.
   - Fill in required fields (App name, support email).
   - **Important**: In "Test users", add your own gmail address (since the app is in testing mode).
6. Go to **APIs & Services > Credentials**.
7. Click **Create Credentials** -> **OAuth client ID**.
8. Application type: **Web application**.
9. Name: "My Email Client".
10. **Authorized redirect URIs**: Add `http://localhost:3001/oauth2callback`.
11. Click Create. Copy your **Client ID** and **Client Secret**.

## Step 2: Configure Backend
1. Open `backend/.env`.
2. Paste your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

## Step 3: Run the App

**Backend:**
```bash
cd backend
npm start
``` 
(Server requests will run on port 3001)

**Frontend:**
```bash
cd frontend
npm run dev
```
(UI will run on port 5173 usually)

## Step 4: Authenticate
1. Open the frontend URL (e.g., http://localhost:5173).
2. Click "Authenticate with Gmail".
3. Sign in with the Google account you added as a test user.
4. Once redirected to "Authentication successful", go back to the app and click "Fetch Raw Data".
