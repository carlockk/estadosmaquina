// app/api/upload/route.js ó route.ts
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔄 Convierte buffer a stream legible
function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Envolver en Promise correctamente
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'estadoMaquinas',
          public_id: file.name.split('.')[0],
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error en Cloudinary:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      bufferToStream(buffer).pipe(stream);
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (err) {
    console.error('❌ Error al subir imagen:', err);
    return NextResponse.json({ error: 'Error inesperado al subir imagen' }, { status: 500 });
  }
}
