import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, BaseStyles } from '@primer/react'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider colorMode="dark" preventSSRMismatch>
      <BaseStyles>
        <App />
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>,
)
