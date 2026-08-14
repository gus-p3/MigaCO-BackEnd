const Usuario = require('../models/Usuario');

class UsuarioService {
  async obtenerPerfil(usuarioId) {
    const usuario = await Usuario.findById(usuarioId).select('-password');
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  async actualizarPerfil(usuarioId, datos) {
    const { nombre, email } = datos;
    
    // Verificar si el email ya está en uso por otro usuario
    if (email) {
      const emailExistente = await Usuario.findOne({ 
        email, 
        _id: { $ne: usuarioId } 
      });
      if (emailExistente) {
        throw new Error('El email ya está en uso');
      }
    }
    
    // ✅ Usar returnDocument: 'after' en lugar de new: true
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { 
        $set: { 
          ...(nombre && { nombre }),
          ...(email && { email })
        } 
      },
      { 
        returnDocument: 'after',
        runValidators: true
      }
    ).select('-password');
    
    if (!usuarioActualizado) {
      throw new Error('Usuario no encontrado');
    }
    
    return usuarioActualizado;
  }

  async agregarDireccion(usuarioId, direccionData) {
    const { etiqueta, calle, ciudad, codigo_postal, referencias, es_principal } = direccionData;
    
    // Validar datos requeridos
    if (!calle || !ciudad || !codigo_postal) {
      throw new Error('Calle, ciudad y código postal son requeridos');
    }
    
    // Si la nueva dirección es principal, desmarcar las demás
    if (es_principal) {
      await Usuario.findByIdAndUpdate(
        usuarioId,
        { 'perfil.direcciones.$[].es_principal': false },
        { returnDocument: 'after' }  // ✅ Nueva forma
      );
    }
    
    // Crear nueva dirección
    const nuevaDireccion = {
      etiqueta: etiqueta || 'Hogar',
      calle,
      ciudad,
      codigo_postal,
      referencias: referencias || '',
      es_principal: es_principal || false
    };
    
    // ✅ Usar returnDocument: 'after'
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { $push: { 'perfil.direcciones': nuevaDireccion } },
      { 
        returnDocument: 'after',  // ✅ Nueva forma
        runValidators: true 
      }
    ).select('-password');
    
    if (!usuarioActualizado) {
      throw new Error('Usuario no encontrado');
    }
    
    // Obtener la dirección recién agregada
    const direccionAgregada = usuarioActualizado.perfil.direcciones[usuarioActualizado.perfil.direcciones.length - 1];
    
    return {
      usuario: usuarioActualizado,
      direccion: direccionAgregada
    };
  }

  async eliminarDireccion(usuarioId, direccionId) {
    // ✅ Usar returnDocument: 'after'
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { $pull: { 'perfil.direcciones': { _id: direccionId } } },
      { 
        returnDocument: 'after',  // ✅ Nueva forma
        runValidators: true 
      }
    ).select('-password');
    
    if (!usuarioActualizado) {
      throw new Error('Usuario no encontrado');
    }
    
    return usuarioActualizado;
  }

  async actualizarDireccion(usuarioId, direccionId, direccionData) {
    const { etiqueta, calle, ciudad, codigo_postal, referencias, es_principal } = direccionData;
    
    // Validar que la dirección existe
    const usuario = await Usuario.findById(usuarioId);
    const direccion = usuario?.perfil.direcciones.id(direccionId);
    if (!direccion) {
      throw new Error('Dirección no encontrada');
    }
    
    // Si la dirección actualizada es principal, desmarcar las demás
    if (es_principal) {
      await Usuario.findByIdAndUpdate(
        usuarioId,
        { 'perfil.direcciones.$[].es_principal': false },
        { returnDocument: 'after' }  // ✅ Nueva forma
      );
    }
    
    // ✅ Usar returnDocument: 'after' con arrayFilters
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { 
        $set: { 
          'perfil.direcciones.$[dir].etiqueta': etiqueta,
          'perfil.direcciones.$[dir].calle': calle,
          'perfil.direcciones.$[dir].ciudad': ciudad,
          'perfil.direcciones.$[dir].codigo_postal': codigo_postal,
          'perfil.direcciones.$[dir].referencias': referencias,
          'perfil.direcciones.$[dir].es_principal': es_principal
        }
      },
      { 
        arrayFilters: [{ 'dir._id': direccionId }],
        returnDocument: 'after',  // ✅ Nueva forma
        runValidators: true 
      }
    ).select('-password');
    
    if (!usuarioActualizado) {
      throw new Error('Usuario no encontrado');
    }
    
    // Obtener la dirección actualizada
    const direccionActualizada = usuarioActualizado.perfil.direcciones.id(direccionId);
    
    return {
      usuario: usuarioActualizado,
      direccion: direccionActualizada
    };
  }
}

module.exports = new UsuarioService();