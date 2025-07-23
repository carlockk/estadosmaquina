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

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'estado_maquinas' },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          throw error;
        }
        return result;
      }
    );

    const readable = Readable.from(buffer);
    readable.pipe(stream);

    // Esperamos a que Cloudinary termine:
    const result = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'estado_maquinas' },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
      Readable.from(buffer).pipe(upload);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ ERROR EN /api/upload:', error);
    return NextResponse.json(
      { error: 'Error inesperado', detalles: error.message },
      { status: 500 }
    );
  }
}
