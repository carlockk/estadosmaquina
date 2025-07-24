// app/api/upload/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Tipo de contenido no válido' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const publicId = formData.get('public_id'); // viene desde edición si aplica

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Configuración para subida
    const uploadOptions = publicId
      ? {
          public_id: publicId.startsWith('estado_maquinas/')
            ? publicId
            : `estado_maquinas/${publicId}`,
          overwrite: true,
        }
      : {
          folder: 'estado_maquinas',
        };

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataUri, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ ERROR EN /api/upload:', {
      mensaje: error.message,
      nombre: error.name,
      codigo: error.http_code || 500,
    });

    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}
