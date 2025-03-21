import app from "./app.js";
import "./database.js";
import {config} from "./src/config.js";

async function main() {
  app.listen(config.server.PORT);
  console.log("El servidor se está corriendo en tí...");
}

main();
