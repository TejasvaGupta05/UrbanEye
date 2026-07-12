import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import { AccessibilityProvider } from './context/AccessibilityContext'

const GOOGLE_CLIENT_ID = '528083978984-5o5fpjsvn3cqj4n0eeh10f0m0t4hkvlr.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AccessibilityProvider>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <App />
                </BrowserRouter>
            </AccessibilityProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
