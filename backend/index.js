import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

// Función principal para iniciar el servidor
async function main() {
  try {
    
    const port = config.PORT || 4000;
    
    app.listen(port, () => {
      console.log(`🚀 Servidor activo en puerto ${port}`);
      console.log(`🌐 URL: http://localhost:${port}`);
      console.log(`📊 Entorno: ${config.NODE_ENV}`);
      console.log(`🔗 Frontend URL configurado: ${config.FRONTEND_URL}`);
      console.log('===================================');
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

main();