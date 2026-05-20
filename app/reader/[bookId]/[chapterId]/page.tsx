import { notFound } from "next/navigation";
import { getNovel, getPublishedChapters } from "@/actions/novels";
import { ReaderClient } from "./reader-client";

interface Props {
  params: Promise<{ bookId: string; chapterId: string }>;
}

export default async function ReaderPage({ params }: Props) {
  const { bookId, chapterId } = await params;

  const novelId = parseInt(bookId, 10);
  if (isNaN(novelId)) notFound();

  const [novel, chapters] = await Promise.all([
    getNovel(novelId),
    getPublishedChapters(novelId),
  ]);

  if (!novel || chapters.length === 0) notFound();

  // Resolve chapter: supports "chapter-3" (by number) or a bare numeric id
  let chapter = null;
  const byNumber = chapterId.match(/^chapter-(\d+)$/);
  if (byNumber) {
    const num = parseInt(byNumber[1], 10);
    chapter = chapters.find((c) => c.chapterNumber === num) ?? null;
  } else {
    const id = parseInt(chapterId, 10);
    chapter = chapters.find((c) => c.id === id) ?? null;
  }

  if (!chapter) notFound();

  return <ReaderClient novel={novel} chapter={chapter} allChapters={chapters} />;
}
