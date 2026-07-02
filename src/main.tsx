import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SWRConfig } from 'swr'
import './styles/index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SWRConfig value={{
      dedupingInterval: 10000,
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }}>
      <App />
    </SWRConfig>
  </StrictMode>,
)
