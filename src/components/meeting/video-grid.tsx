'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const otherParticipants = [
  { name: 'Student 1', isMuted: true, isSpeaking: false, image: 'https://placehold.co/400x300' },
  { name: 'Student 2', isMuted: false, isSpeaking: false, image: 'https://placehold.co/400x300' },
  { name: 'Student 3', isMuted: false, isSpeaking: false, image: 'https://placehold.co/400x300' },
  { name: 'Student 4', isMuted: true, isSpeaking: false, image: 'https://placehold.co/400x300' },
];

export function VideoGrid() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices in VideoGrid: ", err);
      }
    };
    getMedia();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
  }, []);

  return (
    <div className="h-full w-full flex p-4 gap-4 bg-muted/20">
      <div className="flex-1 relative rounded-lg overflow-hidden shadow-lg bg-black">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
          You
        </div>
      </div>
      {otherParticipants.length > 0 && (
        <div className="w-64 flex-col gap-4 hidden md:flex">
          {otherParticipants.map(p => (
            <div key={p.name} className="relative aspect-video rounded-lg overflow-hidden shadow-md">
              <Image src={p.image} fill className="object-cover" alt={`${p.name}'s video`} data-ai-hint="person listening"/>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
