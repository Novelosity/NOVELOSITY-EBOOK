import { notFound } from "next/navigation";
import { getNovel, getPublishedChapters } from "@/actions/novels";
import { getNovelReviews, getNovelAverageRating } from "@/actions/social";
import { NovelDetailClient } from "./novel-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NovelDetailPage({ params }: Props) {
  const { id } = await params;
  const novelId = parseInt(id, 10);
  if (isNaN(novelId)) notFound();

  const [novel, chapters, reviews, ratingData] = await Promise.all([
    getNovel(novelId),
    getPublishedChapters(novelId),
    getNovelReviews(novelId),
    getNovelAverageRating(novelId),
  ]);

  if (!novel) notFound();

  return (
    <NovelDetailClient
      novel={novel}
      chapters={chapters}
      reviews={reviews}
      averageRating={ratingData.average}
      reviewCount={ratingData.count}
    />
  );
}
