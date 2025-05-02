import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [active, setActive] = useState('Home');
  const navigate = useNavigate();

  const handleClick = (name) => {
    setActive(name);
    navigate(getPath(name));
  };

  const handleLoginClick = () => {
    setActive('Login');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.menu}>
        {['Home', 'Products', 'About us', 'Contact'].map((item) => (
          <div
            key={item}
            onClick={() => handleClick(item)}
            style={styles.menuItem}
          >
            <span
              style={{
                ...styles.link,
                color: active === item ? '#ff6600' : '#004466',
              }}
            >
              {item}
            </span>
            {active === item && <div style={styles.underline}></div>}
          </div>
        ))}
      </div>

      {/* Login Button */}
      <div
        onClick={handleLoginClick}
        style={{
          ...styles.menuItem,
          position: 'absolute',
          right: '20px',
        }}
      >
        <button style={styles.loginButton}>
          Login
        </button>
        {active === 'Login' && <div style={{ ...styles.underline, marginTop: '5px' }}></div>}
      </div>
    </nav>
  );
}

function getPath(name) {
  switch (name) {
    case 'Home':
      return '/';
    case 'Products':
      return '/products';
    case 'About us':
      return '/aboutUs'; // Cambiado a '/aboutUs'
    case 'Contact':
      return '/formulario'; // Cambiado a '/formulario'
    default:
      return '/';
  }
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px 20px',
    background: 'transparent',
    position: 'relative',
    width: '97%', // Ancho completo
    height: '40px', // Altura fija
  },
  menu: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  link: {
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  underline: {
    width: '100%',
    height: '3px',
    backgroundColor: '#ff6600',
    marginTop: '4px',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
  },
  loginButton: {
    background: '#7dbbe6',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
    cursor: 'pointer',
  },
};

export default Navbar;
