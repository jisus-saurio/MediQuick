import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Products from './pages/Products'
import AboutUs from './pages/AboutUs'
import Formulario from './pages/Formulario'
import Navbar from './components/Nav'
import Footer from './components/Footer'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path='/AboutUs' element={<AboutUs/>} />
        
        <Route path="/formulario" element={<Formulario />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
