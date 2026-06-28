const mongoose = require('mongoose');
const Producto = require('./src/models/Producto');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB:', process.env.MONGODB_URI);

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
