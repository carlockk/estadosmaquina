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
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });
  }

  const tempDir = join(process.cwd(), 'temp');
  const tempPath = join(tempDir, file.name);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!existsSync(tempDir)) {
      await mkdir(tempDir);
    }

    await writeFile(tempPath, buffer);

    const result = await cloudinary.uploader.upload(tempPath, {
      folder: 'estadoMaquinas',
      public_id: file.name.split('.')[0],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    return NextResponse.json({ error: 'Fallo al subir imagen' }, { status: 500 });
  } finally {
    // ✅ Siempre intenta eliminar el archivo temporal
    if (existsSync(tempPath)) {
      try {
        await unlink(tempPath);
      } catch (err) {
        console.warn('⚠️ No se pudo eliminar el archivo temporal:', err.message);
      }
    }
  }
}
