import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Server-side cover image upload.
 * Accepts multipart/form-data with a "file" field.
 * Returns { url: string }
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const blob = await put(
    `covers/${userId}/${Date.now()}_${file.name}`,
    file,
    { access: 'public' },
  );

  return NextResponse.json({ url: blob.url });
}
