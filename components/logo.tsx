import Link from 'next/link';
import { BookOpenText } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-sidebar-foreground hover:opacity-80 transition-opacity">
      <BookOpenText className="h-7 w-7 flex-shrink-0" />
      <span className="font-headline text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
        Novelosity
      </span>
    </Link>
  );
}
