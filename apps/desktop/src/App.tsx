import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { MedievalButton } from '@omega/ui'
import { supabase } from '@omega/db'

function App() {
  const [count, setCount] = useState(0)
  const [dbStatus, setDbStatus] = useState<string>('Esperando...')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('count');
        if (error) throw error;
        setDbStatus('✅ Conectado a Supabase');
      } catch (err) {
        setDbStatus('❌ Error de conexión (revisa el .env)');
      }
    };
    testConnection();
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Electron</h1>
      <div className="card">
        <p>Base de Datos: <strong>{dbStatus}</strong></p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div style={{ marginTop: 20 }}>
        <MedievalButton title="Hola desde Desktop RPG!" />
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
