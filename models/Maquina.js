import mongoose from 'mongoose';

const MaquinaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ubicacion: { type: String, required: true },
  estado: { type: String, enum: ['Activa', 'En Mantenimiento', 'Fuera de Servicio'], required: true },
  fecha: { type: Date, required: true },
  imagenUrl: { type: String, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Maquina || mongoose.model('Maquina', MaquinaSchema);
