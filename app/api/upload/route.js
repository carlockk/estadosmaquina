import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// ✅ Verificación de variables de entorno
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

console.log("🔍 Verificando ENV:", {
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret_set: !!apiSecret, // ✅ solo indica si existe
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    // ✅ Validar archivo recibido
    if (!file || !file.name || typeof file.arrayBuffer !== 'function') {
      console.error("📂 Archivo inválido:", file);
      return NextResponse.json({ error: '📂 Archivo inválido o no recibido' }, { status: 400 });
    }

    const mimeType = file.type || '';
    if (!mimeType.startsWith('image/')) {
      console.warn("❌ Tipo de archivo no permitido:", mimeType);
      return NextResponse.json({ error: '❌ Solo se permiten archivos de imagen' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Subida a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'estadoMaquinas',
          public_id: file.name ? file.name.split('.')[0] : `img_${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error en subida a Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ Imagen subida correctamente:', result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Error inesperado al subir imagen:', error);
    return NextResponse.json({ error: 'Fallo inesperado al subir imagen' }, { status: 500 });
  }
}
