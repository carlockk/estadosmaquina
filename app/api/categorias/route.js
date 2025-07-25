import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Categoria from '@/models/Categoria';

export async function GET() {
  try {
    await connectDB();
    const categorias = await Categoria.find().sort({ nombre: 1 });
    return NextResponse.json(categorias.map(cat => cat.nombre));
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { nombre } = await req.json();

    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
    }

    const existe = await Categoria.findOne({ nombre: nombre.trim() });

    if (existe) {
      return NextResponse.json({ mensaje: 'Ya existe la categoría' });
    }

    const nueva = await Categoria.create({ nombre: nombre.trim() });
    return NextResponse.json(nueva, { status: 201 });

  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}
