import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// ✅ Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    // ✅ Obtener archivo desde FormData
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      console.error('⚠️ Archivo inválido o no recibido:', file);
      return NextResponse.json({ error: '📂 Archivo inválido o no recibido' }, { status: 400 });
    }

    // ✅ Convertir a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Subida a Cloudinary mediante stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'estadoMaquinas',
          public_id: file.name?.split('.')[0] || `img_${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error en subida a Cloudinary:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // ✅ Respuesta exitosa
    return NextResponse.json({ url: result.secure_url });

  } catch (error) {
    console.error('❌ Error inesperado en /api/upload:', error.message, error);
    return NextResponse.json(
      { error: error.message || 'Fallo inesperado al subir imagen' },
      { status: 500 }
    );
  }
}
