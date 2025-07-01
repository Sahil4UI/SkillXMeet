'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy } from 'lucide-react';

interface ShareMeetingDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  meetingId: string;
  meetingTitle: string;
}

export function ShareMeetingDialog({ isOpen, setIsOpen, meetingId, meetingTitle }: ShareMeetingDialogProps) {
  const { toast } = useToast();
  const [meetingUrl, setMeetingUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/meeting/${meetingId}/lobby`;
      setMeetingUrl(url);
    }
  }, [meetingId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "The meeting link has been copied to your clipboard.",
      });
    }, (err) => {
      toast({
        variant: 'destructive',
        title: "Copy Failed",
        description: "Could not copy the link. Please try again.",
      });
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Meeting: {meetingTitle}</DialogTitle>
          <DialogDescription>
            Anyone with this link will be able to join the lobby.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
            <Label htmlFor="link" className="sr-only">
                Link
            </Label>
            <div className="flex items-center space-x-2">
                <Input id="link" value={meetingUrl} readOnly />
                <Button type="submit" size="icon" className="px-3" onClick={handleCopy}>
                    <span className="sr-only">Copy</span>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
