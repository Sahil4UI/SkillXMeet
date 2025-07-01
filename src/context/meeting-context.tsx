'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '@/lib/firebase';

export interface Participant {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    joinedAt: any;
}

interface MeetingContextType {
  participants: Participant[];
}

const MeetingContext = createContext<MeetingContextType>({
  participants: [],
});

export const MeetingProvider = ({ children, meetingId, user }: { children: ReactNode; meetingId: string; user: User }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const firestore = getFirestore();

  useEffect(() => {
    if (!firestore || !user) return;

    const participantsColRef = collection(firestore, 'meetings', meetingId, 'participants');
    const userDocRef = doc(participantsColRef, user.uid);

    // Add user to participants on join
    setDoc(userDocRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        joinedAt: serverTimestamp(),
    });

    // Listen for real-time updates
    const unsubscribe = onSnapshot(participantsColRef, (snapshot) => {
        const newParticipants = snapshot.docs.map(doc => doc.data() as Participant);
        setParticipants(newParticipants);
    });

    // Cleanup on component unmount or user leaves
    const handleBeforeUnload = () => {
      deleteDoc(userDocRef);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      deleteDoc(userDocRef); // Remove user from participants
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

  }, [meetingId, user, firestore]);

  const value = { participants };

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
};

export const useMeeting = () => {
  return useContext(MeetingContext);
};
