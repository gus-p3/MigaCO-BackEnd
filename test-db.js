// test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa!');
    
    // Probar un modelo simple
    const testSchema = new mongoose.Schema({ nombre: String });
    const Test = mongoose.model('Test', testSchema);
    
    await Test.findOne();
    console.log('✅ Consulta exitosa!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();