// app/api/upload/route.js

import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

export const runtime = 'nodejs';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Loguear después de configurar
console.log('🔍 Entorno Cloudinary:', {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: !!process.env.CLOUDINARY_API_SECRET, // Solo muestra true/false
});


export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Tipo de contenido no válido' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const subirACloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'estado_maquinas', resource_type: 'image' },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        Readable.from(buffer).pipe(stream);
      });

    const resultado = await subirACloudinary();

    return NextResponse.json({ url: resultado.secure_url });
  } catch (error) {
    console.error('❌ ERROR EN /api/upload:', {
      mensaje: error.message,
      nombre: error.name,
      codigo: error.http_code || 500,
    });

    return NextResponse.json(
      { error: 'Error inesperado', detalles: error.message },
      { status: 500 }
    );
  }
}
