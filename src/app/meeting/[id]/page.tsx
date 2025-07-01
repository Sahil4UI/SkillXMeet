'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { MeetingProvider } from '@/context/meeting-context';
import { ControlBar } from '@/components/meeting/control-bar';
import { VideoGrid } from '@/components/meeting/video-grid';
import { Skeleton } from '@/components/ui/skeleton';

function MeetingPageSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-full w-full" />
        <Skeleton className="h-full w-full hidden md:block" />
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

function MeetingPageContent({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMicOn = searchParams.get('mic') !== 'false';
  const initialVideoOn = searchParams.get('video') !== 'false';

  if (loading || !user) {
    // We can show a skeleton here, but AuthProvider will redirect to login if not authenticated.
    // So this is mainly for the initial loading state.
    return <MeetingPageSkeleton />;
  }

  return (
    <MeetingProvider 
      meetingId={params.id} 
      user={user}
      initialMicOn={initialMicOn}
      initialVideoOn={initialVideoOn}
    >
      <div className="h-screen w-screen flex flex-col bg-muted/30">
        <div className="flex-1 relative overflow-hidden">
          <VideoGrid />
          <div className="absolute top-4 left-4 bg-black/50 text-white p-2 px-4 rounded-lg z-10">
              <h1 className="text-lg font-bold font-headline">Advanced React Hooks ({params.id})</h1>
          </div>
        </div>
        <ControlBar />
      </div>
    </MeetingProvider>
  );
}

export default function MeetingPage({ params }: { params: { id:string } }) {
  // Use a Suspense boundary to handle the loading of search parameters
  return (
    <Suspense fallback={<MeetingPageSkeleton />}>
      <MeetingPageContent params={params} />
    </Suspense>
  )
}
