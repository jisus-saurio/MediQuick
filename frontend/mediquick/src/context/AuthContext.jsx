import React, { createContext, useContext, useState, useEffect } from "react";

// URL base de tu API
const API = "/api";

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API}/auth/verify`, {
        method: 'GET',
        credentials: 'include', // Importante para enviar cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        // Limpiar localStorage si hay datos obsoletos
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Importante para recibir cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar estado del usuario
        const userData = { 
          email, 
          userType: data.userType 
        };
        
        setUser(userData);
        
        // Guardar en localStorage como respaldo (opcional)
        localStorage.setItem("user", JSON.stringify(userData));

        return { 
          success: true, 
          message: data.message,
          userType: data.userType,
          redirectTo: data.redirectTo // Esta viene del backend
        };
      } else {
        return { 
          success: false, 
          message: data.message || "Error en la autenticación" 
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: "Error de conexión. Intente nuevamente." 
      };
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout en el backend
      await fetch(`${API}/logout`, {
        method: "POST",
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local independientemente del resultado
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  // Funciones auxiliares para verificar permisos
  const isAuthenticated = () => {
    return user !== null;
  };

  const isAdmin = () => {
    return user && (user.userType === 'Admin' || user.userType === 'Employee');
  };

  const isUser = () => {
    return user && user.userType === 'User';
  };

  const getUserType = () => {
    return user ? user.userType : null;
  };

  // Función para hacer peticiones autenticadas
  const fetchWithAuth = async (url, options = {}) => {
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Si el token expiró, limpiar estado
      if (response.status === 401) {
        setUser(null);
        localStorage.removeItem("user");
      }
      
      return response;
    } catch (error) {
      console.error('Error en petición autenticada:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isUser,
    getUserType,
    checkAuthStatus,
    fetchWithAuth,
    API
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};