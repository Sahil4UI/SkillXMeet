"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const mainContent = (
     <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent animate-gradient">
          SkillsMeet
        </h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl">
          The modern platform to learn and master computer skills. 🚀
        </p>

        {loading ? (
           <Skeleton className="h-12 w-40 mt-8" />
        ) : user ? (
            <Button size="lg" className="mt-8" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
            </Button>
        ) : (
            <LoginDialog>
                <Button size="lg" className="mt-8">
                    Get Started
                </Button>
            </LoginDialog>
        )}
      </div>
  );

  return (
    <main
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center"
    >
      {mainContent}
      <footer className="absolute bottom-4 z-10 rounded-full bg-background/50 px-4 py-2 text-sm text-foreground/80 backdrop-blur-sm">
        Developed by Sahil 🐼
      </footer>
    </main>
  );
}
