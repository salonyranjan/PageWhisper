import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MAX_FILE_SIZE } from '@/lib/constants';

/**
 * Vercel Blob Client-Side Upload API Route
 * This handles the multi-step handshake:
 * 1. Generate client token (permission)
 * 2. Handle upload completion
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      // The token is pulled automatically from process.env.BLOB_READ_WRITE_TOKEN
      onBeforeGenerateToken: async (pathname) => {
        // Next.js 15/16: Dynamic APIs like auth() MUST be awaited
        const { userId } = await auth();

        if (!userId) {
          throw new Error('Unauthorized: User must be logged in to upload.');
        }

        return {
          allowedContentTypes: [
            'application/pdf', 
            'image/png', 
            'image/jpeg', 
            'image/webp'
          ],
          // Ensure MAX_FILE_SIZE is a number in your constants file
          maximumSizeInBytes: MAX_FILE_SIZE || 52428800, // Default 50MB
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This code runs on the server after the upload is successful
        try {
          const { userId } = JSON.parse(tokenPayload || '{}');
          console.log(`✅ Upload success: ${blob.url} (User: ${userId})`);
          
          // You can perform database updates here if needed
        } catch (error) {
          console.error('Post-upload processing failed:', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('💥 Vercel Blob API Error:', error);
    
    // Return a 400 status so the client-side 'upload' function 
    // can catch and display the specific error message.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 400 }
    );
  }
}