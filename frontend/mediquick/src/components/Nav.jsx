import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartIcon from "./CartIcon";

function Navbar({ isAdmin }) {
  const [active, setActive] = useState("Home");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Verificar si el usuario está logueado
    const userSession = localStorage.getItem('userSession');
    setIsLoggedIn(!!userSession);
    
    // Escuchar cambios en el estado de login
    const handleLoginChange = () => {
      const userSession = localStorage.getItem('userSession');
      setIsLoggedIn(!!userSession);
    };

    window.addEventListener('loginStateChanged', handleLoginChange);
    return () => window.removeEventListener('loginStateChanged', handleLoginChange);
  }, []);

  const handleClick = (name) => {
    setActive(name);
    setIsOpen(false);
    navigate(getPath(name));
  };

  const handleLoginClick = () => {
    setActive("Login");
    setIsOpen(false);
    navigate("/login");
  };

  const handleLogout = () => {
    // Limpiar datos de sesión
    localStorage.removeItem('userSession');
    localStorage.removeItem('userProfile');
    
    // Disparar evento de cambio de estado
    window.dispatchEvent(new CustomEvent('loginStateChanged'));
    
    // Redirigir al home
    setActive("Home");
    setIsOpen(false);
    navigate("/");
    
    // Mostrar mensaje de confirmación si hay toast disponible
    if (window.toast) {
      window.toast.success('Sesión cerrada correctamente');
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.menuContainer}>
        {isMobile ? (
          <>
            <div style={styles.burger} onClick={() => setIsOpen(true)}>
              <div style={styles.bar}></div>
              <div style={styles.bar}></div>
              <div style={styles.bar}></div>
            </div>
          </>
        ) : (
          <div style={styles.menu}>
            {["Home", "Products", "About us", "Contact"].map((item) => (
              <div
                key={item}
                onClick={() => handleClick(item)}
                style={styles.menuItem}
              >
                <span
                  style={{
                    ...styles.link,
                    color: active === item ? "#ff6600" : "#004466",
                  }}
                >
                  {item}
                </span>
                {active === item && <div style={styles.underline}></div>}
              </div>
            ))}


            {/* Enlace al perfil (siempre visible) */}
            <div
              onClick={() => handleClick("Profile")}
              style={styles.menuItem}
            >
              <span
                style={{
                  ...styles.link,
                  color: active === "Profile" ? "#ff6600" : "#004466",
                }}
              >
                👤 Mi Perfil
              </span>
              {active === "Profile" && <div style={styles.underline}></div>}
            </div>

            {isAdmin && (
              <div
                onClick={() => handleClick("HomeAdmin")}
                style={styles.menuItem}
              >
                <span
                  style={{
                    ...styles.link,
                    color: active === "HomeAdmin" ? "#ff6600" : "#004466",
                  }}
                >
                  ⚙️ Admin Panel
                </span>
                {active === "HomeAdmin" && <div style={styles.underline}></div>}
              </div>
            )}
          </div>
        )}

        <div style={styles.rightSection}>
          <CartIcon />
          
          {/* Mostrar botón de login o logout dependiendo del estado */}
          {isLoggedIn ? (
            <div onClick={handleLogout} style={styles.loginContainer}>
              <button style={styles.logoutButton}>
                🚪 Cerrar Sesión
              </button>
            </div>
          ) : (
            <div onClick={handleLoginClick} style={styles.loginContainer}>
              <button style={styles.loginButton}>
                🔑 Login
              </button>
              {active === "Login" && (
                <div style={{ ...styles.underline, marginTop: "5px" }}></div>
              )}
            </div>
          )}
        </div>
      </div>

      {isMobile && isOpen && (
        <div style={styles.overlayMenu}>
          <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
            ×
          </button>
          {["Home", "Products", "About us", "Contact"].map((item) => (
            <div
              key={item}
              onClick={() => handleClick(item)}
              style={styles.overlayItem}
            >
              {item}
            </div>
          ))}

          {/* Perfil en menú móvil (siempre visible) */}
          <div
            onClick={() => handleClick("Profile")}
            style={styles.overlayItem}
          >
            👤 Mi Perfil
          </div>
          
          {isAdmin && (
            <div
              onClick={() => handleClick("HomeAdmin")}
              style={styles.overlayItem}
            >
              ⚙️ Admin Panel
            </div>
          )}
          
          <div
            onClick={() => handleClick("Cart")}
            style={styles.overlayItem}
          >
            🛒 Carrito
          </div>

          {/* Botón de logout en menú móvil */}
          {isLoggedIn && (
            <div
              onClick={handleLogout}
              style={styles.overlayItem}
            >
              🚪 Cerrar Sesión
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function getPath(name) {
  switch (name) {
    case "Home":
      return "/";
    case "Products":
      return "/products";
    case "About us":
      return "/aboutUs";
    case "Contact":
      return "/Formulario";
    case "Profile":
      return "/profile";
    case "HomeAdmin":
      return "/HomeAdmin";
    case "Cart":
      return "/cart";
    default:
      return "/";
  }
}

const styles = {
  nav: {
    position: "relative",
    width: "100%",
    background: "transparent",
    zIndex: 100,
  },
  menuContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: "10px 20px",
  },
  burger: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    cursor: "pointer",
    position: "absolute",
    left: "20px",
  },
  bar: {
    width: "25px",
    height: "3px",
    backgroundColor: "#004466",
  },
  menu: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
  },
  menuItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  link: {
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "16px",
    transition: "all 0.3s ease",
  },
  underline: {
    width: "100%",
    height: "3px",
    backgroundColor: "#ff6600",
    marginTop: "4px",
    borderRadius: "5px",
    transition: "all 0.3s ease",
  },
  rightSection: {
    position: "absolute",
    right: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  loginContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loginButton: {
    background: "linear-gradient(135deg, #7dbbe6 0%, #5a9bd4 100%)",
    border: "none",
    padding: "10px 20px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(125, 187, 230, 0.3)",
  },
  logoutButton: {
    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
    border: "none",
    padding: "10px 20px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(220, 53, 69, 0.3)",
  },
  overlayMenu: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: "20px",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  },
  overlayItem: {
    fontSize: "20px",
    margin: "15px 0",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#004466",
    padding: "10px 20px",
    borderRadius: "10px",
    transition: "all 0.3s ease",
    textAlign: "center",
    minWidth: "200px",
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "32px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#004466",
    fontWeight: "bold",
  },
};

export default Navbar;