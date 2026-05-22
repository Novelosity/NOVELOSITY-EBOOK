import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { chapters } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * Emergency save endpoint — called by sendBeacon on tab close
 * and by keepalive fetch on Next.js soft navigation.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { chapterId, content, wordCount, authorNote } = body as {
      chapterId?: number | string;
      content?: string;
      wordCount?: number;
      authorNote?: string;
    };

    if (!chapterId) {
      return NextResponse.json({ error: 'Missing chapterId' }, { status: 400 });
    }

    await db
      .update(chapters)
      .set({
        content: content ?? '',
        wordCount: typeof wordCount === 'number' ? wordCount : 0,
        authorNote: authorNote ?? '',
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, Number(chapterId)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/chapters/save]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
