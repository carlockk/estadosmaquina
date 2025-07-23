// app/api/maquinas/route.js
import { connectDB } from '@/lib/mongo';
import Maquina from '@/models/Maquina';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();
  const maquinas = await Maquina.find().sort({ createdAt: -1 });
  return NextResponse.json(maquinas);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  try {
    const nueva = await Maquina.create(data);
    return NextResponse.json(nueva, { status: 201 });
  } catch (error) {
    console.error('❌ Error al guardar máquina:', error);
    return NextResponse.json({ error: 'Error al guardar máquina' }, { status: 500 });
  }
}
