// importar todo lo de la libreria "express"
import express from "express";
import userRoutes from "./src/routes/user.js";
import employeesRoutes from "./src/routes/employees.js";
import CategoriesRoutes from "./src/routes/catergories.js";
import productsRoutes from "./src/routes/products.js";
import discountsRoutes from "./src/routes/discounts.js";
import cartsRoutes from "./src/routes/carts.js";
import salesRoutes from "./src/routes/Sales.js";
import suppliersRoutes from "./src/routes/suppliers.js";
import orderRoutes from "./src/routes/orders.js";
import cors from "cors"
import cookieParser from 'cookie-parser';

// Creo una constante que es igual a la libreria que
// acabo de importar y lo ejecuto
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    // Permitir envío de cookies y credenciales
    credentials: true
  })
);

// middleware para aceptar datos desde postman
app.use(express.json());
app.use(cookieParser()); 

app.use("/api/users", userRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/categories", CategoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/discounts", discountsRoutes);
app.use("/api/carts", cartsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/order", orderRoutes);





// Exporto la constante para poder usar express en otros
// archivos
export default app;
