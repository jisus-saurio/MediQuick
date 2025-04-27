import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Nav'
import Login from './pages/login'   // <-- corregido aquí

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} /> {/* <-- este nuevo */}
        </Routes>
      </Router>
    </>
  )
}

export default App
