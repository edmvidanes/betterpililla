import { renderToString } from 'react-dom/server'
import App from './App'
import SmoothScroll from './SmoothScroll'

export function renderHome(locale: 'en' | 'fil') {
  return renderToString(<SmoothScroll><App initialPath={`${locale}/`} /></SmoothScroll>)
}
