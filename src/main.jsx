import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Callback from './pages/Callback'
import Setup from './pages/Setup'
import Game from './pages/Game'
import Finished from './pages/Finished'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/game" element={<Game />} />
        <Route path="/finished" element={<Finished />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)