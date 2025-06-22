import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../style/WelcomeAdmin.css';

const HomeAdmind = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    Cookies.remove('token');
    navigate('/');
  };

  return (
    <div className="home-admin">
      <div className="admin-content">
        <h1 className="welcome-title">¡Bienvenido, Administrador!</h1>
        <p className="welcome-subtitle">Utilice el menú de navegación para gestionar el sistema.</p>
      </div>
    </div>
  );
};

export default HomeAdmind;
