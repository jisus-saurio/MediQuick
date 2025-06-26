import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/LoginForm.css";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    address: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Email y contraseña son requeridos");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Correo electrónico inválido");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      console.log('Resultado del login:', result);
      
      if (result && result.success) {
        console.log('Usuario del backend:', result.user);
        
        // El backend ahora devuelve todos los datos del usuario
        const sessionData = {
          userId: result.user.id,
          email: result.user.email,
          userType: result.user.userType,
          loginTime: new Date().toISOString()
        };
        
        console.log('Guardando sessionData:', sessionData);
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        
        // Guardar perfil con datos del backend
        const userProfile = {
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          address: result.user.address,
          password: '********'
        };
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Disparar evento para actualizar navegación
        window.dispatchEvent(new CustomEvent('loginStateChanged'));
        
        toast.success("Inicio de sesión exitoso");
        
        // Redirigir usando la ruta del AuthContext
        const redirectPath = result.redirectTo || "/";
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      } else {
        toast.error(result?.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error completo en login:", error);
      toast.error("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, address, phone } = formData;

    if (!name || !email || !password || !address || !phone) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Correo electrónico inválido");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
        setIsLogin(true);
        setFormData({
          email: formData.email, 
          password: "",
          name: "",
          address: "",
          phone: "",
        });
      } else {
        toast.error(data.message || "Error al registrar");
      }
    } catch (error) {
      toast.error("Error de conexión al registrar");
      console.error("Error en registro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isLogin) {
      handleLogin();
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <div className="tabs">
          <span 
            className={isLogin ? "active" : ""} 
            onClick={() => !isLoading && setIsLogin(true)}
          >
            Iniciar Sesión
          </span>
          <span 
            className={!isLogin ? "active" : ""} 
            onClick={() => !isLoading && setIsLogin(false)}
          >
            Registrarse
          </span>
        </div>

        {isLogin ? (
          <div className="inputs">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              required
            />
            <div className="forgot">
              <a href="#" onClick={(e) => e.preventDefault()}>
                ¿Olvidaste tu Contraseña?
              </a>
            </div>
            <button 
              className="login-btn" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Iniciando..." : "Iniciar Sesión"}
            </button>
            
            {/* Botón para continuar sin iniciar sesión */}
            <button 
              className="guest-btn" 
              onClick={() => navigate("/")}
              type="button"
              disabled={isLoading}
              style={{
                background: 'transparent',
                border: '1px solid #ccc',
                marginTop: '10px',
                color: '#666'
              }}
            >
              Continuar como invitado
            </button>
          </div>
        ) : (
          <form className="inputs" onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña (mín. 6 caracteres)"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              minLength="6"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Dirección"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? "Registrando..." : "Registrarse"}
            </button>
          </form>
        )}
      </div>
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
      />
    </div>
  );
};

export default LoginForm;