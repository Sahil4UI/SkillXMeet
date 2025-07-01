"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    // Wait until loading is false to prevent race conditions
    if (!loading) {
      router.push(user ? "/dashboard" : "/login");
    }
  };

  return (
    <main
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center"
    >
      <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent animate-gradient">
          TrainerMeet
        </h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl">
          Your next-gen video meeting platform with vibrant, interactive visuals 🚀
        </p>

        <Button size="lg" className="mt-8" onClick={handleGetStarted} disabled={loading}>
            Get Started
        </Button>
      </div>

      <footer className="absolute bottom-4 z-10 rounded-full bg-background/50 px-4 py-2 text-sm text-foreground/80 backdrop-blur-sm">
        Developed by Sahil 🐼
      </footer>
    </main>
  );
}
