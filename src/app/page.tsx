'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect them to a dashboard page.
    // Let's create a new dashboard page soon. For now, let's keep them here.
    // if (!loading && user) {
    //   router.push('/dashboard');
    // }
  }, [user, loading, router]);


  return (
    <div className="flex flex-col min-h-screen">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <h1 className="text-2xl font-bold text-gradient animate-gradient">TrainerMeet</h1>
        <div>
          {loading ? null : user ? (
             <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          ) : (
            <Button onClick={() => router.push('/login')}>Login / Sign Up</Button>
          )}
        </div>
      </header>
      <main className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center text-center px-4">
        {/* The ParticlesContainer in layout.tsx will handle the background */}
        <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 bg-clip-text text-transparent animate-gradient text-center">
                Welcome to TrainerMeet
            </h1>

            <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-2xl">
                Experience the next generation of online training with real-time video, AI-powered tools, and seamless collaboration.
            </p>

            <Button size="lg" className="mt-8" onClick={() => router.push(user ? '/dashboard' : '/login')}>
                Get Started
            </Button>
        </div>

        <footer className="absolute bottom-4 z-10 text-foreground/60 text-sm">
            Developed by Sahil 🚀
        </footer>
      </main>
    </div>
  );
}
