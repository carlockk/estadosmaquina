import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Categoria from '@/models/Categoria';
import Maquina from '@/models/Maquina'; // 🔁 Importante: usamos esto para validar uso

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const nombre = decodeURIComponent(params.nombre);

    // ✅ Verificamos si está en uso
    const enUso = await Maquina.findOne({ categoria: nombre });
    if (enUso) {
      return NextResponse.json(
        { error: 'No se puede eliminar: categoría en uso por una o más máquinas' },
        { status: 400 }
      );
    }

    const eliminado = await Categoria.deleteOne({ nombre });
    if (eliminado.deletedCount === 0) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ mensaje: 'Eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
