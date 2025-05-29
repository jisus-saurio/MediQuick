import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';  // Importa la librería para manejar cookies si la usas
import '../style/WelcomeAdmin.css';

const HomeAdmind = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // elimina token
    Cookies.remove('token'); // elimina cookie 'token' si usas cookies para la sesión (opcional)
    navigate('/'); // redirige a la ruta raíz "/"
  };

  return (
    <div className="welcome-container">
      <h1 className="welcome-title">¡Bienvenido, Administrador!</h1>
      <p className="welcome-subtitle">Seleccione una opción para continuar:</p>

      <div className="button-group">
        <button className="admin-button" onClick={() => navigate('/categories')}>
          Ver Categorias
        </button>
        <button className="admin-button" onClick={() => navigate('/employees')}>
          Agregar Empleado
        </button>
        <button className="admin-button" onClick={() => navigate('/add_products')}>
          Productos
        </button>
        <button className="admin-button logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default HomeAdmind;
