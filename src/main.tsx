import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import SmoothScroll from './app/SmoothScroll.tsx'

const root = document.getElementById('root')!
const app = <StrictMode><SmoothScroll><App /></SmoothScroll></StrictMode>
const segments = location.pathname.slice(import.meta.env.BASE_URL.length).split('/').filter(Boolean)
const homePath = !segments.length || segments.length === 1 && ['en', 'fil'].includes(segments[0])
if (root.hasAttribute('data-prerendered') && homePath) hydrateRoot(root, app)
else createRoot(root).render(app)
