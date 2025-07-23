import { connectDB } from '@/lib/mongo';
import Maquina from '@/models/Maquina';

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    await Maquina.findByIdAndDelete(params.id);
    return Response.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    return Response.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const data = await req.json();

  try {
    const actualizada = await Maquina.findByIdAndUpdate(params.id, data, { new: true });
    return Response.json(actualizada);
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
    return Response.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}
