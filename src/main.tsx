import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Fira Sans: von Erik Spiekermann (mit-)gestaltet - derselbe Designer wie bei den
// DB-Hausschriften, daher die nächste frei verfügbare Alternative zu DB Neo.
import '@fontsource/fira-sans/400.css'
import '@fontsource/fira-sans/500.css'
import '@fontsource/fira-sans/600.css'
import '@fontsource/fira-sans/700.css'
import '@fontsource/fira-sans/800.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
