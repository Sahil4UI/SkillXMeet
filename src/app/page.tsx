import { Header } from '@/components/header';
import { ScheduleDialog } from '@/components/dashboard/schedule-dialog';
import { UpcomingMeetings } from '@/components/dashboard/upcoming-meetings';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <ScheduleDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </ScheduleDialog>
        </div>
        <UpcomingMeetings />
      </main>
    </div>
  );
}
