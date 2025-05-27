import React, { useState } from "react";
import "../style/LoginForm.css";

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true); 

  return (
    <div className="container">
      <div className="login-box">
        <div className="tabs">
          <span
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </span>
          <span
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Sign up
          </span>
        </div>

        {isLogin ? (
          <div className="inputs">
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <div className="forgot">
              <a href="#">¿Olvidaste tu Contraseña?</a>
            </div>
            <button className="login-btn">Login</button>
          </div>
        ) : (
          <form className="inputs">
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <input type="text" placeholder="Address" required />
            <input type="text" placeholder="Phone" required />
            <button type="submit" className="login-btn">
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
