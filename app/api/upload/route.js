import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type');

    // ✅ Modo JSON (desde edición)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUri, publicId } = body;

      if (!dataUri || !publicId) {
        return NextResponse.json(
          { error: 'Faltan parámetros: dataUri o publicId' },
          { status: 400 }
        );
      }

      const result = await cloudinary.uploader.upload(dataUri, {
        public_id: publicId,
        overwrite: true,
        folder: 'estado_maquinas',
      });

      return NextResponse.json({ url: result.secure_url });
    }

    // ✅ Modo FormData (desde creación)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (!file) {
        return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'estado_maquinas',
      });

      return NextResponse.json({ url: result.secure_url });
    }

    return NextResponse.json(
      { error: 'Tipo de contenido no soportado' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ ERROR EN /api/upload:', {
      mensaje: error.message,
      nombre: error.name,
      codigo: error.http_code || 500,
    });

    return NextResponse.json(
      { error: 'Error inesperado al subir la imagen', detalles: error.message },
      { status: 500 }
    );
  }
}
