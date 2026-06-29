const mongoose = require('mongoose');
const Producto = require('./src/models/Producto');
require('dotenv').config();

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB:', uri);

    const productos = await Producto.find({}).limit(10).lean();
    console.log(`Encontrados ${productos.length} productos. Mostrando fichas sensoriales:`);
    productos.forEach((p, i) => {
      console.log(`--- Producto ${i+1}: ${p.nombre} (id: ${p._id})`);
      console.log('ficha_sensorial:', p.ficha_sensorial);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error al consultar MongoDB:', err);
    process.exit(1);
  }
})();
