require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
connectDB().catch(err => {
  console.error("Error al conectar DB:", err);
});

// Iniciar servidor escuchando en todas las interfaces para Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Miga-Co corriendo en puerto ${PORT}`);
});