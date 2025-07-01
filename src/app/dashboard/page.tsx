'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Header } from '@/components/header';
import { ScheduleDialog } from '@/components/dashboard/schedule-dialog';
import { UpcomingMeetings } from '@/components/dashboard/upcoming-meetings';
import { Button } from '@/components/ui/button';
import { CalendarClock, CalendarPlus, Lightbulb, Sparkles, Users, Video } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AiToolSuggesterDialog } from '@/components/meeting/ai-tool-suggester-dialog';


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isScheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-72 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-48 w-full" />
              <div>
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  <Skeleton className="h-56 w-full" />
                  <Skeleton className="h-56 w-full" />
                  <Skeleton className="h-56 w-full" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-8">
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
       <ScheduleDialog 
          isOpen={isScheduleDialogOpen} 
          setIsOpen={setScheduleDialogOpen}
      />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline text-gradient animate-gradient">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</h1>
          <p className="text-muted-foreground font-code">Here's your dashboard to manage your training sessions.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="transition-all hover:shadow-lg hover:shadow-primary/40">
              <CardHeader>
                <CardTitle>Start a Session</CardTitle>
                <CardDescription>Launch a new training session instantly or schedule one for later.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                 <Button size="lg" onClick={() => router.push(`/meeting/${Math.random().toString(36).substring(2, 9)}/lobby`)}>
                    <Video className="mr-2" /> New Instant Meeting
                 </Button>
                <Button size="lg" variant="outline" onClick={() => setScheduleDialogOpen(true)}>
                    <CalendarPlus className="mr-2" /> Schedule for Later
                </Button>
              </CardContent>
            </Card>

            <UpcomingMeetings />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card className="transition-all hover:shadow-lg hover:shadow-primary/30">
              <CardHeader>
                <CardTitle>At a Glance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-muted rounded-md">
                      <CalendarClock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Next Meeting</p>
                      <p className="text-sm text-muted-foreground">Check upcoming meetings</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-muted rounded-md">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Total Meetings</p>
                      <p className="text-sm text-muted-foreground">All scheduled</p>
                    </div>
                  </div>
                  {/* This would ideally come from the fetched meetings length */}
                  <p className="font-bold text-2xl">...</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/20 border-accent/50 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-accent" /> AI Assistant
                </CardTitle>
                <CardDescription>Need help planning your session? Get tool suggestions from our AI.</CardDescription>
              </CardHeader>
              <CardContent>
                <AiToolSuggesterDialog>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Lightbulb className="mr-2" /> Get Suggestions
                  </Button>
                </AiToolSuggesterDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
