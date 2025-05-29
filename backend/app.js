// Importar todo lo de la librería "express"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Importar rutas
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
import { validateAuthToken } from "./src/middleware/validateAuthToken.js";

// Crear una instancia de Express
const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Permitir envío de cookies y credenciales
  })
);

// Middleware para analizar JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Rutas protegidas por el middleware de autenticación
app.use("/api/users", validateAuthToken(["Admin"]), userRoutes);
app.use("/api/employees",validateAuthToken(["Employee", "Admin"]),employeesRoutes);
app.use("/api/categories", validateAuthToken(["Admin"]), categoriesRoutes);
app.use("/api/products", validateAuthToken(["Admin"]), productsRoutes);
app.use("/api/discounts", validateAuthToken(["Admin"]), discountsRoutes);
app.use("/api/carts", validateAuthToken(["Employee", "Admin"]), cartsRoutes);
app.use("/api/sales", validateAuthToken(["Employee", "Admin"]), salesRoutes);
app.use("/api/suppliers", validateAuthToken(["Admin"]), suppliersRoutes);
app.use("/api/orders", validateAuthToken(["Employee", "Admin"]), orderRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);

// Exportar la instancia de la aplicación para poder usar Express en otros archivos
export default app;
