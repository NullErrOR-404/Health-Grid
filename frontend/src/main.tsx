import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { purgeAllTestArtifacts } from './services/authService'

// Proactively purge any residual test fixtures or mock profiles from browser storage
purgeAllTestArtifacts();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
