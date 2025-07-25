import mongoose from 'mongoose';

const CategoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.models.Categoria || mongoose.model('Categoria', CategoriaSchema);
