import app from "./app.js";
import "./database.js";
import {config} from "./src/config.js";

async function main() {
  app.listen(config.server.PORT);
  console.log("El servidor esta activo"); //no habia visto esta pagina una disculpa no vi quien me cambio esto:c
}

main();
