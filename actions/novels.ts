'use server';

import { db } from '@/lib/db';
import { novels, chapters, users } from '@/lib/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export interface Novel {
  id: number;
  title: string;
  authorId: string;
  authorName: string;
  synopsis: string;
  genre: string;
  tags: string;
  coverImageUrl: string;
  status: string;
  contentRating: string;
  views: number;
  subscribers: number;
  chapterCount: number;
  wordCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Chapter {
  id: number;
  novelId: number;
  title: string;
  content: string;
  chapterNumber: number;
  isPaid: boolean;
  coinCost: number;
  wordCount: number;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// ── Novels ─────────────────────────────────────────────────────────────

export async function createNovel(data: {
  title: string;
  synopsis: string;
  genre: string;
  tags: string;
  coverImageUrl: string;
  contentRating: string;
}): Promise<Novel> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const [user] = await db.select({ displayName: users.displayName }).from(users).where(eq(users.id, userId));

  const [novel] = await db
    .insert(novels)
    .values({ ...data, authorId: userId, authorName: user?.displayName ?? 'Author' })
    .returning();

  return novel as Novel;
}

export async function updateNovel(novelId: number, data: Partial<Novel>): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  await db
    .update(novels)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(novels.id, novelId), eq(novels.authorId, userId)));
}

export async function deleteNovel(novelId: number): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  await db.delete(novels).where(and(eq(novels.id, novelId), eq(novels.authorId, userId)));
}

export async function getNovel(novelId: number): Promise<Novel | null> {
  const rows = await db.select().from(novels).where(eq(novels.id, novelId)).limit(1);
  return rows.length > 0 ? (rows[0] as Novel) : null;
}

export async function getPublishedNovels(limit = 20): Promise<Novel[]> {
  const rows = await db
    .select()
    .from(novels)
    .where(eq(novels.status, 'published'))
    .orderBy(desc(novels.updatedAt))
    .limit(limit);
  return rows as Novel[];
}

export async function getTrendingNovels(limit = 6): Promise<Novel[]> {
  const rows = await db
    .select()
    .from(novels)
    .where(eq(novels.status, 'published'))
    .orderBy(desc(novels.views))
    .limit(limit);
  return rows as Novel[];
}

export async function getNewReleases(limit = 6): Promise<Novel[]> {
  const rows = await db
    .select()
    .from(novels)
    .where(eq(novels.status, 'published'))
    .orderBy(desc(novels.createdAt))
    .limit(limit);
  return rows as Novel[];
}

export async function getNovelsByAuthor(authorId: string): Promise<Novel[]> {
  const rows = await db
    .select()
    .from(novels)
    .where(eq(novels.authorId, authorId))
    .orderBy(desc(novels.updatedAt));
  return rows as Novel[];
}

export async function getAllNovelsAdmin(): Promise<Novel[]> {
  return db.select().from(novels).orderBy(desc(novels.createdAt)) as Promise<Novel[]>;
}

export async function publishNovel(novelId: number): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  await db
    .update(novels)
    .set({ status: 'published', updatedAt: new Date() })
    .where(and(eq(novels.id, novelId), eq(novels.authorId, userId)));
}

// ── Chapters ───────────────────────────────────────────────────────────

export async function createChapter(data: {
  novelId: number;
  title: string;
  content: string;
  chapterNumber: number;
  isPaid: boolean;
  coinCost: number;
  wordCount: number;
}): Promise<Chapter> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const [chapter] = await db.insert(chapters).values({ ...data, status: 'draft' }).returning();

  // Update novel's chapter count and word count
  await db
    .update(novels)
    .set({
      chapterCount: sql`${novels.chapterCount} + 1`,
      wordCount: sql`${novels.wordCount} + ${data.wordCount}`,
      updatedAt: new Date(),
    })
    .where(eq(novels.id, data.novelId));

  return chapter as Chapter;
}

export async function updateChapter(
  chapterId: number,
  data: Partial<Pick<Chapter, 'title' | 'content' | 'isPaid' | 'coinCost' | 'wordCount' | 'status'>>
): Promise<void> {
  await db
    .update(chapters)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(chapters.id, chapterId));
}

export async function deleteChapter(chapterId: number): Promise<void> {
  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId)).limit(1);
  if (!chapter) return;
  await db.delete(chapters).where(eq(chapters.id, chapterId));
  await db
    .update(novels)
    .set({
      chapterCount: sql`GREATEST(${novels.chapterCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(novels.id, chapter.novelId));
}

export async function getChapters(novelId: number): Promise<Chapter[]> {
  return db
    .select()
    .from(chapters)
    .where(eq(chapters.novelId, novelId))
    .orderBy(chapters.chapterNumber) as Promise<Chapter[]>;
}

export async function getPublishedChapters(novelId: number): Promise<Chapter[]> {
  return db
    .select()
    .from(chapters)
    .where(and(eq(chapters.novelId, novelId), eq(chapters.status, 'published')))
    .orderBy(chapters.chapterNumber) as Promise<Chapter[]>;
}

export async function getChapter(chapterId: number): Promise<Chapter | null> {
  const rows = await db.select().from(chapters).where(eq(chapters.id, chapterId)).limit(1);
  return rows.length > 0 ? (rows[0] as Chapter) : null;
}
