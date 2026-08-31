import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './profile.css'
import './mission.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
if (!isLocalDev && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed', error)
    })
  })
}
