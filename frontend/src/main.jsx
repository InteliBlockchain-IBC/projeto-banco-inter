import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.documentElement.dataset.theme = window.localStorage.getItem('inter-theme') === 'dark' ? 'dark' : 'light'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
