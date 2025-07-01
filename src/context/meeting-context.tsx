'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, getFirestore, addDoc, query, where, writeBatch } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface Participant {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    joinedAt: any;
}

interface MeetingContextType {
  participants: Participant[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isMicOn: boolean;
  isVideoOn: boolean;
  toggleMic: () => void;
  toggleVideo: () => void;
  leaveMeeting: () => void;
}

const MeetingContext = createContext<MeetingContextType>({
  participants: [],
  localStream: null,
  remoteStreams: {},
  isMicOn: true,
  isVideoOn: true,
  toggleMic: () => {},
  toggleVideo: () => {},
  leaveMeeting: () => {},
});

// Using public STUN servers
const configuration = {
  iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
};

export const MeetingProvider = ({ children, meetingId, user, initialMicOn, initialVideoOn }: { children: ReactNode; meetingId: string; user: User; initialMicOn: boolean; initialVideoOn: boolean }) => {
  const firestore = getFirestore();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMicOn, setMicOn] = useState(initialMicOn);
  const [isVideoOn, setVideoOn] = useState(initialVideoOn);
  
  const pcs = useRef<Record<string, RTCPeerConnection>>({});
  const signalingSubs = useRef<Array<() => void>>([]);

  const leaveMeeting = useCallback(() => {
    // Stop local media tracks
    localStream?.getTracks().forEach(track => track.stop());

    // Close all peer connections
    Object.values(pcs.current).forEach(pc => pc.close());
    pcs.current = {};

    // Unsubscribe from all Firestore listeners
    signalingSubs.current.forEach(unsub => unsub());
    signalingSubs.current = [];

    // Remove user from participants list
    if (firestore) {
      const userDocRef = doc(firestore, 'meetings', meetingId, 'participants', user.uid);
      deleteDoc(userDocRef);
    }
  }, [localStream, firestore, meetingId, user.uid]);
  
  useEffect(() => {
    // Get local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getAudioTracks()[0].enabled = initialMicOn;
        stream.getVideoTracks()[0].enabled = initialVideoOn;
        setLocalStream(stream);
      })
      .catch(error => console.error("Error accessing media devices.", error));

    // Add cleanup function for when component unmounts
    return () => {
        leaveMeeting();
    };
  }, [initialMicOn, initialVideoOn, leaveMeeting]);

  useEffect(() => {
    if (!localStream || !firestore) return;

    // Join the meeting
    const userDocRef = doc(firestore, 'meetings', meetingId, 'participants', user.uid);
    setDoc(userDocRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        joinedAt: serverTimestamp(),
    });

    const participantsUnsub = onSnapshot(collection(firestore, 'meetings', meetingId, 'participants'), (snapshot) => {
      const updatedParticipants = snapshot.docs.map(doc => doc.data() as Participant);
      setParticipants(updatedParticipants);
    });
    signalingSubs.current.push(participantsUnsub);


    const handleSignaling = async (from: string) => {
      const pc = new RTCPeerConnection(configuration);
      pcs.current[from] = pc;
      
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      
      pc.ontrack = event => {
        setRemoteStreams(prev => ({ ...prev, [from]: event.streams[0] }));
      };

      const signalingCol = collection(firestore, `meetings/${meetingId}/webrtc`);
      const callDoc = doc(signalingCol, `${user.uid}_${from}`);
      const offerCandidates = collection(callDoc, 'offerCandidates');
      const answerCandidates = collection(callDoc, 'answerCandidates');

      pc.onicecandidate = event => {
        event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await setDoc(callDoc, { offer });

      const answerUnsub = onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      const answerCandidatesUnsub = onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
          }
        });
      });

      signalingSubs.current.push(answerUnsub, answerCandidatesUnsub);
    };

    const offersQuery = query(collection(firestore, `meetings/${meetingId}/webrtc`), where('offer.sdp', '!=', null));
    const offersUnsub = onSnapshot(offersQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
                const docId = change.doc.id;
                const [callerId, calleeId] = docId.split('_');

                if (calleeId === user.uid) {
                    const from = callerId;
                    const pc = new RTCPeerConnection(configuration);
                    pcs.current[from] = pc;
                    
                    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                    
                    pc.ontrack = event => {
                        setRemoteStreams(prev => ({ ...prev, [from]: event.streams[0] }));
                    };
                    
                    const callDoc = doc(collection(firestore, `meetings/${meetingId}/webrtc`), docId);
                    const offerCandidates = collection(callDoc, 'offerCandidates');
                    const answerCandidates = collection(callDoc, 'answerCandidates');
                    
                    pc.onicecandidate = event => {
                        event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
                    };

                    await pc.setRemoteDescription(new RTCSessionDescription(change.doc.data().offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    await setDoc(callDoc, { answer }, { merge: true });

                    const offerCandidatesUnsub = onSnapshot(offerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                            }
                        });
                    });
                    signalingSubs.current.push(offerCandidatesUnsub);
                }
            }
        });
    });
    signalingSubs.current.push(offersUnsub);
    
    // Slight delay to ensure this user is in the participants list before creating offers
    setTimeout(() => {
        participants.forEach(p => {
            if (p.uid !== user.uid && user.uid > p.uid) { // Simple logic to avoid offer glare
                handleSignaling(p.uid);
            }
        });
    }, 1000);


    // Handle window closing
    window.addEventListener('beforeunload', leaveMeeting);
    return () => {
      window.removeEventListener('beforeunload', leaveMeeting);
    };

  }, [localStream, firestore, meetingId, user, leaveMeeting, participants]);

  const toggleMic = () => {
    if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
        setMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
        localStream.getVideoTracks().forEach(track => track.enabled = !isVideoOn);
        setVideoOn(!isVideoOn);
    }
  };

  const value = { participants, localStream, remoteStreams, isMicOn, isVideoOn, toggleMic, toggleVideo, leaveMeeting };
  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
};

export const useMeeting = () => {
  return useContext(MeetingContext);
};
