// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuarios.routes");
const productosRoutes = require("./routes/productos.routes");
const pedidoRoutes = require("./routes/pedidos.routes");
const resenasRoutes = require("./routes/resena.routes");
const personalizacionesRoutes = require("./routes/personalizaciones.routes");
const carritoRoutes = require("./routes/carrito.routes");

const app = express();

// Middlewares globales y CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/resenas", resenasRoutes);
app.use("/api/personalizaciones", personalizacionesRoutes);
app.use("/api/carrito", carritoRoutes);

// Ruta de comprobación
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API de Miga-Co activa" });
});

app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "API de Miga-Co activa (/api)" });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

module.exports = app;