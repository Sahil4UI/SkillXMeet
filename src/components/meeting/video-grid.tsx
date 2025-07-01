'use client';

import { useEffect, useRef } from 'react';
import { useMeeting, type Participant } from '@/context/meeting-context';
import { useAuth } from '@/context/auth-context';
import { MicOff, VideoOff } from 'lucide-react';

interface VideoTileProps {
  participant?: Participant;
  stream: MediaStream | null;
  isLocal: boolean;
  isMicOn?: boolean;
  isVideoOn?: boolean;
}

function VideoTile({ stream, participant, isLocal, isMicOn, isVideoOn }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  
  const displayName = isLocal ? 'You' : participant?.displayName || 'Guest';

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg bg-black aspect-video flex items-center justify-center text-white">
      <video 
        ref={videoRef} 
        autoPlay 
        muted={isLocal} // Only mute local stream to prevent echo
        playsInline 
        className={`w-full h-full object-cover ${isLocal ? 'transform scale-x-[-1]' : ''} ${!isVideoOn && 'hidden'}`}
      />
      {!isVideoOn && (
        <div className="flex flex-col items-center gap-2">
            <VideoOff className="w-12 h-12" />
            <p className="text-lg">Video is off</p>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded flex items-center gap-2">
        {!isMicOn && <MicOff className="w-4 h-4 text-red-500" />}
        <span>{displayName}</span>
      </div>
    </div>
  );
}


export function VideoGrid() {
  const { participants, localStream, remoteStreams, isMicOn, isVideoOn } = useMeeting();
  const { user } = useAuth();

  const otherParticipants = participants.filter(p => p.uid !== user?.uid);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full w-full overflow-y-auto">
      {/* My Video */}
      {localStream && (
        <VideoTile 
          stream={localStream}
          isLocal={true}
          isMicOn={isMicOn}
          isVideoOn={isVideoOn}
        />
      )}
      
      {/* Other participants */}
      {otherParticipants.map(p => (
         <VideoTile 
            key={p.uid}
            participant={p}
            stream={remoteStreams[p.uid] || null} 
            isLocal={false}
            isMicOn={true} // Placeholder: In a full app, this state would also be synced
            isVideoOn={!!remoteStreams[p.uid]} // Basic check if stream exists
        />
      ))}
    </div>
  );
}
