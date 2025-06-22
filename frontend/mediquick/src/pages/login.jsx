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

    // Verifica que el email y la contraseña no estén vacíos
    if (!email || !password) {
      toast.error("Email y contraseña son requeridos");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Correo electrónico inválido");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success("Inicio de sesión exitoso");
      navigate("/HomeAdmind");
    } else {
      toast.error(result.message || "Error al iniciar sesión");
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
        toast.success("Registro exitoso");
        setIsLogin(true);
        setFormData({
          email: "",
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
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <div className="tabs">
          <span className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>
            Login
          </span>
          <span className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>
            Sign up
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
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="forgot">
              <a href="#">¿Olvidaste tu Contraseña?</a>
            </div>
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
          </div>
        ) : (
          <form className="inputs" onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <button type="submit" className="login-btn">
              Register
            </button>
          </form>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default LoginForm;
