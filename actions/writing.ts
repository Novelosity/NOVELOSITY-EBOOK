'use server';

import { db } from '@/lib/db';
import { writingSessions } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export interface WritingSession {
  id: number;
  authorId: string;
  novelId: number;
  novelTitle: string;
  date: string; // YYYY-MM-DD
  wordsWritten: number;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Upsert today's writing session for a novel.
 * wordsDelta must be > 0 — we only count words added, not deleted.
 */
export async function recordWritingSession(
  novelId: number,
  novelTitle: string,
  wordsDelta: number,
): Promise<void> {
  const { userId } = await auth();
  if (!userId || wordsDelta <= 0) return;

  const date = todayStr();

  const [existing] = await db
    .select()
    .from(writingSessions)
    .where(
      and(
        eq(writingSessions.authorId, userId),
        eq(writingSessions.novelId, novelId),
        eq(writingSessions.date, date),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(writingSessions)
      .set({
        wordsWritten: existing.wordsWritten + wordsDelta,
        novelTitle,
        updatedAt: new Date(),
      })
      .where(eq(writingSessions.id, existing.id));
  } else {
    await db.insert(writingSessions).values({
      authorId: userId,
      novelId,
      novelTitle,
      date,
      wordsWritten: wordsDelta,
    });
  }
}

/**
 * Get all writing sessions for the current author.
 * Optionally filter by novelId.
 */
export async function getWritingSessions(novelId?: number): Promise<WritingSession[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const rows = await db
    .select()
    .from(writingSessions)
    .where(
      novelId !== undefined
        ? and(
            eq(writingSessions.authorId, userId),
            eq(writingSessions.novelId, novelId),
          )
        : eq(writingSessions.authorId, userId),
    );

  return rows as WritingSession[];
}
