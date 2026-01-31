import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/voice" element={<div>Voice App Coming Soon</div>} />
      <Route path="/image" element={<div>Image App Coming Soon</div>} />
      <Route path="/text" element={<div>Text App Coming Soon</div>} />
      <Route path="/settings" element={<div>Settings Coming Soon</div>} />
    </Routes>
  )
}

export default App
