import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary environment variables are not set');
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;
    
    // Upload to Cloudinary with optimization
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'amotify/receipts',
      resource_type: 'auto',
      transformation: [
        { width: 1200, crop: 'limit' },       // Max width 1200px
        { quality: 'auto:good' },             // Auto quality optimization
        { fetch_format: 'auto' },             // Auto format (WebP for modern browsers)
      ],
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error('Upload error details:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Upload failed';
    
    if (error.http_code === 401) {
      errorMessage = 'Invalid Cloudinary credentials. Please check your API key and secret.';
    } else if (error.http_code === 400) {
      errorMessage = error.message || 'Invalid upload request';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: error.http_code || 500 }
    );
  }
}
