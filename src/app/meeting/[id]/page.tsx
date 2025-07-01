// This is now a Server Component
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MeetingPageClient } from './meeting-page-client';

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

export default function MeetingPage({ 
  params,
  searchParams 
}: { 
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const initialMicOn = searchParams?.mic !== 'false';
  const initialVideoOn = searchParams?.video !== 'false';

  return (
    <Suspense fallback={<MeetingPageSkeleton />}>
      <MeetingPageClient 
        meetingId={params.id}
        initialMicOn={initialMicOn}
        initialVideoOn={initialVideoOn}
      />
    </Suspense>
  );
}
