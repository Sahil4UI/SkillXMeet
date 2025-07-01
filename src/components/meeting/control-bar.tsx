'use client';
import { useMeeting } from '@/context/meeting-context';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, MessageSquare, Users, Phone, Sparkles } from 'lucide-react';
import { ChatPanel } from './chat-panel';
import { ParticipantPanel } from './participant-panel';
import { AiToolSuggesterDialog } from './ai-tool-suggester-dialog';
import { useRouter } from 'next/navigation';

export function ControlBar() {
  const { isMicOn, isVideoOn, toggleMic, toggleVideo, leaveMeeting, isScreenSharing, toggleScreenShare } = useMeeting();
  const router = useRouter();

  const handleLeave = () => {
    leaveMeeting();
    router.push('/');
  }

  return (
    <TooltipProvider>
      <div className="bg-card/80 backdrop-blur-sm p-4 flex justify-center items-center gap-2 md:gap-4 border-t">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={isMicOn ? "outline" : "destructive"} size="lg" className="rounded-full w-16 h-16" onClick={toggleMic}>
              {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isMicOn ? 'Mute' : 'Unmute'}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={isVideoOn ? "outline" : "destructive"} size="lg" className="rounded-full w-16 h-16" onClick={toggleVideo}>
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
            <Button 
              variant={isScreenSharing ? 'secondary' : 'outline'}
              size="lg" 
              className="rounded-full w-16 h-16"
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? <ScreenShareOff className="w-7 h-7 text-primary" /> : <ScreenShare className="w-7 h-7" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isScreenSharing ? 'Stop sharing' : 'Share Screen'}</p></TooltipContent>
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
            <Button variant="destructive" size="lg" className="rounded-full w-24 h-16" onClick={handleLeave}>
              <Phone className="w-7 h-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>End Call</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
