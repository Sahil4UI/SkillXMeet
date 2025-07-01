import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <Link href="/" className="flex items-center gap-2">
        <Video className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary font-headline">TrainerMeet</h1>
      </Link>
      <Avatar>
        <AvatarImage src="https://placehold.co/40x40" alt="Trainer" data-ai-hint="person avatar" />
        <AvatarFallback>T</AvatarFallback>
      </Avatar>
    </header>
  );
}
