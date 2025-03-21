// importar todo lo de la libreria "express"
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import employeesRoutes from "./routes/employeesRoutes.js";

// Creo una constante que es igual a la libreria que
// acabo de importar y lo ejecuto
const app = express();

// middleware para aceptar datos desde postman
app.use(express.json());





// Exporto la constante para poder usar express en otros
// archivos
export default app;
