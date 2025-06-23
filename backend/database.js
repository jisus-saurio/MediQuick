import mongoose from "mongoose";
import { config } from "./src/config.js";

//2- Conecto la base de datos
mongoose.connect(config.DB.URI);

// -------- Comprobar que todo funciona ----------

const connection = mongoose.connection;

//veo si funciona
connection.once("open", () => {
  console.log("La base de Miami me lo confirmó");
});

//veo si se desconectó
connection.on("disconnected", () => {
  console.log("DB is disconnected");
});

//veo si hay un error
connection.on("error", () => {
  console.log("Error en la conexión");
});
