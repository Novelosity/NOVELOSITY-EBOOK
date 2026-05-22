import { getTrendingNovels, getNewReleases, getPublishedNovels } from "@/actions/novels";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const [trending, newReleases, allPublished] = await Promise.all([
    getTrendingNovels(6),
    getNewReleases(6),
    getPublishedNovels(60),
  ]);

  return (
    <HomeClient
      trending={trending}
      newReleases={newReleases}
      allPublished={allPublished}
    />
  );
}
