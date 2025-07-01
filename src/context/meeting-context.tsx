'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, getFirestore, addDoc, query, writeBatch, orderBy, updateDoc, getDocs } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface Participant {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    joinedAt: any;
    isMicOn: boolean;
    isVideoOn: boolean;
    isScreenSharing: boolean;
}

export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string | null;
  text: string;
  timestamp: any; // Firestore timestamp
}

interface MeetingContextType {
  participants: Participant[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isMicOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  messages: ChatMessage[];
  toggleMic: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  leaveMeeting: () => void;
  sendMessage: (text: string) => void;
}

const MeetingContext = createContext<MeetingContextType>({
  participants: [],
  localStream: null,
  remoteStreams: {},
  isMicOn: true,
  isVideoOn: true,
  isScreenSharing: false,
  messages: [],
  toggleMic: () => {},
  toggleVideo: () => {},
  toggleScreenShare: () => {},
  leaveMeeting: () => {},
  sendMessage: () => {},
});

const configuration = {
  iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
};

export const MeetingProvider = ({ children, meetingId, user, initialMicOn, initialVideoOn }: { children: ReactNode; meetingId: string; user: User; initialMicOn: boolean; initialVideoOn: boolean }) => {
  const firestore = getFirestore();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  
  // Local state for controls
  const [isMicOn, setMicOn] = useState(initialMicOn);
  const [isVideoOn, setVideoOn] = useState(initialVideoOn);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const pcs = useRef<Record<string, RTCPeerConnection>>({});
  const signalingSubs = useRef<Array<() => void>>([]);
  const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  const cleanupConnections = useCallback(() => {
    localStream?.getTracks().forEach(track => track.stop());
    cameraVideoTrackRef.current?.stop();
    setLocalStream(null);

    Object.values(pcs.current).forEach(pc => pc.close());
    pcs.current = {};

    signalingSubs.current.forEach(unsub => unsub());
    signalingSubs.current = [];
    
    setRemoteStreams({});

    if (firestore && user) {
        const userDocRef = doc(firestore, 'meetings', meetingId, 'participants', user.uid);
        deleteDoc(userDocRef);
        
        const webrtcRef = collection(firestore, `meetings/${meetingId}/webrtc`);
        getDocs(webrtcRef).then(snapshot => {
            const batch = writeBatch(firestore);
            snapshot.docs.forEach(doc => {
                if (doc.id.includes(user.uid)) {
                    batch.delete(doc.ref);
                }
            })
            return batch.commit();
        })
    }
  }, [localStream, firestore, meetingId, user]);


  const leaveMeeting = useCallback(() => {
    cleanupConnections();
  }, [cleanupConnections]);
  
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getAudioTracks()[0].enabled = initialMicOn;
        stream.getVideoTracks()[0].enabled = initialVideoOn;
        cameraVideoTrackRef.current = stream.getVideoTracks()[0];
        setLocalStream(stream);
      })
      .catch(error => console.error("Error accessing media devices.", error));

    const handleBeforeUnload = () => {
      leaveMeeting();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        cleanupConnections();
    };
  }, [initialMicOn, initialVideoOn, leaveMeeting]);

  const setupPeerConnection = useCallback((peerId: string) => {
    if (!localStream || !firestore) return;
    
    pcs.current[peerId] = new RTCPeerConnection(configuration);
    
    localStream.getTracks().forEach(track => {
      pcs.current[peerId].addTrack(track, localStream);
    });

    pcs.current[peerId].ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

    pcs.current[peerId].onconnectionstatechange = () => {
        if(pcs.current[peerId]?.connectionState === 'disconnected' || pcs.current[peerId]?.connectionState === 'closed' || pcs.current[peerId]?.connectionState === 'failed'){
            setRemoteStreams(prev => {
                const newStreams = {...prev};
                delete newStreams[peerId];
                return newStreams;
            });
            pcs.current[peerId]?.close();
            delete pcs.current[peerId];
        }
    }
  }, [localStream, firestore]);
  

  useEffect(() => {
    if (!localStream || !firestore) return;

    const userDocRef = doc(firestore, 'meetings', meetingId, 'participants', user.uid);
    setDoc(userDocRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isMicOn: initialMicOn,
        isVideoOn: initialVideoOn,
        isScreenSharing: false,
        joinedAt: serverTimestamp(),
    }, { merge: true });
    
    // --- Main Participants Listener ---
    const participantsCol = collection(firestore, 'meetings', meetingId, 'participants');
    const participantsUnsub = onSnapshot(query(participantsCol, orderBy('joinedAt')), (snapshot) => {
      const newParticipants: Participant[] = [];
      snapshot.forEach(doc => newParticipants.push(doc.data() as Participant));

      // Get the current list of participant uids
      const currentParticipantUids = participants.map(p => p.uid);
      
      setParticipants(newParticipants);
      
      const newParticipantUids = newParticipants.map(p => p.uid);
      
      // --- Handle New Participants ---
      newParticipants.forEach(p => {
        if (p.uid !== user.uid && !pcs.current[p.uid]) {
          console.log(`New participant ${p.displayName} joined. Setting up peer connection.`);
          setupPeerConnection(p.uid);
        }
      });
      
      // --- Handle Leaving Participants ---
      currentParticipantUids.forEach(uid => {
          if(!newParticipantUids.includes(uid)){
              pcs.current[uid]?.close();
              delete pcs.current[uid];
              setRemoteStreams(prev => {
                  const newStreams = {...prev};
                  delete newStreams[uid];
                  return newStreams;
              })
          }
      });
    });

    // --- Signaling (WebRTC offers/answers) ---
    const signalingCol = collection(firestore, 'meetings', meetingId, 'webrtc');
    const signalingUnsub = onSnapshot(signalingCol, (snapshot) => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          const { offer, answer, from, to } = change.doc.data();
          if (to === user.uid) {
            if (offer) {
              const peerId = from;
              if (!pcs.current[peerId]) setupPeerConnection(peerId);
              const pc = pcs.current[peerId];
              
              await pc.setRemoteDescription(new RTCSessionDescription(offer));
              
              const pcAnswer = await pc.createAnswer();
              await pc.setLocalDescription(pcAnswer);

              await addDoc(signalingCol, { answer: pc.localDescription.toJSON(), from: user.uid, to: peerId });
              
              pc.onicecandidate = event => {
                if (event.candidate) {
                  addDoc(signalingCol, { candidate: event.candidate.toJSON(), from: user.uid, to: peerId });
                }
              };
            }
            if (answer) {
              const pc = pcs.current[from];
              if (pc && !pc.currentRemoteDescription) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
              }
            }
            if (change.doc.data().candidate) {
                const pc = pcs.current[from];
                if (pc?.remoteDescription) {
                    await pc.addIceCandidate(new RTCIceCandidate(change.doc.data().candidate));
                }
            }
          }
        }
      });
    });
    
    // --- Create offers for existing participants ---
    getDocs(participantsCol).then(snapshot => {
        snapshot.forEach(async doc => {
            const participant = doc.data() as Participant;
            if (participant.uid !== user.uid) {
                if(!pcs.current[participant.uid]) setupPeerConnection(participant.uid);
                const pc = pcs.current[participant.uid];

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                await addDoc(signalingCol, { offer: pc.localDescription.toJSON(), from: user.uid, to: participant.uid });
                
                pc.onicecandidate = event => {
                    if (event.candidate) {
                        addDoc(signalingCol, { candidate: event.candidate.toJSON(), from: user.uid, to: participant.uid });
                    }
                };
            }
        });
    });

    const messagesUnsub = onSnapshot(query(collection(firestore, 'meetings', meetingId, 'messages'), orderBy('timestamp', 'asc')), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    });

    signalingSubs.current.push(participantsUnsub, signalingUnsub, messagesUnsub);

  }, [localStream, firestore, meetingId, user, setupPeerConnection, initialMicOn, initialVideoOn]);
  

  const toggleMic = useCallback(async () => {
    const newState = !isMicOn;
    setMicOn(newState);
    if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = newState);
    }
    if (firestore) {
        await updateDoc(doc(firestore, 'meetings', meetingId, 'participants', user.uid), { isMicOn: newState });
    }
  }, [isMicOn, localStream, firestore, meetingId, user.uid]);

  const toggleVideo = useCallback(async () => {
    if (isScreenSharing) return;
    const newState = !isVideoOn;
    setVideoOn(newState);
    if (localStream) {
        localStream.getVideoTracks().forEach(track => {
            if (track.label.includes('camera')) { // A way to distinguish camera from screen
                track.enabled = newState;
            }
        });
    }
    if (firestore) {
        await updateDoc(doc(firestore, 'meetings', meetingId, 'participants', user.uid), { isVideoOn: newState });
    }
  }, [isVideoOn, isScreenSharing, localStream, firestore, meetingId, user.uid]);

  const toggleScreenShare = useCallback(async () => {
    if (!localStream || !cameraVideoTrackRef.current) return;
    
    const userDocRef = doc(firestore, 'meetings', meetingId, 'participants', user.uid);
    const screenSharingState = !isScreenSharing;

    try {
        if (screenSharingState) { // Start sharing
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            
            // Listen for when user stops sharing via browser UI
            screenTrack.onended = () => {
                toggleScreenShare(); // This will trigger the 'else' block
            };

            // Replace track for all peer connections
            for (const pc of Object.values(pcs.current)) {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                sender?.replaceTrack(screenTrack);
            }

            localStream.removeTrack(cameraVideoTrackRef.current);
            localStream.addTrack(screenTrack);
            setIsScreenSharing(true);
            await updateDoc(userDocRef, { isScreenSharing: true, isVideoOn: true });

        } else { // Stop sharing
            localStream.getVideoTracks().forEach(track => track.stop()); // Stop screen track
            localStream.removeTrack(localStream.getVideoTracks()[0]);
            localStream.addTrack(cameraVideoTrackRef.current);
            
             // Replace track for all peer connections
            for (const pc of Object.values(pcs.current)) {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                sender?.replaceTrack(cameraVideoTrackRef.current);
            }
            
            setIsScreenSharing(false);
            setVideoOn(true); // Ensure camera is on after stopping share
            cameraVideoTrackRef.current.enabled = true;
            await updateDoc(userDocRef, { isScreenSharing: false, isVideoOn: true });
        }
    } catch (error) {
        console.error("Error toggling screen share:", error);
        // Revert state if something fails
        await updateDoc(userDocRef, { isScreenSharing: false });
    }
  }, [isScreenSharing, localStream, firestore, meetingId, user.uid]);
  
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !firestore || !user) return;
    try {
        await addDoc(collection(firestore, 'meetings', meetingId, 'messages'), {
          uid: user.uid,
          displayName: user.displayName,
          text: text.trim(),
          timestamp: serverTimestamp(),
        });
    } catch(error) {
        console.error("Error sending message:", error);
    }
  }, [firestore, meetingId, user]);

  const value = { 
    participants, 
    localStream, 
    remoteStreams, 
    isMicOn, 
    isVideoOn, 
    isScreenSharing, 
    messages, 
    toggleMic, 
    toggleVideo, 
    toggleScreenShare, 
    leaveMeeting, 
    sendMessage 
  };

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
};

export const useMeeting = () => {
  return useContext(MeetingContext);
};
