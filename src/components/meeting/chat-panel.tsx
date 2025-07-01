import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useMeeting } from '@/context/meeting-context';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


export function ChatPanel({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { messages, sendMessage } = useMeeting();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      try {
        return format(timestamp.toDate(), 'HH:mm');
      } catch (e) {
        return "";
      }
    }
    return '';
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Session Chat</SheetTitle>
          <SheetDescription>Messages are visible to everyone in the meeting.</SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2", {
                  'justify-end': msg.uid === user?.uid
                })}>
                  {msg.uid !== user?.uid && (
                    <Avatar className="h-8 w-8 self-end">
                      <AvatarImage src={`https://placehold.co/40x40`} data-ai-hint="person avatar"/>
                      <AvatarFallback>{msg.displayName?.substring(0, 2) || 'G'}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("rounded-lg p-3 max-w-xs md:max-w-md", {
                      'bg-primary text-primary-foreground': msg.uid === user?.uid,
                      'bg-muted': msg.uid !== user?.uid
                  })}>
                    <div className="flex items-baseline gap-2">
                      <p className="font-bold text-sm">{msg.uid === user?.uid ? 'You' : msg.displayName}</p>
                      <p className="text-xs opacity-80">{formatTimestamp(msg.timestamp)}</p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        <form onSubmit={handleSendMessage} className="mt-auto py-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
