import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Configuración de base de datos
  DB: {
    URI: process.env.DB_URI
  },
  
  // Configuración del servidor
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Configuración JWT
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES: process.env.JWT_EXPIRES || "1h" 
  },
  
  // Credenciales de administrador
  adminf: {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
  },
  
  // Configuración de email (si usas envío de emails)
  EMAIL: {
    USER: process.env.USER_EMAIL,
    PASS: process.env.USER_PASS
  },
  
  // Configuración de Cloudinary
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_KEY: process.env.CLOUD_API_KEY,
    API_SECRET: process.env.CLOUD_API_SECRET
  },
  
  // URL del frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173"
};