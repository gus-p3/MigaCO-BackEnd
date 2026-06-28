const Producto = require("../models/Producto");

class ProductosController {
  // Listar todos los productos con filtros opcionales
  async listarProductos(req, res) {
    try {
      const {
        categoria,
        tipo_producto,
        tag,
        precio_min,
        precio_max,
        disponible,
      } = req.query;

      // Construir filtro dinámico
      const filtro = {};

      if (categoria) filtro.categoria = categoria;
      if (tipo_producto) filtro.tipo_producto = tipo_producto;
      if (tag) filtro.tags = { $in: [tag] };
      if (disponible === "true") filtro["stock.sucursal_centro"] = { $gt: 0 };

      if (precio_min || precio_max) {
        filtro.precio = {};
        if (precio_min) filtro.precio.$gte = Number(precio_min);
        if (precio_max) filtro.precio.$lte = Number(precio_max);
      }

      const productos = await Producto.find(filtro).sort({ nombre: 1 });
      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener un producto por ID
  async obtenerProducto(req, res) {
    try {
      const { id } = req.params;
      const producto = await Producto.findById(id);

      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.json(producto);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Crear un nuevo producto
  async crearProducto(req, res) {
    try {
      const {
        nombre,
        categoria,
        subcategoria,
        tipo_producto,
        descripcion,
        precio,
        stock,
        fotos_exterior,
        tags,
        ingredientes,
        porcion,
        conservacion,
        ficha_sensorial,
      } = req.body;

      // Validar campos obligatorios
      if (!nombre || !categoria || !precio) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

      const producto = await Producto.create({
        nombre,
        categoria,
        subcategoria,
        tipo_producto,
        descripcion,
        precio,
        stock: stock || { sucursal_centro: 0, sucursal_norte: 0 },
        multimedia: { fotos_exterior: fotos_exterior || [] },
        ingredientes: ingredientes || [],
        porcion,
        conservacion,
        ficha_sensorial: ficha_sensorial || {},
        tags: tags || [],
      });

      res.status(201).json(producto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Actualizar un producto
  async actualizarProducto(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        categoria,
        precio,
        stock,
        tags,
        ingredientes,
        porcion,
        conservacion,
        ficha_sensorial,
      } = req.body;

      const producto = await Producto.findById(id);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      if (nombre) producto.nombre = nombre;
      if (categoria) producto.categoria = categoria;
      if (precio) producto.precio = precio;
      if (stock) producto.stock = { ...producto.stock, ...stock };
      if (tags) producto.tags = tags;
      if (ingredientes) producto.ingredientes = ingredientes;
      if (porcion) producto.porcion = porcion;
      if (conservacion) producto.conservacion = conservacion;
      if (ficha_sensorial) producto.ficha_sensorial = ficha_sensorial;

      await producto.save();
      res.json(producto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Eliminar un producto
  async eliminarProducto(req, res) {
    try {
      const { id } = req.params;
      const producto = await Producto.findByIdAndDelete(id);

      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Obtener categorías únicas
  async obtenerCategorias(req, res) {
    try {
      const categorias = await Producto.distinct("categoria");
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Búsqueda inteligente (por nombre, tags)
  async buscar(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.json([]);
      }

      const productos = await Producto.find({
        $or: [
          { nombre: { $regex: q, $options: "i" } },
          { tags: { $in: [new RegExp(q, "i")] } },
          { categoria: { $regex: q, $options: "i" } },
        ],
      }).limit(10);

      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductosController();
