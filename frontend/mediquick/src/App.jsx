import {BrowserRouter as Router, Routes, Route}from 'react-router'
import Home from './pages/Home'
import Navbar from './components/Nav'

function App() {
 

  return (
    <>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
      
    </>
  )
}

export default App
