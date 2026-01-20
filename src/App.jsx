import React from 'react'
import { Routes, Route, useOutletContext } from 'react-router-dom'

import Home from './Home'
import MembersArea from './MembersArea'
import Dashboard from './pages/Dashboard'
import Mina from './pages/Mina' // <--- IMPORTADO
import Audios from './pages/Audios' // <--- IMPORTADO
import Diagnostico from './pages/Diagnostico' // <--- IMPORTADO

// Wrapper para passar dados do Layout para o Dashboard
const DashboardWrapper = () => {
  const props = useOutletContext()
  return <Dashboard {...props} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="/sucesso" element={<MembersArea />}>
        {/* Rota Padrão = Dashboard */}
        <Route index element={<DashboardWrapper />} />
        
        <Route path="dashboard" element={<DashboardWrapper />} />
        <Route path="mina" element={<Mina />} />
        <Route path="audios" element={<Audios />} />
        <Route path="diagnostico" element={<Diagnostico />} />
      </Route>
    </Routes>
  )
}

export default App