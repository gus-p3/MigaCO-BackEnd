// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI o MONGO_URI no están configuradas en las variables de entorno');
      return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
  }
};

module.exports = connectDB;