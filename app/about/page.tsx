// src/app/about/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookHeart, Users, Lightbulb } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-headline text-primary mb-4">About Novelosity</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover a world of stories, personalize your reading journey, and unleash your inner author with Novelosity.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-headline mb-6">Our Mission</h2>
          <p className="text-lg leading-relaxed mb-4">
            At Novelosity, we believe in the power of stories to transport, inspire, and connect us. Our mission is to create a vibrant community where readers can explore diverse narratives and authors can share their unique voices with the world.
          </p>
          <p className="text-lg leading-relaxed">
            We strive to provide an unparalleled reading experience that is both immersive and customizable, coupled with innovative tools that empower authors to bring their creative visions to life.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-2xl">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Inspiring library or creative workspace"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
            data-ai-hint="library books"
          />
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-headline text-center mb-10">What We Offer</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookHeart className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle className="font-headline text-xl">Customizable Reading</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Tailor your reading environment with adjustable fonts, themes, and layouts. Enjoy your favorite stories, your way.</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle className="font-headline text-xl">Vibrant Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Engage with fellow readers and authors through interactive comments. Share your thoughts and discover new perspectives.</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Lightbulb className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle className="font-headline text-xl">Author Empowerment</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Utilize AI-powered tools like our Chapter Title Generator to enhance your writing process and captivate your audience.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="text-center bg-muted/50 py-12 rounded-lg">
        <h2 className="text-3xl font-headline mb-6">Join the Novelosity Journey</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Whether you're here to lose yourself in a good book or to craft the next bestseller, Novelosity is your platform.
        </p>
        {/* Call to action buttons can be added here if needed */}
      </section>
    </div>
  );
}
