import { createRoot } from 'react-dom/client'
import './index.css'
import "./i18n/i18n";


import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="722945803485-t1qi9c5kk3m6v3fj1ipnqv8hkm4ec8hq.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
)
