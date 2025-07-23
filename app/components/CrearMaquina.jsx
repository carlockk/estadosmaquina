import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'estadoMaquinas',
        public_id: file.name.split('.')[0],
      },
      (error, result) => {
        if (error) {
          console.error('Error en Cloudinary:', error);
          return response.reject(error);
        } else {
          response.resolve(result);
        }
      }
    );

    const response = await new Promise((resolve, reject) => {
      bufferToStream(buffer).pipe(stream);
      response = { resolve, reject };
    });

    return NextResponse.json({ url: response.secure_url });
  } catch (err) {
    console.error('❌ Error al subir imagen:', err);
    return NextResponse.json({ error: 'Error inesperado al subir imagen' }, { status: 500 });
  }
}
