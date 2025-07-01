'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { MeetingProvider } from '@/context/meeting-context';
import { ControlBar } from '@/components/meeting/control-bar';
import { VideoGrid } from '@/components/meeting/video-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import type { Meeting } from '@/components/dashboard/upcoming-meetings';

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

export function MeetingPageClient({ 
  meetingId,
  initialMicOn,
  initialVideoOn
}: { 
  meetingId: string;
  initialMicOn: boolean;
  initialVideoOn: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const db = getFirestore();
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    if (!db || meetingId.length <= 7) return; // Don't fetch for instant meetings

    const fetchMeeting = async () => {
      const meetingRef = doc(db, 'meetings', meetingId);
      const meetingSnap = await getDoc(meetingRef);
      if (meetingSnap.exists()) {
        setMeeting(meetingSnap.data() as Meeting);
      } else {
        // Handle meeting not found, maybe redirect or show a message
        console.error("Meeting not found!");
        router.push('/dashboard');
      }
    };
    fetchMeeting();
  }, [db, meetingId, router]);


  if (loading || !user) {
    return <MeetingPageSkeleton />;
  }

  const meetingTitle = meeting?.title || `Instant Meeting (${meetingId})`;

  return (
    <MeetingProvider 
      meetingId={meetingId} 
      user={user}
      initialMicOn={initialMicOn}
      initialVideoOn={initialVideoOn}
    >
      <div className="h-screen w-screen flex flex-col bg-muted/30">
        <div className="flex-1 relative overflow-hidden">
          <VideoGrid />
          <div className="absolute top-4 left-4 bg-black/50 text-white p-2 px-4 rounded-lg z-10">
              <h1 className="text-lg font-bold font-headline">{meetingTitle}</h1>
          </div>
        </div>
        <ControlBar />
      </div>
    </MeetingProvider>
  );
}
