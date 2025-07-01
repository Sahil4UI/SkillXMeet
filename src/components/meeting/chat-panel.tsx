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

const messages = [
    { user: 'Student 1', text: 'Can you please explain that again?', time: '14:05' },
    { user: 'Trainer', text: 'Of course! Which part was unclear?', time: '14:06' },
    { user: 'Student 3', text: 'The part about the custom hook return value.', time: '14:06' },
    { user: 'Student 2', text: 'I have the same question.', time: '14:07' },
];

export function ChatPanel({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Session Chat</SheetTitle>
          <SheetDescription>Messages are visible to everyone in the meeting.</SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="h-[calc(100%-8rem)] flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40`} data-ai-hint="person avatar"/>
                    <AvatarFallback>{msg.user.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="font-bold text-sm">{msg.user}</p>
                      <p className="text-xs text-muted-foreground">{msg.time}</p>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-auto py-4">
            <div className="flex gap-2">
              <Input placeholder="Type a message..." />
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
