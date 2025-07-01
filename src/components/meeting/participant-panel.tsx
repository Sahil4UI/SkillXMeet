'use client';

import { useMeeting } from "@/context/meeting-context";
import { useAuth } from "@/context/auth-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, UserPlus, MoreVertical, X } from 'lucide-react';
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

export function ParticipantPanel({ children }: { children: React.ReactNode }) {
  const { participants } = useMeeting();
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Participants ({participants.length})</SheetTitle>
        </SheetHeader>

        <h3 className="font-semibold mb-2 mt-2 text-muted-foreground">In the meeting</h3>
        <ScrollArea className="flex-1 pr-4">
            <div className="flex flex-col gap-1">
                {participants.map((p) => (
                    <div key={p.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={p.photoURL || `https://placehold.co/40x40`} data-ai-hint="person avatar"/>
                                <AvatarFallback>{p.displayName?.substring(0,2) || 'G'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{p.displayName} {p.uid === user.uid ? '(You)' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {p.isVideoOn ? <Video className="h-5 w-5 text-primary"/> : <VideoOff className="h-5 w-5 text-muted-foreground"/>}
                            {p.isMicOn ? <Mic className="h-5 w-5 text-primary"/> : <MicOff className="h-5 w-5 text-muted-foreground" />}
                            {p.uid !== user.uid && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem disabled><MicOff className="mr-2"/> Mute</DropdownMenuItem>
                                        <DropdownMenuItem disabled><VideoOff className="mr-2"/> Stop video</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" disabled>
                                            <X className="mr-2"/> Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
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
