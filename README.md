# Miga-Co — Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

**API REST para Miga-Co**, una plataforma de pastelería artesanal en línea.  
Gestiona autenticación, catálogo de productos, carrito, pedidos, reseñas y personalizaciones.

</div>

---

## 📋 Tabla de contenidos

- [Descripción del proyecto](#-descripción-del-proyecto)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Sistema de correos](#-sistema-de-correos)
- [Scripts disponibles](#-scripts-disponibles)

---

## 🎂 Descripción del proyecto

**Miga-Co** es una tienda de pastelería artesanal que ofrece pasteles, postres y productos personalizados. Este backend provee la API REST que alimenta el frontend (React + Vite) con todas las funcionalidades necesarias para operar una tienda en línea completa:

- **Autenticación segura** con JWT, doble factor (2FA por correo) y recuperación de contraseña
- **Catálogo de productos** con búsqueda, filtrado y gestión de inventario (solo admin)
- **Carrito de compras** persistente por usuario en base de datos
- **Gestión de pedidos** con estados, control de pago y estadísticas para administradores
- **Reseñas** de productos con calificación por estrellas
- **Personalizaciones** para pedidos de pasteles a medida
- **Correos transaccionales** vía Brevo API con diseño alineado al sistema visual del frontend

---

## 🛠 Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| **Node.js** | 18+ | Runtime principal |
| **Express** | 5.x | Framework HTTP |
| **MongoDB Atlas** | — | Base de datos NoSQL en la nube |
| **Mongoose** | 9.x | ODM para MongoDB |
| **JSON Web Token** | 9.x | Autenticación stateless |
| **bcryptjs** | 3.x | Hash de contraseñas |
| **Brevo API** | v3 | Envío de correos transaccionales |
| **Multer** | 2.x | Subida de imágenes de productos |
| **Axios** | 1.x | Cliente HTTP (integración Brevo) |
| **Nodemon** | 3.x | Auto-reload en desarrollo |

---

## 📁 Estructura del proyecto

```
Miga-Co_BackEnd/
├── src/
│   ├── app.js                    # Configuración central de Express
│   ├── config/
│   │   └── db.js                 # Conexión a MongoDB Atlas
│   ├── controllers/              # Lógica de cada recurso
│   │   ├── auth.controller.js
│   │   ├── carrito.controller.js
│   │   ├── pedidos.controller.js
│   │   ├── personalizaciones.controller.js
│   │   ├── productos.controller.js
│   │   ├── resena.controller.js
│   │   └── usuarios.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js    # Verificación JWT y rol admin
│   ├── models/                   # Esquemas de Mongoose
│   │   ├── Carrito.js
│   │   ├── Pedido.js
│   │   ├── Personalizacion.js
│   │   ├── Producto.js
│   │   ├── Resena.js
│   │   └── Usuario.js
│   ├── routes/                   # Definición de rutas Express
│   │   ├── auth.routes.js
│   │   ├── carrito.routes.js
│   │   ├── pedidos.routes.js
│   │   ├── personalizaciones.routes.js
│   │   ├── productos.routes.js
│   │   ├── resena.routes.js
│   │   └── usuarios.routes.js
│   └── services/
│       ├── auth.service.js       # Lógica de autenticación + templates de email
│       ├── resena.service.js
│       └── usuario.service.js
├── uploads/                      # Imágenes subidas de productos
├── server.js                     # Punto de entrada (arranca Express)
├── seed.js                       # Poblado inicial de la base de datos
├── .env                          # Variables de entorno (no se sube al repo)
├── .gitignore
└── package.json
```

---

## ✅ Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Cuenta en **MongoDB Atlas** con un clúster activo
- Cuenta en **Brevo** (ex-Sendinblue) con una API Key activa para el envío de correos

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd Miga-Co_BackEnd

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus propios valores

# 4. (Opcional) Poblar la base de datos con datos de prueba
npm run seed

# 5. Arrancar en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
PORT=3000

# Base de datos
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<dbname>

# Autenticación
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d

# Brevo — Envío de correos transaccionales
BREVO_API_KEY=tu_api_key_de_brevo
BREVO_SENDER_EMAIL=correo@tudominio.com
BREVO_SENDER_NAME=Miga-Co
```

> ⚠️ **Nunca subas el archivo `.env` al repositorio.** Ya está incluido en `.gitignore`.

---

## 📡 Endpoints de la API

### 🔑 Autenticación — `/api/auth`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/registro` | Público | Registrar nuevo usuario |
| `POST` | `/login` | Público | Iniciar sesión (retorna token o requiere 2FA) |
| `POST` | `/2fa/verificar` | Público | Verificar código de doble factor |
| `PUT` | `/2fa/toggle` | 🔒 Usuario | Activar o desactivar 2FA |
| `POST` | `/recuperar` | Público | Solicitar código de recuperación por correo |
| `POST` | `/recuperar/verificar` | Público | Validar código de recuperación |
| `POST` | `/recuperar/cambiar` | Público | Cambiar contraseña con token de reset |

### 👤 Usuarios — `/api/usuarios`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/perfil` | 🔒 Usuario | Obtener perfil del usuario autenticado |
| `PUT` | `/perfil` | 🔒 Usuario | Actualizar datos del perfil |
| `PUT` | `/password` | 🔒 Usuario | Cambiar contraseña desde el perfil |
| `GET` | `/` | 🔒 Admin | Listar todos los usuarios |

### 🎂 Productos — `/api/productos`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/` | Público | Listar productos con paginación y filtros |
| `GET` | `/buscar` | Público | Búsqueda por texto |
| `GET` | `/categorias` | Público | Obtener categorías disponibles |
| `GET` | `/:id` | Público | Obtener un producto por ID |
| `POST` | `/` | 🔒 Admin | Crear nuevo producto |
| `PUT` | `/:id` | 🔒 Admin | Actualizar producto |
| `DELETE` | `/:id` | 🔒 Admin | Eliminar producto |

### 🛒 Carrito — `/api/carrito`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/` | 🔒 Usuario | Obtener carrito del usuario |
| `GET` | `/validar` | 🔒 Usuario | Validar disponibilidad de items |
| `POST` | `/items` | 🔒 Usuario | Agregar item al carrito |
| `PUT` | `/items/:itemId` | 🔒 Usuario | Actualizar cantidad de un item |
| `DELETE` | `/items/:itemId` | 🔒 Usuario | Eliminar un item del carrito |
| `DELETE` | `/` | 🔒 Usuario | Vaciar carrito completo |

### 📦 Pedidos — `/api/pedidos`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/` | 🔒 Usuario | Crear nuevo pedido |
| `GET` | `/mis-pedidos` | 🔒 Usuario | Historial de pedidos del usuario |
| `GET` | `/:id` | 🔒 Usuario | Detalle de un pedido específico |
| `GET` | `/` | 🔒 Admin | Listar todos los pedidos |
| `PUT` | `/:id/estado` | 🔒 Admin | Actualizar estado del pedido |
| `PUT` | `/:id/pago` | 🔒 Admin | Actualizar estado de pago |
| `GET` | `/estadisticas/resumen` | 🔒 Admin | Resumen y estadísticas de ventas |

### ⭐ Reseñas — `/api/resenas`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/:productoId` | Público | Listar reseñas de un producto |
| `POST` | `/:productoId` | 🔒 Usuario | Publicar reseña |

### 🎨 Personalizaciones — `/api/personalizaciones`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/` | 🔒 Usuario | Crear solicitud de personalización |
| `GET` | `/mis-personalizaciones` | 🔒 Usuario | Ver mis personalizaciones |
| `GET` | `/` | 🔒 Admin | Ver todas las personalizaciones |

---

## 📧 Sistema de correos

Los correos transaccionales se envían mediante la **API de Brevo (v3)** y son disparados en dos situaciones:

| Evento | Asunto | Descripción |
|---|---|---|
| Login con 2FA activo | *Tu código de acceso — Miga-Co* | Código OTP de 6 dígitos, expira en 10 min |
| Recuperación de contraseña | *Recuperar contraseña — Miga-Co* | Código OTP de 6 dígitos, expira en 10 min |

Los templates HTML del correo están diseñados para coincidir con el sistema visual del frontend:
- Paleta de colores morada (`#2D006B`, `#560BAD`, `#7B2CBF`)
- Header con gradiente, logo Miga-Co e ícono contextual
- Compatible con los principales clientes de correo (Gmail, Outlook, Apple Mail)

---

## 📜 Scripts disponibles

```bash
npm start       # Producción: inicia el servidor con node
npm run dev     # Desarrollo: inicia con nodemon (auto-reload)
npm run seed    # Pobla la base de datos con datos de muestra
```

---

<div align="center">
  <sub>© 2025 Miga-Co · Pastelería artesanal · Hecho con ☕ y mucho azúcar</sub>
</div>
