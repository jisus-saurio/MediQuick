import React from 'react'
import '../style/LoginForm.css' // Tu CSS

const LoginForm = () => {
  return (
    <div className="container"> {/* <- AGREGA ESTA CLASE */}
      <div className="login-box">
        <div className="tabs">
          <span className="active">Login</span>
          <span>Sign up</span>
        </div>

        <div className="inputs">
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
        </div>

        <div className="forgot">
          <a href="#">¿Olvidaste tu Contraseña?</a>
        </div>

        <button className="login-btn">Login</button>
      </div>
    </div>
  )
}

export default LoginForm
