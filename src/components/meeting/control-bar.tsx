'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageSquare, Users, Phone, Sparkles } from 'lucide-react';
import { ChatPanel } from './chat-panel';
import { ParticipantPanel } from './participant-panel';
import { AiToolSuggesterDialog } from './ai-tool-suggester-dialog';

interface ControlBarProps {
  initialMicOn?: boolean;
  initialVideoOn?: boolean;
}

export function ControlBar({ initialMicOn = true, initialVideoOn = true }: ControlBarProps) {
  const [isMicOn, setMicOn] = useState(initialMicOn);
  const [isVideoOn, setVideoOn] = useState(initialVideoOn);

  return (
    <TooltipProvider>
      <div className="bg-card/80 backdrop-blur-sm p-4 flex justify-center items-center gap-2 md:gap-4 border-t">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={isMicOn ? "outline" : "destructive"} size="lg" className="rounded-full w-16 h-16" onClick={() => setMicOn(!isMicOn)}>
              {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isMicOn ? 'Mute' : 'Unmute'}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={isVideoOn ? "outline" : "destructive"} size="lg" className="rounded-full w-16 h-16" onClick={() => setVideoOn(!isVideoOn)}>
              {isVideoOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isVideoOn ? 'Stop video' : 'Start video'}</p></TooltipContent>
        </Tooltip>
        
        <AiToolSuggesterDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full w-16 h-16 bg-accent/20 hover:bg-accent/30 border-accent/50">
                <Sparkles className="w-7 h-7 text-accent" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>AI Tool Suggestions</p></TooltipContent>
          </Tooltip>
        </AiToolSuggesterDialog>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="lg" className="rounded-full w-16 h-16">
              <ScreenShare className="w-7 h-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Share Screen</p></TooltipContent>
        </Tooltip>

        <ParticipantPanel>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full w-16 h-16">
                <Users className="w-7 h-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Participants</p></TooltipContent>
          </Tooltip>
        </ParticipantPanel>

        <ChatPanel>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full w-16 h-16">
                <MessageSquare className="w-7 h-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Chat</p></TooltipContent>
          </Tooltip>
        </ChatPanel>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" size="lg" className="rounded-full w-24 h-16">
              <Phone className="w-7 h-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>End Call</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
