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

  const totalParticipants = 1 + otherParticipants.length;
  // Basic logic to determine layout, can be made more sophisticated
  const layoutClasses = totalParticipants <= 4 ? "md:grid-cols-2" : "md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 ${layoutClasses} gap-4 p-4 h-full w-full bg-muted/20 overflow-y-auto`}>
      {/* My Video */}
      <div className="relative rounded-lg overflow-hidden shadow-lg bg-black aspect-video flex items-center justify-center">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
          You
        </div>
      </div>
      {/* Other participants */}
      {otherParticipants.map(p => (
        <div key={p.name} className="relative rounded-lg overflow-hidden shadow-lg bg-black aspect-video flex items-center justify-center">
          <Image src={p.image} fill className="object-cover" alt={`${p.name}'s video`} data-ai-hint="person video call" />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
            {p.name}
          </div>
        </div>
      ))}
    </div>
  );
}
