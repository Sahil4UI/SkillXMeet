'use client';

import { useEffect, useRef } from 'react';
import { useMeeting, type Participant } from '@/context/meeting-context';
import { useAuth } from '@/context/auth-context';
import { MicOff, VideoOff, ScreenShare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';


interface VideoTileProps {
  participant: Participant;
  stream: MediaStream | null;
  isLocal: boolean;
}

function VideoTile({ stream, participant, isLocal }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const displayName = isLocal ? 'You' : participant?.displayName || 'Guest';

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const showVideo = participant.isVideoOn && stream;

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg bg-black aspect-video flex items-center justify-center text-white">
      <video 
        ref={videoRef} 
        autoPlay 
        muted={isLocal} // Only mute local stream to prevent echo
        playsInline 
        className={cn('w-full h-full object-cover', {
            'transform scale-x-[-1]': isLocal && !participant.isScreenSharing,
            'hidden': !showVideo
        })}
      />
      {!showVideo && (
        <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 text-4xl">
                <AvatarImage src={participant.photoURL || ''} data-ai-hint="person avatar"/>
                <AvatarFallback>{participant.displayName?.charAt(0) || 'G'}</AvatarFallback>
            </Avatar>
            {participant.isScreenSharing ? (
                <div className='flex items-center gap-2 mt-4 text-lg'>
                    <ScreenShare className='w-6 h-6' />
                    <p>Presenting</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 mt-2">
                    <VideoOff className="w-12 h-12" />
                    <p className="text-lg">Video is off</p>
                </div>
            )}
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded flex items-center gap-2">
        {!participant.isMicOn && <MicOff className="w-4 h-4 text-red-500" />}
        <span>{displayName}</span>
      </div>
    </div>
  );
}


export function VideoGrid() {
  const { participants, localStream, remoteStreams } = useMeeting();
  const { user } = useAuth();
  
  const localParticipant = participants.find(p => p.uid === user?.uid);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full w-full overflow-y-auto">
      {/* My Video */}
      {localStream && localParticipant && (
        <VideoTile 
          stream={localStream}
          isLocal={true}
          participant={localParticipant}
        />
      )}
      
      {/* Other participants */}
      {participants
        .filter(p => p.uid !== user?.uid)
        .map(p => (
         <VideoTile 
            key={p.uid}
            participant={p}
            stream={remoteStreams[p.uid] || null} 
            isLocal={false}
        />
      ))}
    </div>
  );
}
