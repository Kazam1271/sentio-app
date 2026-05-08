import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BioSensorProvider } from './contexts/BioSensorContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BioSensorProvider>
      <App />
    </BioSensorProvider>
  </StrictMode>,
)
