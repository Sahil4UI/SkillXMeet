'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ControlBar } from '@/components/meeting/control-bar';
import { VideoGrid } from '@/components/meeting/video-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function MeetingPage({ params }: { params: { id:string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, params.id]);

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex flex-col bg-slate-900">
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="bg-card/80 backdrop-blur-sm p-4 flex justify-center items-center gap-2 md:gap-4 border-t">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-24 h-16 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      <div className="flex-1 relative">
        <VideoGrid />
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 px-4 rounded-lg z-10">
            <h1 className="text-lg font-bold font-headline">Advanced React Hooks ({params.id})</h1>
        </div>
      </div>
      <ControlBar />
    </div>
  );
}
