// Importar todo lo de la librería "express"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jsonwebtoken from "jsonwebtoken";
import { config } from "./src/config.js";

// Importar rutas existentes
import userRoutes from "./src/routes/user.js";
import employeesRoutes from "./src/routes/employees.js";
import categoriesRoutes from "./src/routes/catergories.js";
import productsRoutes from "./src/routes/products.js";
import discountsRoutes from "./src/routes/discounts.js";
import cartsRoutes from "./src/routes/carts.js";
import salesRoutes from "./src/routes/Sales.js";
import suppliersRoutes from "./src/routes/suppliers.js";
import orderRoutes from "./src/routes/orders.js";
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";

// Importar nueva ruta de verificación
import verificationRoutes from "./src/routes/verification.js";

import { validateAuthToken } from "./src/middleware/validateAuthToken.js";

// Crear una instancia de Express
const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true, // Permitir envío de cookies y credenciales
  })
);

// Middleware para analizar JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos (imágenes de productos, etc.)
app.use('/uploads', express.static('uploads'));

// ===== RUTAS PÚBLICAS (sin autenticación requerida) =====
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);

// Nueva ruta de verificación (PÚBLICA)
app.use("/api/verification", verificationRoutes);

// Rutas de productos - AHORA PÚBLICAS para visualización (se maneja internamente)
app.use("/api/products", productsRoutes);

// Rutas de categorías - AHORA PÚBLICAS para visualización (se maneja internamente)
app.use("/api/categories", categoriesRoutes);

// ===== RUTAS PROTEGIDAS POR AUTENTICACIÓN =====

// Rutas solo para administradores
app.use("/api/users", userRoutes);
app.use("/api/employees", validateAuthToken(["Admin"]), employeesRoutes);
app.use("/api/discounts", validateAuthToken(["Admin"]), discountsRoutes);
app.use("/api/suppliers", validateAuthToken(["Admin"]), suppliersRoutes);

// Rutas para empleados, administradores y usuarios autenticados
app.use("/api/carts", validateAuthToken(["Employee", "Admin", "User"]), cartsRoutes);
app.use("/api/orders", validateAuthToken(["Employee", "Admin", "User"]), orderRoutes);

// Rutas para empleados y administradores solamente
app.use("/api/sales", validateAuthToken(["Employee", "Admin"]), salesRoutes);

// Ruta para verificar autenticación (útil para el frontend)
app.get("/api/auth/verify", (req, res) => {
  try {
    const { authToken } = req.cookies;
    
    if (!authToken) {
      return res.status(401).json({ 
        success: false, 
        message: "No token found" 
      });
    }

    const decoded = jsonwebtoken.verify(authToken, config.JWT.SECRET);
    
    res.json({
      success: true,
      user: {
        id: decoded.id,
        userType: decoded.userType
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: "Invalid token" 
    });
  }
});

// Ruta de fallback para APIs no encontradas
app.use("/api/*", (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "API endpoint not found" 
  });
});

// Exportar la instancia de la aplicación para poder usar Express en otros archivos
export default app;