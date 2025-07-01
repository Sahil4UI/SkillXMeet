'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createMeeting, updateMeeting, type MeetingData } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";

const meetingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  date: z.string().min(1, "Date is required."),
  time: z.string().min(1, "Time is required."),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

interface ScheduleDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialData?: MeetingData & { id: string };
}

export function ScheduleDialog({ isOpen, setIsOpen, initialData }: ScheduleDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        time: "10:00",
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit: SubmitHandler<MeetingFormValues> = async (data) => {
    if (!user) {
      toast({ variant: 'destructive', title: "Not authenticated", description: "You must be logged in to schedule a meeting." });
      return;
    }

    setIsSubmitting(true);
    let result;
    if (initialData) {
      result = await updateMeeting(initialData.id, data);
    } else {
      result = await createMeeting(data, user.uid);
    }
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Success!", description: result.message });
      setIsOpen(false);
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Meeting" : "Schedule a New Meeting"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the details for your training session." : "Fill in the details below to schedule your next training session."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <div className="col-span-3">
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <div className="col-span-3">
                <Textarea id="description" {...register("description")} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <div className="col-span-3">
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Time</Label>
              <div className="col-span-3">
                <Input id="time" type="time" {...register("time")} />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Schedule Meeting")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
