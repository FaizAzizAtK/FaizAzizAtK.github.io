import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

const root = document.getElementById('root')
const initialPath = root.dataset.path ?? ''
const app = (
  <StrictMode>
    <App initialPath={initialPath} />
  </StrictMode>
)
if (root.firstChild) hydrateRoot(root, app)
else createRoot(root).render(app)
