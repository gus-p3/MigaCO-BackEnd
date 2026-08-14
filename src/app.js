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

// 1. Middleware CORS directo en encabezados (Cubre Preflight OPTIONS antes de cualquier otra cosa)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// 2. Middleware CORS standard
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// Rutas principales de la API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/resenas", resenasRoutes);
app.use("/api/personalizaciones", personalizacionesRoutes);
app.use("/api/carrito", carritoRoutes);

// Rutas de verificación y estado
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API de Miga-Co activa" });
});

app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "API de Miga-Co activa (/api)" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error en backend:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Error interno del servidor" 
  });
});

module.exports = app;