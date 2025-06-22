import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../style/AdminNavbar.css'; // Asegúrate de tener este archivo CSS para estilos

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    Cookies.remove('token');
    navigate('/');
  };

  return (
    <nav className="admin-nav">
      <Link to="/HomeAdmind" className="nav-title">
        Panel Administrador
      </Link>
      <ul className="nav-links">
        <li><Link to="/categories">Categorías</Link></li>
        <li><Link to="/employees">Empleados</Link></li>
        <li><Link to="/add_products">Productos</Link></li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
