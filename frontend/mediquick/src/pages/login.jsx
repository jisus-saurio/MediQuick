import React from 'react';
import '../style/LoginForm.css'; 

const LoginForm = () => {
  return (
    <div className="container"> {/* Contenedor principal del formulario */}
      <div className="login-box"> {/* Caja que contiene el formulario */}
        
        <div className="tabs"> {/* Pestañas de navegación (login y registro) */}
          <span className="active">Login</span> {/* Pestaña activa: Login */}
          <span>Sign up</span> {/* Pestaña inactiva: Sign up */}
        </div>

        <div className="inputs"> {/* Contenedor de los campos de entrada */}
          <input type="text" placeholder="Username" /> {/* Campo para el nombre de usuario */}
          <input type="password" placeholder="Password" /> {/* Campo para la contraseña */}
        </div>

        <div className="forgot"> {/* Enlace para recuperar contraseña */}
          <a href="#">¿Olvidaste tu Contraseña?</a>
        </div>

        <button className="login-btn">Login</button> {/* Botón para enviar el formulario de login */}
      </div>
    </div>
  );
}

export default LoginForm; 
