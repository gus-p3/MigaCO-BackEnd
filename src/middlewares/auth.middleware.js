const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const verificarToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  //console.log('🔍 Verificando token...');
  //console.log('Token recibido:', token ? 'Sí' : 'No');
  
  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
    //console.log('✅ Token decodificado:', decoded);
    
    const usuario = await Usuario.findById(decoded.id).select('-password');
    //console.log('👤 Usuario encontrado:', usuario);
    //console.log('📋 Role del usuario:', usuario?.role);
    
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    req.usuario = {
      id: usuario._id,
      email: usuario.email,
      role: usuario.role,
      nombre: usuario.nombre
    };
    
    //console.log('✅ Usuario asignado a req.usuario:', req.usuario);
    
    next();
  } catch (error) {
    //console.error('❌ Error al verificar token:', error);
    res.status(401).json({ message: 'Token no válido' });
  }
};

const verificarAdmin = (req, res, next) => {
  
  
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador',
      tuRole: req.usuario?.role 
    });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin };