import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import SmoothScroll from './app/SmoothScroll.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScroll><App /></SmoothScroll>
  </StrictMode>,
)
