import { v2 as cloudinary } from 'cloudinary';
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

    if (!file || !file.name || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: '📂 Archivo inválido o no recibido' }, { status: 400 });
    }

    const mimeType = file.type || '';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: '❌ Solo se permiten archivos de imagen' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'estadoMaquinas',
          public_id: file.name ? file.name.split('.')[0] : `img_${Date.now()}`,
          resource_type: 'image',
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

      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    return NextResponse.json({ error: 'Fallo inesperado al subir imagen' }, { status: 500 });
  }
}
