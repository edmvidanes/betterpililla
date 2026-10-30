import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import SmoothScroll from './app/SmoothScroll.tsx'

const root = document.getElementById('root')!
const app = <StrictMode><SmoothScroll><App /></SmoothScroll></StrictMode>
if (root.hasAttribute('data-prerendered')) hydrateRoot(root, app)
else createRoot(root).render(app)
