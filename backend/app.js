// importar todo lo de la libreria "express"
import express from "express";
import userRoutes from "./src/routes/user.js";
import employeesRoutes from "./src/routes/employees.js";
import CategoriesRoutes from "./src/routes/catergories.js";

// Creo una constante que es igual a la libreria que
// acabo de importar y lo ejecuto
const app = express();

// middleware para aceptar datos desde postman
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/categories", CategoriesRoutes);





// Exporto la constante para poder usar express en otros
// archivos
export default app;
