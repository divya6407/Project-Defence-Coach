import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SummaryCard from './pages/SummaryCard.jsx'



function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/analyze' element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
