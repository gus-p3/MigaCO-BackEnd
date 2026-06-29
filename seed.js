const mongoose = require("mongoose");
const Producto = require("./src/models/Producto");
const Usuario = require("./src/models/Usuario");
const Carrito = require("./src/models/Carrito");
const Pedido = require("./src/models/Pedido");
const Resena = require("./src/models/Resena");
const Personalizacion = require("./src/models/Personalizacion");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const productosIniciales = [
  {
    //---PASTELES
    nombre: "Pastel Gourmet de Chocolate Belga",
    categoria: "Pasteles",
    subcategoria: "Gourmet",
    tipo_producto: "preparado",
    descripcion:
      "Pastel de tres capas con ganache de chocolate 70% cacao. Una delicia para los amantes del chocolate.",
    precio: 450,
    stock: { sucursal_centro: 5, sucursal_norte: 2 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/17/05/5d/17055d7ec547631fe71363d316a9ff42.jpg",
        "https://i.pinimg.com/1200x/41/a1/21/41a121b6ee9b1e85d8fc528e056ac948.jpg",
      ],
    },
    ingredientes: ["Harina", "Huevos", "Azúcar", "Chocolate 70%"],
    porcion: "12 porciones",
    conservacion: "Mantener en refrigeración a 4°C",
    ficha_sensorial: {
      dulzor: 4,
      textura: 4,
      intensidad: 5,
      alergenos: ["Gluten", "Lácteos", "Nueces"],
    },
    personalizable: {
      permite_mensaje: true,
      rellenos_disponibles: ["Fresa", "Cajeta", "Crema de Avellana"],
      coberturas_disponibles: ["Chocolate Negro", "Vainilla"],
    },
    tags: ["chocolate", "cumpleaños", "gourmet"],
  },
  //------------------------------------------
  {
    nombre: "Torta Red Velvet",
    categoria: "Pasteles",
    subcategoria: "Especiales",
    tipo_producto: "preparado",
    descripcion: "Clásica torta red velvet con frosting de queso crema.",
    precio: 450,
    stock: { sucursal_centro: 3, sucursal_norte: 4 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/33/c9/f7/33c9f7ecb35642043318a7c80c58c489.jpg",
        "https://i.pinimg.com/736x/f0/c1/91/f0c1917eefe09ad2f523cc5f370b9deb.jpg",
      ],
    },
    ingredientes: ["Harina", "Cacao", "Colorante rojo", "Queso crema"],
    porcion: "10 porciones",
    conservacion: "Conservar tapado en refrigeración",
    ficha_sensorial: {
      dulzor: 3,
      textura: 2,
      intensidad: 4,
      alergenos: ["Gluten", "Lácteos"],
    },
    personalizable: {
      permite_mensaje: true,
      rellenos_disponibles: ["Cheesecake", "Vainilla"],
      coberturas_disponibles: ["Queso Crema"],
    },
    tags: ["frutal"],
  },
  //------------------------------------------
  {
    nombre: "Cupcakes Vainilla con Frosting",
    categoria: "Pasteles",
    subcategoria: "Especiales",
    tipo_producto: "preparado",
    descripcion:
      "Pack de 6 cupcakes de vainilla con frosting decorado. Personalizables.",
    precio: 150,
    stock: { sucursal_centro: 7, sucursal_norte: 3 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/7c/be/9b/7cbe9b7d0e36182ad495547dd4b43095.jpg",
        "https://i.pinimg.com/1200x/e8/44/9b/e8449bcda1f8fa0e5ca475b7f441b33c.jpg",
      ],
    },
    ingredientes: ["Harina", "Azúcar", "Huevos", "Leche", "Vainilla"],
    porcion: "Pack de 6",
    conservacion: "Refrigerar y consumir en 2 días",
    ficha_sensorial: {
      dulzor: 3,
      textura: 3,
      intensidad: 3,
      alergenos: ["Gluten", "Lácteos"],
    },
    personalizable: {
      permite_mensaje: true,
      rellenos_disponibles: ["Chocolate", "Frutas"],
      coberturas_disponibles: ["Fondant", "Buttercream"],
    },
    tags: [],
  },

  //------------------------------------------
  {
    nombre: "Pastel Tres Leches con Frutas Naturales",
    categoria: "Pasteles",
    subcategoria: "Gourmet",
    tipo_producto: "preparado",
    descripcion:
      "Suave bizcocho bañado en mezcla de tres leches, cubierto con crema ligera y decorado con frutas frescas de temporada.",
    precio: 520,
    stock: { sucursal_centro: 7, sucursal_norte: 4 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/13/e1/29/13e1293cbc7125393e145281f5b2ac6b.jpg",
        "https://i.pinimg.com/1200x/9b/a2/39/9ba2398c8b4536aa20d144a0cf5320ca.jpg",
      ],
    },
    ingredientes: [
      "Harina",
      "Huevos",
      "Azúcar",
      "Leche evaporada",
      "Leche condensada",
      "Crema",
      "Frutas naturales",
    ],
    porcion: "12 porciones",
    conservacion: "Mantener en refrigeración a 4°C y consumir en 2-3 días",
    ficha_sensorial: {
      dulzor: 4,
      textura: 5,
      intensidad: 3,
      alergenos: ["Gluten", "Lácteos", "Huevo"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["cumpleaños"],
  },

  //------ REPOSTERÍA Y GALLETAS
  {
    nombre: "Galletas de Chocolate Chip",
    categoria: "Repostería y Galletas",
    subcategoria: "Galletas",
    tipo_producto: "preparado",
    descripcion:
      "Galletas caseras con chips de chocolate derretido. Pack de 6 unidades.",
    precio: 120,
    stock: { sucursal_centro: 15, sucursal_norte: 10 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/30/71/ce/3071ce189c9fbfae15114674cd854c29.jpg",
        "https://i.pinimg.com/1200x/2c/ca/22/2cca22e34a8503d95dda549b03908a3b.jpg",
      ],
    },
    ingredientes: ["Harina", "Azúcar", "Mantequilla", "Chips de chocolate"],
    porcion: "Pack de 6",
    conservacion: "Mantener en lugar fresco y seco",
    ficha_sensorial: {
      dulzor: 4,
      textura: 4,
      intensidad: 2,
      alergenos: ["Gluten", "Lácteos"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["chocolate", "casero"],
  },
  //------------------------------------------

  {
    nombre: "Galletas Rellenas de Nutella",
    categoria: "Repostería y Galletas",
    subcategoria: "Galletas",
    tipo_producto: "preparado",
    descripcion:
      "Galletas suaves con centro cremoso de Nutella, ligeramente doradas por fuera y con relleno fundente. Pack de 6 unidades.",
    precio: 90,
    stock: { sucursal_centro: 14, sucursal_norte: 9 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/originals/99/28/07/9928070d508613d25b25356c6f35211b.png",
        "https://i.pinimg.com/1200x/15/aa/5e/15aa5e4b56e24806608c560724c25aca.jpg",
      ],
    },
    ingredientes: [
      "Harina",
      "Azúcar",
      "Mantequilla",
      "Huevo",
      "Nutella",
      "Vainilla",
    ],
    porcion: "Pack de 6",
    conservacion: "Mantener en lugar fresco y seco",
    ficha_sensorial: {
      dulzor: 5,
      textura: 4,
      intensidad: 5,
      alergenos: ["Gluten", "Lácteos", "Huevo", "Nueces"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: ["Chocolate", "Cajeta", "Crema de avellana"],
      coberturas_disponibles: ["Azúcar glass", "Chispas de chocolate"],
    },
    tags: ["dulce", "antojable"],
  },
  //----------------------------
  {
    nombre: "Churros Clásicos con Azúcar y Canela",
    categoria: "Repostería y Galletas",
    subcategoria: "Churros",
    tipo_producto: "preparado",
    descripcion:
      "Churros recién hechos, crujientes por fuera y suaves por dentro, espolvoreados con azúcar y canela. Pack de 4 unidades.",
    precio: 110,
    stock: { sucursal_centro: 12, sucursal_norte: 7 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/ad/88/2b/ad882be7227e17f6c38c2eac9ef0066f.jpg",
        "https://i.pinimg.com/736x/5b/4b/97/5b4b971f489bf07c143dec90a7f01a60.jpg",
      ],
    },
    ingredientes: [
      "Harina",
      "Agua",
      "Mantequilla",
      "Azúcar",
      "Canela",
      "Chocolate",
    ],
    porcion: "Pack de 4",
    conservacion: "Consumir el mismo día para mejor textura",
    ficha_sensorial: {
      dulzor: 4,
      textura: 5,
      intensidad: 3,
      alergenos: ["Gluten", "Lácteos"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: ["Chocolate", "Cajeta", "Lechera"],
      coberturas_disponibles: ["Azúcar y canela", "Chocolate", "Caramelo"],
    },
    tags: ["dulce", "tradicional", "antojable"],
  },
  //----------------------------
  {
    nombre: "Pay de Manzana Casero",
    categoria: "Repostería y Galletas",
    subcategoria: "Pays",
    tipo_producto: "preparado",
    descripcion:
      "Delicioso pay de manzana con relleno suave y especiado, cubierto con una costra dorada y crujiente. Ideal para acompañar con helado.",
    precio: 280,
    stock: { sucursal_centro: 6, sucursal_norte: 3 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/e9/81/4d/e9814d585d363eac03859981ce67528a.jpg",
        "https://i.pinimg.com/1200x/32/64/87/3264879f614aea5bcffd88ad9817eca6.jpg",
      ],
    },
    ingredientes: [
      "Harina",
      "Mantequilla",
      "Azúcar",
      "Manzana",
      "Canela",
      "Huevo",
    ],
    porcion: "8 porciones",
    conservacion: "Mantener en refrigeración y hasta 3 días",
    ficha_sensorial: {
      dulzor: 4,
      textura: 4,
      intensidad: 3,
      alergenos: ["Gluten", "Lácteos", "Huevo"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["casero", "tradicional"],
  },
  //------ PANADERIA
  {
    nombre: "Pan de Masa Madre",
    categoria: "Panadería",
    subcategoria: "Pan",
    tipo_producto: "preparado",
    descripcion:
      "Pan artesanal elaborado con masa madre de 48 horas. Corteza crujiente.",
    precio: 95,
    stock: { sucursal_centro: 8, sucursal_norte: 6 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/9b/9c/cd/9b9ccde5e01a9e40ef54d59eb1d15453.jpg",
        "https://i.pinimg.com/736x/0d/dc/de/0ddcde71842a6bd366b505fe11d9f4f3.jpg",
      ],
    },
    ingredientes: ["Harina", "Agua", "Masa madre", "Sal"],
    porcion: "1 pieza de 500g",
    conservacion: "Conservar en bolsa de papel a temperatura ambiente",
    ficha_sensorial: {
      dulzor: 1,
      textura: 4,
      intensidad: 1,
      alergenos: ["Gluten"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["saludable"],
  },
  //-------------------------------------------
  {
    nombre: "Roles de Canela Estilo New York",
    categoria: "Panadería",
    subcategoria: "Roles",
    tipo_producto: "preparado",
    descripcion:
      "Roles de canela extra grandes, suaves y esponjosos, con abundante glaseado y un intenso sabor a canela.",
    precio: 110,
    stock: { sucursal_centro: 9, sucursal_norte: 5 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/64/21/b3/6421b3aa0ee0af3e28ce5deed0986ff2.jpg",
        "https://i.pinimg.com/1200x/83/78/60/837860b7884ae6341203feac146150b5.jpg",
      ],
    },
    ingredientes: [
      "Harina",
      "Azúcar",
      "Mantequilla",
      "Leche",
      "Huevo",
      "Canela",
      "Azúcar mascabado",
      "Glaseado",
    ],
    porcion: "Pack de 4",
    conservacion: "Mantener en lugar fresco y consumir en 2 días",
    ficha_sensorial: {
      dulzor: 5,
      textura: 5,
      intensidad: 4,
      alergenos: ["Gluten", "Lácteos", "Huevo"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["dulce", "antojable"],
  },
  //-------------------------------------------
  {
    nombre: "Focaccia Artesanal con Hierbas 500g",
    categoria: "Panadería",
    subcategoria: "Pan Salado",
    tipo_producto: "preparado",
    descripcion:
      "Pan italiano tipo focaccia, esponjoso por dentro y ligeramente crujiente por fuera, preparado con aceite de oliva y hierbas aromáticas.",
    precio: 180,
    stock: { sucursal_centro: 7, sucursal_norte: 4 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/2f/de/4f/2fde4f42e6ad47fcd5af51658dde1381.jpg",
        "https://i.pinimg.com/1200x/8c/da/72/8cda72e88a7d80bc6832c2d370d70171.jpg",
      ],
    },
    ingredientes: [
      "Harina",
      "Aceite de oliva",
      "Sal",
      "Levadura",
      "Romero",
      "Ajo",
    ],
    porcion: "6 porciones",
    conservacion: "Mantener en lugar fresco y consumir en 2 días",
    ficha_sensorial: {
      dulzor: 1,
      textura: 4,
      intensidad: 3,
      alergenos: ["Gluten"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: [],
  },
  //-------------------------------------------
  {
    nombre: "Panqué de Naranja Casero",
    categoria: "Panadería",
    subcategoria: "Panqués",
    tipo_producto: "preparado",
    descripcion:
      "Panqué esponjoso con un delicado sabor a naranja natural, ligeramente dulce y sin glaseado.",
    precio: 160,
    stock: { sucursal_centro: 8, sucursal_norte: 5 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/7e/44/87/7e448725ae70a80160787c0258fbce46.jpg",
        "https://i.pinimg.com/1200x/a1/89/5a/a1895afe6dcc30c0db359232bfc9fce1.jpg",
      ],
    },
    ingredientes: [
      "Harina",
      "Azúcar",
      "Huevo",
      "Mantequilla",
      "Jugo de naranja",
      "Ralladura de naranja",
      "Polvo para hornear",
    ],
    porcion: "8 porciones",
    conservacion: "Mantener en lugar fresco y seco, consumir en 3 días",
    ficha_sensorial: {
      dulzor: 3,
      textura: 4,
      intensidad: 3,
      alergenos: ["Gluten", "Huevo", "Lácteos"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["casero"],
  },

  //------ GELATINAS
  {
    nombre: "Gelatina de Fresa 500g",
    categoria: "Gelatinas",
    subcategoria: "Gelatinas",
    tipo_producto: "preparado",
    descripcion:
      "Gelatina casera de fresa pura con frutas. Perfecta para eventos.",
    precio: 60,
    stock: { sucursal_centro: 12, sucursal_norte: 8 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/a5/5d/1c/a55d1c901330874afcc6445d8eb5c905.jpg",
        "https://i.pinimg.com/736x/74/67/f9/7467f9ac1622a8fe2b2b09927dcaf793.jpg",
      ],
    },
    ingredientes: ["Agua", "Gelatina", "Azúcar", "Fresa", "Nata"],
    porcion: "500g",
    conservacion: "Refrigerar y consumir en 3 días",
    ficha_sensorial: { dulzor: 2, textura: 4, intensidad: 2, alergenos: [] },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["frutal", "refrescante"],
  },
  //------------------------------------------
  {
    nombre: "Gelatina de Galleta tipo Oreo 500g",
    categoria: "Gelatinas",
    subcategoria: "Gelatinas",
    tipo_producto: "preparado",
    descripcion:
      "Gelatina cremosa sabor galleta tipo Oreo con trozos de galleta. Dulce, suave y perfecta para los amantes del chocolate.",
    precio: 90,
    stock: { sucursal_centro: 10, sucursal_norte: 6 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/8a/15/ae/8a15ae0be631136c0d8150fb8a53bb72.jpg",
        "https://i.pinimg.com/736x/11/62/c1/1162c1e3eefc5019dc9264ffe6bf7822.jpg",
      ],
    },
    ingredientes: [
      "Leche",
      "Gelatina",
      "Azúcar",
      "Galletas tipo Oreo",
      "Crema",
    ],
    porcion: "500g",
    conservacion: "Refrigerar y consumir en 3 días",
    ficha_sensorial: {
      dulzor: 4,
      textura: 4,
      intensidad: 4,
      alergenos: ["Lácteos", "Gluten"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["cremoso", "dulce", "antojable"],
  },

  //------------------------------------------
  {
    nombre: "Gelatina de Cajeta 500g",
    categoria: "Gelatinas",
    subcategoria: "Gelatinas",
    tipo_producto: "preparado",
    descripcion: "Gelatina cremosa sabor cajeta con un toque suave y dulce.",
    precio: 75,
    stock: { sucursal_centro: 11, sucursal_norte: 7 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/6d/a6/97/6da6973a346e339af00f0eb67d4569b1.jpg",
        "https://i.pinimg.com/1200x/df/23/4a/df234a105e1b1a9d1a04f41ccc936d7c.jpg",
      ],
    },
    ingredientes: ["Leche", "Gelatina", "Cajeta", "Azúcar", "Crema"],
    porcion: "500g",
    conservacion: "Refrigerar y consumir en 3 días",
    ficha_sensorial: {
      dulzor: 4,
      textura: 4,
      intensidad: 3,
      alergenos: ["Lácteos"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["tradicional", "cremoso", "dulce"],
  },

  //------------------------------------------
  {
    nombre: "Gelatina de Guayaba 500g",
    categoria: "Gelatinas",
    subcategoria: "Gelatinas",
    tipo_producto: "preparado",
    descripcion:
      "Gelatina refrescante sabor guayaba con un toque frutal natural. Ligera, aromática y perfecta para cualquier ocasión.",
    precio: 60,
    stock: { sucursal_centro: 13, sucursal_norte: 9 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/93/f0/87/93f0875710dbcb01a2ad2a7eb4d77a42.jpg",
        "https://i.pinimg.com/1200x/2b/de/94/2bde94b584aab8b35aa607ac2b4d7807.jpg",
      ],
    },
    ingredientes: ["Agua", "Gelatina", "Azúcar", "Pulpa de guayaba"],
    porcion: "500g",
    conservacion: "Refrigerar y consumir en 3 días",
    ficha_sensorial: {
      dulzor: 2,
      textura: 4,
      intensidad: 3,
      alergenos: [],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["frutal", "refrescante"],
  },

  //------ MATERIAS PRIMAS
  {
    nombre: "Chocolate Premium 70% Cacao",
    categoria: "Materias Primas",
    subcategoria: "Ingredientes",
    tipo_producto: "materia_prima",
    descripcion: "Chocolate premium importado de Suiza, 300g.",
    precio: 150,
    stock: { sucursal_centro: 20, sucursal_norte: 15 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/69/9d/55/699d55ad2c2850f084b4d67c97f2c659.jpg",
        "https://i.pinimg.com/736x/d2/72/14/d27214385460ceb6c2698623f2bae05c.jpg",
      ],
    },
    ingredientes: ["Cacao 70%", "Azúcar", "Manteca de cacao"],
    porcion: "250g",
    conservacion: "Mantener en lugar fresco y seco",
    ficha_sensorial: {
      dulzor: 2,
      textura: 1,
      intensidad: 5,
      alergenos: ["Lácteos"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["chocolate", "premium"],
  },
  //------------------------------------------
  {
    nombre: "Harina de Trigo Integral",
    categoria: "Materias Primas",
    subcategoria: "Ingredientes",
    tipo_producto: "materia_prima",
    descripcion:
      "Harina de trigo integral molida finamente. 1kg. Excelente para pan integral.",
    precio: 45,
    stock: { sucursal_centro: 30, sucursal_norte: 25 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/b3/1c/bf/b31cbf5a99db8ae864c121a27173adf2.jpg",
        "https://i.pinimg.com/736x/1c/65/66/1c6566c6edb4badca2de133fd5f008dc.jpg",
      ],
    },
    ingredientes: ["Trigo integral"],
    porcion: "1kg",
    conservacion: "Almacenar en lugar seco",
    ficha_sensorial: {
      dulzor: 0,
      textura: 1,
      intensidad: 0,
      alergenos: ["Gluten"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["saludable", "integral"],
  },
  //------------------------------------------
  {
    nombre: "Azúcar Mascabado Natural",
    categoria: "Materias Primas",
    subcategoria: "Ingredientes",
    tipo_producto: "materia_prima",
    descripcion:
      "Azúcar mascabado sin refinar, con notas de melaza y textura húmeda.",
    precio: 30,
    stock: { sucursal_centro: 18, sucursal_norte: 12 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/0e/5f/bd/0e5fbd78e665d19ab1c275246723dd20.jpg",
        "https://i.pinimg.com/736x/23/84/a1/2384a1fa28271bcc2c3b1085f1fc856c.jpg",
      ],
    },
    ingredientes: ["Azúcar de caña sin refinar"],
    porcion: "500g",
    conservacion: "Mantener en lugar fresco y seco",
    ficha_sensorial: {
      dulzor: 4,
      textura: 2,
      intensidad: 3,
      alergenos: [],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["natural"],
  },

  //------------------------------------------
  {
    nombre: "Stevia Natural en Polvo",
    categoria: "Materias Primas",
    subcategoria: "Ingredientes",
    tipo_producto: "materia_prima",
    descripcion: "Endulzante natural sin calorías a base de stevia.",
    precio: 105,
    stock: { sucursal_centro: 14, sucursal_norte: 9 },
    multimedia: {
      fotos_exterior: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSirYHgFY_q5WP_s2Fk4DbERyolgOrQbaki6g&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCairlDq_ExpzQPdCv37SNOgoRRcvPbzfqFg&s",
      ],
    },
    ingredientes: ["Extracto de stevia"],
    porcion: "125g",
    conservacion: "Mantener en lugar fresco y seco",
    ficha_sensorial: {
      dulzor: 5,
      textura: 1,
      intensidad: 4,
      alergenos: [],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["natural"],
  },

  //------ REPOSTERÍA SALUDABLE
  {
    nombre: "Muffins Integrales de Avena y Plátano",
    categoria: "Reposteria Saludable",
    subcategoria: "Muffins",
    tipo_producto: "preparado",
    descripcion:
      "Pack de 4 muffins integrales elaborados con avena y plátano natural, sin azúcares refinados.",
    precio: 130,
    stock: { sucursal_centro: 10, sucursal_norte: 6 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/8a/41/34/8a4134346e88963d749550e392fcfbf0.jpg",
        "https://i.pinimg.com/736x/35/4b/86/354b8637c65e49aa4870ec7eb8ec4b9f.jpg",
      ],
    },
    ingredientes: [
      "Harina integral",
      "Avena",
      "Plátano",
      "Huevo",
      "Miel",
      "Leche vegetal",
      "Polvo para hornear",
    ],
    porcion: "Pack de 4",
    conservacion:
      "Mantener en un lugar fresco y consumir en 3 días o refrigerar",
    ficha_sensorial: {
      dulzor: 2,
      textura: 4,
      intensidad: 2,
      alergenos: ["Gluten", "Huevo"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["saludable", "integral", "sin azucar refinada", "fitness"],
  },
  //------------------------------------------
  {
    nombre: "Brownies Fit de Chocolate y Proteína",
    categoria: "Reposteria Saludable",
    subcategoria: "Brownies",
    tipo_producto: "preparado",
    descripcion:
      "Pack de 4 brownies saludables elaborados con cacao natural y proteína, sin azúcares refinados.",
    precio: 130,
    stock: { sucursal_centro: 8, sucursal_norte: 5 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/736x/b7/cc/63/b7cc637f16e61cf595930866f1b2f63f.jpg",
        "https://i.pinimg.com/736x/e9/53/74/e95374a3059f6b39e6df6ababfc036d9.jpg",
      ],
    },
    ingredientes: [
      "Harina de avena",
      "Cacao en polvo",
      "Huevo",
      "Proteína en polvo",
      "Miel",
      "Leche vegetal",
      "Polvo para hornear",
    ],
    porcion: "Pack de 4",
    conservacion:
      "Mantener en un lugar fresco y consumir en 3 días o refrigerar",
    ficha_sensorial: {
      dulzor: 1,
      textura: 3,
      intensidad: 4,
      alergenos: ["Gluten", "Huevo", "Lácteos"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["saludable", "sin azucar refinada", "fitness"],
  },

  //----------------------------
  {
    nombre: "Trufas Energéticas de Coco y Cacao 250g",
    categoria: "Reposteria Saludable",
    subcategoria: "Snacks",
    tipo_producto: "preparado",
    descripcion:
      "Bocaditos energéticos sin hornear elaborados con coco, cacao y dátiles. Sin azúcar refinada.",
    precio: 110,
    stock: { sucursal_centro: 15, sucursal_norte: 10 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/0f/f5/14/0ff514cc5d05dd25218a908f07af3641.jpg",
        "https://i.pinimg.com/1200x/b8/b9/80/b8b9802313afb05855fbdc1c3964e5cf.jpg",
      ],
    },
    ingredientes: [
      "Coco rallado",
      "Cacao en polvo",
      "Dátiles",
      "Aceite de coco",
      "Avena",
    ],
    porcion: "Pack de 250g",
    conservacion: "Refrigerar y consumir en 5 días",
    ficha_sensorial: {
      dulzor: 3,
      textura: 4,
      intensidad: 4,
      alergenos: ["Frutos secos"],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },

    tags: ["saludable", "sin azucar refinada"],
  },

  //----------------------------
  {
    nombre: "Panna Cotta Fit de Matcha y Coco",
    categoria: "Reposteria Saludable",
    subcategoria: "Postres Fríos",
    tipo_producto: "preparado",
    descripcion:
      "Delicada panna cotta elaborada con leche de coco y matcha, de textura suave y cremosa. Endulzada naturalmente.",
    precio: 45,
    stock: { sucursal_centro: 9, sucursal_norte: 6 },
    multimedia: {
      fotos_exterior: [
        "https://i.pinimg.com/1200x/ab/3a/60/ab3a600ca539f8c0f09c5baced4d522f.jpg",
        "https://i.pinimg.com/1200x/ea/d1/3e/ead13e4eb3fcd586de3452eae43b0f33.jpg",
      ],
    },
    ingredientes: [
      "Leche de coco",
      "Matcha",
      "Gelatina natural",
      "Miel",
      "Vainilla",
    ],
    porcion: "Individual (150g)",
    conservacion: "Refrigerar y consumir en 3 días",
    ficha_sensorial: {
      dulzor: 2,
      textura: 5,
      intensidad: 3,
      alergenos: [],
    },
    personalizable: {
      permite_mensaje: false,
      rellenos_disponibles: [],
      coberturas_disponibles: [],
    },
    tags: ["gourmet", "saludable", "premium"],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar colecciones
    await Producto.deleteMany({});
    console.log("🗑️  Productos anteriores eliminados");

    await Usuario.deleteMany({});
    console.log("🗑️  Usuarios anteriores eliminados");

    await Carrito.deleteMany({});
    console.log("🗑️  Carritos anteriores eliminados");

    await Pedido.deleteMany({});
    console.log("🗑️  Pedidos anteriores eliminados");

    await Resena.deleteMany({});
    console.log("🗑️  Reseñas anteriores eliminadas");

    await Personalizacion.deleteMany({});
    console.log("🗑️  Personalizaciones anteriores eliminadas");

    // Insertar nuevos productos
    const resultado = await Producto.insertMany(productosIniciales);
    console.log(`✅ ${resultado.length} productos insertados correctamente`);

    // Crear usuarios de prueba con contraseñas encriptadas
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("adminpassword123", salt);
    const userPasswordHash = await bcrypt.hash("userpassword123", salt);

    const usuariosIniciales = [
      {
        nombre: "Admin Miga-Co",
        email: "admin@migaco.com",
        password_hash: adminPasswordHash,
        role: "admin",
        dos_factor: {
          activo: false,
          codigo_temp: null,
          codigo_expira: null
        }
      },
      {
        nombre: "Usuario Demo",
        email: "user@migaco.com",
        password_hash: userPasswordHash,
        role: "user",
        dos_factor: {
          activo: false,
          codigo_temp: null,
          codigo_expira: null
        }
      }
    ];

    const usuariosInsertados = await Usuario.insertMany(usuariosIniciales);
    console.log(`✅ ${usuariosInsertados.length} usuarios de prueba creados (admin@migaco.com y user@migaco.com)`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error);
    process.exit(1);
  }
};

seedDB();
