// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/login';
import Products from './pages/Products';
import AboutUs from './pages/AboutUs';
import Formulario from './pages/Formulario';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import Cart from './pages/Cart';
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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Content />
        {/* ToastContainer global para notificaciones */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
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

  // Verificar si el usuario está logueado para rutas protegidas
  const isLoggedIn = () => {
    return localStorage.getItem('userSession') !== null;
  };

  // Componente de ruta protegida
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn()) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
      return null;
    }
    return children;
  };

  return (
    <>
      {shouldShowNav && (
        isAdminRoute ? 
        <AdminNavbar /> : 
        <Navbar isAdmin={User?.role === 'admin'} />
      )}

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/formulario" element={<Formulario />} />
        
        {/* Rutas de usuario (públicas) */}
        <Route path="/OrderHistory" element={<OrderHistory />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Rutas de administración */}
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/agregar_prov" element={<AgregarProv />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/add_products" element={<AddProducts />} />
        <Route path="/HomeAdmind" element={<HomeAdmind />} />
        <Route path="/categories" element={<Categories />} />

        {/* Ruta 404 - página no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {shouldShowFooter && <Footer />}
    </>
  );
}

// Componente para páginas no encontradas
function NotFound() {
  return (
    <div style={notFoundStyles.container}>
      <div style={notFoundStyles.content}>
        <h1 style={notFoundStyles.title}>404</h1>
        <h2 style={notFoundStyles.subtitle}>Página no encontrada</h2>
        <p style={notFoundStyles.message}>
          Lo sentimos, la página que buscas no existe.
        </p>
        <button 
          style={notFoundStyles.button}
          onClick={() => window.location.href = '/'}
        >
          🏠 Volver al inicio
        </button>
      </div>
    </div>
  );
}

const notFoundStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
  content: {
    textAlign: 'center',
    background: 'white',
    padding: '60px 40px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '72px',
    fontWeight: 'bold',
    color: '#667eea',
    margin: '0 0 20px 0',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    fontSize: '28px',
    color: '#333',
    margin: '0 0 15px 0',
    fontWeight: '600',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 30px 0',
    lineHeight: '1.5',
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  },
};

export default App;