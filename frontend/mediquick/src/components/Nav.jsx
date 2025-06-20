import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartIcon from "./CartIcon";

function Navbar({ isAdmin }) {
  const [active, setActive] = useState("Home");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
                  Admin Panel
                </span>
                {active === "HomeAdmin" && <div style={styles.underline}></div>}
              </div>
            )}
          </div>
        )}

        <div style={styles.rightSection}>
          <CartIcon />
          <div onClick={handleLoginClick} style={styles.loginContainer}>
            <button style={styles.loginButton}>Login</button>
            {active === "Login" && (
              <div style={{ ...styles.underline, marginTop: "5px" }}></div>
            )}
          </div>
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
          {isAdmin && (
            <div
              onClick={() => handleClick("HomeAdmin")}
              style={styles.overlayItem}
            >
              Admin Panel
            </div>
          )}
          <div
            onClick={() => handleClick("Cart")}
            style={styles.overlayItem}
          >
            Carrito
          </div>
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
    gap: "30px",
    alignItems: "center",
  },
  menuItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
  },
  link: {
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "18px",
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
    background: "#7dbbe6",
    border: "none",
    padding: "10px 20px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
    cursor: "pointer",
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
  },
  overlayItem: {
    fontSize: "24px",
    margin: "20px 0",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#004466",
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
  },
};

export default Navbar;