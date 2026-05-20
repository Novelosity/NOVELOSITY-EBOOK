import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Zap, TrendingUp, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTrendingNovels, getNewReleases, type Novel } from "@/actions/novels";

function NovelCard({ novel }: { novel: Novel }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/novel/${novel.id}`} className="block">
        <div className="aspect-[2/3] relative w-full">
          <Image
            src={novel.coverImageUrl || "https://placehold.co/300x450.png"}
            alt={novel.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-headline truncate" title={novel.title}>
            {novel.title}
          </CardTitle>
          <CardDescription className="text-sm">by {novel.authorName}</CardDescription>
          {novel.genre && (
            <span className="mt-2 inline-block text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
              {novel.genre}
            </span>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

function EmptySection() {
  return (
    <div className="col-span-3 py-10 text-center text-muted-foreground">
      No novels yet — be the first to publish one!
    </div>
  );
}

export default async function HomePage() {
  const [trending, newReleases] = await Promise.all([
    getTrendingNovels(6),
    getNewReleases(6),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-headline mb-6">Welcome to Novelosity!</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Dive into your next adventure or craft your own masterpiece. Explore, read, and create with Novelosity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-headline mb-1">Explore Reads</CardTitle>
              <CardDescription>Browse our vast library of novels across all genres.</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/browse">Start Reading</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-headline mb-1">Discover Authors</CardTitle>
              <CardDescription>Find your new favorite authors and follow their work.</CardDescription>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/authors">Meet Authors</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-headline mb-1">Author Tools</CardTitle>
              <CardDescription>Generate captivating chapter titles with our AI tool.</CardDescription>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/tools/chapter-title-generator">Use AI Generator</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-7 w-7 text-primary" />
          <h3 className="text-2xl font-headline">Trending Now</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.length > 0
            ? trending.map((novel) => <NovelCard key={novel.id} novel={novel} />)
            : <EmptySection />}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-7 w-7 text-primary" />
          <h3 className="text-2xl font-headline">New Releases</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newReleases.length > 0
            ? newReleases.map((novel) => <NovelCard key={novel.id} novel={novel} />)
            : <EmptySection />}
        </div>
      </section>
    </div>
  );
}
