import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TxPage } from './components/TxPage.tsx'

const txHash = () => location.hash.match(/^#\/tx\/(0x[0-9a-fA-F]+)/)?.[1] ?? null

function Root() {
  const [h, setH] = useState(txHash)
  useEffect(() => { const f = () => setH(txHash()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return h ? <TxPage key={h} hash={h} /> : <App />
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>)
