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
import { Calendar, Clock } from 'lucide-react';

const meetings = [
  {
    id: '123',
    title: 'Advanced React Hooks',
    date: '2024-08-15',
    time: '14:00',
    description: 'Deep dive into useEffect, useCallback, and custom hooks.',
  },
  {
    id: '456',
    title: 'Introduction to Python',
    date: '2024-08-16',
    time: '10:00',
    description: 'Basics of Python syntax, data types, and control flow.',
  },
  {
    id: '789',
    title: 'CSS Grid & Flexbox Mastery',
    date: '2024-08-19',
    time: '16:00',
    description: 'Master modern CSS layouts for responsive web design.',
  },
];

export function UpcomingMeetings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-headline">Upcoming Meetings</h2>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardHeader>
              <CardTitle>{meeting.title}</CardTitle>
              <CardDescription>{meeting.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(meeting.date).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</span>
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
    </div>
  );
}
