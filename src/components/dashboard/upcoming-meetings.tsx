'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit, MoreVertical, Trash, Share2 } from 'lucide-react';
import { FormattedDate } from './formatted-date';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, getFirestore, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '../ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteMeeting } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScheduleDialog } from './schedule-dialog';
import { ShareMeetingDialog } from './share-meeting-dialog';

interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    description: string;
    creatorId: string;
}

export function UpcomingMeetings() {
  const { user, loading: authLoading } = useAuth();
  const db = getFirestore();
  const { toast } = useToast();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    const q = query(collection(db, "meetings"), orderBy("date", "asc"), orderBy("time", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const meetingsData: Meeting[] = [];
        querySnapshot.forEach((doc) => {
            meetingsData.push({ id: doc.id, ...doc.data() } as Meeting);
        });
        setMeetings(meetingsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching meetings:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleDelete = async () => {
    if (!selectedMeeting) return;
    const result = await deleteMeeting(selectedMeeting.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.message });
    }
    setDeleteDialogOpen(false);
    setSelectedMeeting(null);
  };

  const openDeleteDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDeleteDialogOpen(true);
  }

  const openEditDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setEditDialogOpen(true);
  }

  const openShareDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShareDialogOpen(true);
  }

  if (authLoading || loading) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 font-headline">Upcoming Meetings</h2>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-headline">Upcoming Meetings</h2>
      {meetings.length === 0 ? (
        <Card>
            <CardHeader>
                <CardTitle>No Meetings Scheduled</CardTitle>
                <CardDescription>You don't have any meetings on your calendar yet. Schedule one to get started!</CardDescription>
            </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {meetings.map((meeting) => (
            <Card key={meeting.id} className="transition-all hover:shadow-lg hover:shadow-primary/30 flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{meeting.title}</CardTitle>
                            <CardDescription>{meeting.description}</CardDescription>
                        </div>
                        {user && user.uid === meeting.creatorId && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openShareDialog(meeting)}>
                                        <Share2 className="mr-2 h-4 w-4" /> Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEditDialog(meeting)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openDeleteDialog(meeting)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <FormattedDate 
                        date={meeting.date} 
                        options={{ dateStyle: 'long', timeZone: 'UTC' }} 
                    />
                    </div>
                    <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{meeting.time}</span>
                    </div>
                </div>
                </CardContent>
                <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/meeting/${meeting.id}/lobby`}>Join Lobby</Link>
                </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the meeting
              "{selectedMeeting?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit and Share Dialogs */}
      {selectedMeeting && (
        <>
          <ScheduleDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setEditDialogOpen}
            initialData={selectedMeeting}
          />
          <ShareMeetingDialog
            isOpen={isShareDialogOpen}
            setIsOpen={setShareDialogOpen}
            meetingId={selectedMeeting.id}
            meetingTitle={selectedMeeting.title}
          />
        </>
      )}
    </div>
  );
}
