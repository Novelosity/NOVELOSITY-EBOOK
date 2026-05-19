'use server';

import { db } from '@/lib/db';
import { reports } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function createReport(data: {
  targetType: string;
  targetId: string;
  targetTitle: string;
  reason: string;
}): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  await db.insert(reports).values({ ...data, reporterId: userId });
}

export async function getPendingReports() {
  return db.select().from(reports).where(eq(reports.status, 'pending'));
}

export async function updateReportStatus(reportId: number, status: 'resolved' | 'dismissed'): Promise<void> {
  await db.update(reports).set({ status }).where(eq(reports.id, reportId));
}
