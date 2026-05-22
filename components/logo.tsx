import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-sidebar-foreground hover:opacity-80 transition-opacity">
      <Image
        src="/logo.png"
        alt="Novelosity"
        width={36}
        height={36}
        className="flex-shrink-0 object-contain"
        priority
      />
      <span className="font-headline text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
        Novelosity
      </span>
    </Link>
  );
}
