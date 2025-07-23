// app/api/upload/route.js
import { v2 as cloudinary } from 'cloudinary';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Guardar temporalmente el archivo (necesario para Cloudinary)
    const tempPath = join(process.cwd(), 'temp', file.name);
    await writeFile(tempPath, buffer);

    const result = await cloudinary.uploader.upload(tempPath, {
      folder: 'estadoMaquinas',
      public_id: file.name.split('.')[0],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    return NextResponse.json({ error: 'Fallo al subir imagen' }, { status: 500 });
  }
}
