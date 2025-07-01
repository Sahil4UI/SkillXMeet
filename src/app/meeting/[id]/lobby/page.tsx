'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic, MicOff, Video, VideoOff, AlertTriangle, Frown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

export default function LobbyPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const db = getFirestore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMicOn, setMicOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [meetingExists, setMeetingExists] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && db) {
      const fetchMeeting = async () => {
        // For instant meetings, we assume they exist and the user is the creator.
        if (params.id.length <= 7) {
          setMeetingExists(true);
          setIsCreator(true);
          return;
        }

        const meetingRef = doc(db, 'meetings', params.id);
        const meetingSnap = await getDoc(meetingRef);
        
        if (meetingSnap.exists()) {
          setMeetingExists(true);
          const meetingData = meetingSnap.data();
          if (user.uid === meetingData.creatorId) {
            setIsCreator(true);
          }
        } else {
          setMeetingExists(false);
        }
      }
      fetchMeeting();
    }
  }, [user, authLoading, router, params.id, db]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera & Mic Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings to continue.',
        });
      }
    };
    
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        getCameraPermission();
    } else {
        setHasCameraPermission(false);
    }

    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const toggleMediaTrack = (kind: 'audio' | 'video') => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
            if (track.kind === kind) {
                track.enabled = !track.enabled;
                if (kind === 'video') {
                    setVideoOn(prev => !prev);
                } else if (kind === 'audio') {
                    setMicOn(prev => !prev);
                }
            }
        });
    }
  };
  
  const handleJoin = () => {
    router.push(`/meeting/${params.id}?mic=${isMicOn}&video=${isVideoOn}`);
  }

  const isLoading = authLoading || meetingExists === null;

  if (isLoading) {
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

  if (meetingExists === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-lg text-center">
           <CardHeader>
             <CardTitle className="text-2xl">Meeting Not Found</CardTitle>
             <CardDescription>
                This meeting link is invalid or the meeting has been deleted.
             </CardDescription>
           </CardHeader>
           <CardContent>
              <Frown className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
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
          <CardDescription>Check your camera and microphone before joining.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoOn && 'hidden'}`} autoPlay muted playsInline />
            
            {(!isVideoOn || hasCameraPermission === null) && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <VideoOff className="w-12 h-12 mb-2"/>
                    <p className="text-lg">Camera is off</p>
                </div>
            )}

            {hasCameraPermission === false && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4 text-center">
                <AlertTriangle className="w-12 h-12 mb-2 text-yellow-400"/>
                <p className="text-lg font-semibold">Camera and Mic Blocked</p>
                <p className="text-sm">Please allow access in your browser to continue.</p>
              </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                <Button variant={isMicOn ? 'outline' : 'destructive'} size="icon" className="rounded-full bg-black/50 border-0 text-white hover:bg-black/70 hover:text-white" onClick={() => toggleMediaTrack('audio')} disabled={hasCameraPermission !== true}>
                    {isMicOn ? <Mic /> : <MicOff />}
                </Button>
                 <Button variant={isVideoOn ? 'outline' : 'destructive'} size="icon" className="rounded-full bg-black/50 border-0 text-white hover:bg-black/70 hover:text-white" onClick={() => toggleMediaTrack('video')} disabled={hasCameraPermission !== true}>
                    {isVideoOn ? <Video /> : <VideoOff />}
                </Button>
            </div>
          </div>
          <p className="text-muted-foreground">You are joining meeting <span className="font-bold text-foreground">{params.id}</span></p>
          <Button size="lg" disabled={hasCameraPermission !== true} onClick={handleJoin}>
            {isCreator ? 'Join Meeting' : 'Ask to Join'}
          </Button>

           {hasCameraPermission === false && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Hardware Access Required</AlertTitle>
                <AlertDescription>
                   This application needs access to your camera and microphone to function. Please grant permission when prompted by your browser.
                </AlertDescription>
             </Alert>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
