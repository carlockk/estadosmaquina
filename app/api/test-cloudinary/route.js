import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

    const result = await cloudinary.uploader.upload(url, {
      folder: 'estadoMaquinas/test',
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('❌ Error en test Cloudinary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
