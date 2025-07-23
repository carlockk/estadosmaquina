import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configura Cloudinary
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

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'estadoMaquinas',
            public_id: file.name.split('.')[0],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await streamUpload();

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    return NextResponse.json({ error: 'Fallo al subir imagen' }, { status: 500 });
  }
}
