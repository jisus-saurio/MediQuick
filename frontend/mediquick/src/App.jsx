// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/login';
import Products from './pages/Products';
import AboutUs from './pages/AboutUs';
import Formulario from './pages/Formulario';
import Navbar from './components/Nav';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import Proveedores from './pages/Proveedores';
import AgregarProv from './pages/AgregarProv';
import Employees from './pages/employees';
import AddProducts from './pages/AddProducts';
import HomeAdmind from './pages/HomeAdmind';
import Categories from './pages/Categories';
import { AuthProvider, useAuth } from './context/AuthContext';

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Content />
      </AuthProvider>
    </Router>
  );
}

function Content() {
  const location = useLocation();
  const { User } = useAuth();

  // Rutas donde no mostrar Navbar ni Footer
  const noNavRoutes = ['/login'];

  // Rutas consideradas admin (ajusta según tus rutas admin)
  const adminRoutes = [
    '/HomeAdmind',
    '/employees',
    '/add_products',
    '/categories',
    '/proveedores',
    '/agregar_prov',
  ];

  const isAdminRoute = adminRoutes.includes(location.pathname);
  const shouldShowNav = !noNavRoutes.includes(location.pathname);
  const shouldShowFooter = shouldShowNav && !isAdminRoute;

  return (
    <>
      {shouldShowNav && (isAdminRoute ? <AdminNavbar /> : <Navbar />)}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/formulario" element={<Formulario />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/agregar_prov" element={<AgregarProv />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/add_products" element={<AddProducts />} />
        <Route path="/HomeAdmind" element={<HomeAdmind />} />
        <Route path="/categories" element={<Categories />} />

        {/* Rutas protegidas */}
      </Routes>

      {shouldShowFooter && <Footer />}
    </>
  );
}

export default App;
