"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = NET({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x00ccff,         // Neon cyan spider web (vibrant & visible)
        backgroundColor: 0xffffff, // Pure light background
        points: 15.0,
        maxDistance: 25.0,
        spacing: 18.0,
      });
    }
    return () => {
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, []);

  const handleGetStarted = () => {
    router.push(user ? "/dashboard" : "/login");
  };

  return (
    <main
      ref={vantaRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Optional translucent overlay to balance brightness */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/50 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent animate-gradient">
          TrainerMeet
        </h1>
        <p className="mt-4 text-lg md:text-xl text-black/80 max-w-2xl">
          Your next-gen video meeting platform with neon spider web vibes 💫
        </p>

        <Button size="lg" className="mt-8" onClick={handleGetStarted}>
            Get Started
        </Button>
      </div>

      <footer className="absolute bottom-4 text-black/60 text-sm z-10">
        Developed by Sahil 🚀
      </footer>
    </main>
  );
}
