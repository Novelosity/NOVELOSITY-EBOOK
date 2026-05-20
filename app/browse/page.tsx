import { getPublishedNovels } from "@/actions/novels";
import { BrowseClient } from "./browse-client";

export const metadata = { title: "Browse" };

export default async function BrowsePage() {
  const novels = await getPublishedNovels(100);

  // Derive genres and tags from real data
  const genres = [...new Set(novels.map((n) => n.genre).filter(Boolean))].sort();
  const tags = [
    ...new Set(
      novels.flatMap((n) =>
        (n.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean)
      )
    ),
  ].sort();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-headline mb-8 text-center">Browse Novels</h1>
      <BrowseClient novels={novels} genres={genres} tags={tags} />
    </div>
  );
}
