import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempDir = join(process.cwd(), 'temp');
    const tempPath = join(tempDir, `${Date.now()}-${file.name}`);

    if (!existsSync(tempDir)) {
      await mkdir(tempDir);
    }

    await writeFile(tempPath, buffer);

    const result = await cloudinary.uploader.upload(tempPath, {
      folder: 'estadoMaquinas',
      public_id: file.name.split('.')[0],
    });

    await unlink(tempPath);

    if (!result || !result.secure_url) {
      return NextResponse.json({ error: 'No se obtuvo URL de Cloudinary' }, { status: 500 });
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error.message || error);
    return NextResponse.json({
      error: 'Error al subir imagen',
      detalle: error.message || 'Desconocido',
    }, { status: 500 });
  }
}
