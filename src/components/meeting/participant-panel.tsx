import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, UserPlus } from 'lucide-react';
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

const participants = [
    { name: 'Trainer (You)', isMuted: false, isVideoOn: true },
    { name: 'Student 1', isMuted: true, isVideoOn: true },
    { name: 'Student 2', isMuted: false, isVideoOn: false },
    { name: 'Student 3', isMuted: false, isVideoOn: true },
    { name: 'Student 4', isMuted: true, isVideoOn: false },
];

const waiting = [
    { name: 'Guest 1'},
    { name: 'Guest 2'},
]

export function ParticipantPanel({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Participants ({participants.length})</SheetTitle>
        </SheetHeader>
        
        {waiting.length > 0 && (
            <div className="mt-4">
                <h3 className="font-semibold mb-2">In waiting room ({waiting.length})</h3>
                <div className="flex flex-col gap-2">
                    {waiting.map((p) => (
                         <div key={p.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{p.name.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <span>{p.name}</span>
                            </div>
                            <Button size="sm" variant="outline">Admit</Button>
                         </div>
                    ))}
                    <Button variant="link">Admit all</Button>
                </div>
                <Separator className="my-4"/>
            </div>
        )}

        <h3 className="font-semibold mb-2 mt-2">In the meeting</h3>
        <ScrollArea className="flex-1 pr-4">
            <div className="flex flex-col gap-4">
                {participants.map((p) => (
                    <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/40x40`} data-ai-hint="person avatar"/>
                                <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <span>{p.name}</span>
                        </div>
                        <div className="flex gap-2">
                            {p.isVideoOn ? <Video className="h-5 w-5"/> : <VideoOff className="h-5 w-5 text-muted-foreground"/>}
                            {p.isMuted ? <MicOff className="h-5 w-5 text-muted-foreground"/> : <Mic className="h-5 w-5"/>}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
        <div className="mt-auto border-t pt-4">
            <Button variant="outline" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Add People
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
