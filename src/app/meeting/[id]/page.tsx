import { ControlBar } from '@/components/meeting/control-bar';
import { VideoGrid } from '@/components/meeting/video-grid';

export default function MeetingPage({ params }: { params: { id:string } }) {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      <div className="flex-1 relative">
        <VideoGrid />
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 px-4 rounded-lg z-10">
            <h1 className="text-lg font-bold font-headline">Advanced React Hooks ({params.id})</h1>
        </div>
      </div>
      <ControlBar />
    </div>
  );
}
