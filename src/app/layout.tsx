import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { FirebaseConfigWarning } from '@/components/firebase-config-warning';
import { ParticlesContainer } from '@/components/particles-container';

export const metadata: Metadata = {
  title: 'TrainerMeet',
  description: 'Online classes for trainers and students.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ParticlesContainer />
          <div className="relative z-10 min-h-screen flex flex-col">
            <FirebaseConfigWarning />
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
