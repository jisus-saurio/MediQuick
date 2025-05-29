import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

//imports necesarios para la base de datos y la configuracion del servidor
async function main() {
  app.listen(config.server.PORT);
  console.log("El servidor esta activo"); //no habia visto esta pagina una disculpa no vi quien me cambio esto:c
}

main();
