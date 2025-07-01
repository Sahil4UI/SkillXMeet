import Image from 'next/image';

const participants = [
  { name: 'Trainer', isMuted: false, isSpeaking: true, image: 'https://placehold.co/800x600' },
  { name: 'Student 1', isMuted: true, isSpeaking: false, image: 'https://placehold.co/400x300' },
  { name: 'Student 2', isMuted: false, isSpeaking: false, image: 'https://placehold.co/400x300' },
  { name: 'Student 3', isMuted: false, isSpeaking: false, image: 'https://placehold.co/400x300' },
  { name: 'Student 4', isMuted: true, isSpeaking: false, image: 'https://placehold.co/400x300' },
];

export function VideoGrid() {
  const mainParticipant = participants.find(p => p.isSpeaking) || participants[0];
  const otherParticipants = participants.filter(p => p !== mainParticipant);

  return (
    <div className="h-full w-full flex p-4 gap-4 bg-muted/20">
      <div className="flex-1 relative rounded-lg overflow-hidden shadow-lg">
        <Image src={mainParticipant.image} fill className="object-cover" alt={`${mainParticipant.name}'s video`} data-ai-hint="person teaching"/>
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
          {mainParticipant.name}
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
