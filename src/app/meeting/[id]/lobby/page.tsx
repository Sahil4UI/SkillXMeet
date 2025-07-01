'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function LobbyPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, params.id]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-5 w-72 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <Skeleton className="w-full aspect-video" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-36" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Ready to Join?</CardTitle>
          <CardDescription>Your camera and microphone will be off when you join.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <Image 
              src="https://placehold.co/600x400" 
              alt="Your video preview"
              fill
              className="object-cover"
              data-ai-hint="person waving"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <p className="text-white text-lg">Camera is off</p>
            </div>
          </div>
          <p className="text-muted-foreground">You are joining meeting <span className="font-bold text-foreground">{params.id}</span></p>
          <Button asChild size="lg">
            <Link href={`/meeting/${params.id}`}>Ask to Join</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
