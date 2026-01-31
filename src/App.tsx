import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import SettingsPage from './components/SettingsPage'
import VoiceApp from './apps/VoiceApp'
import ImageApp from './apps/ImageApp'
import TextApp from './apps/TextApp'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/voice" element={<VoiceApp />} />
      <Route path="/image" element={<ImageApp />} />
      <Route path="/text" element={<TextApp />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}

export default App
