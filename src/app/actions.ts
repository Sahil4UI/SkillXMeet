'use server';

import { suggestTrainingTools, SuggestTrainingToolsInput, SuggestTrainingToolsOutput } from '@/ai/flows/suggest-training-tools';
import { db } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// AI Tool Suggester Action
export async function getToolSuggestions(
  prompt: string
): Promise<SuggestTrainingToolsOutput> {
  const input: SuggestTrainingToolsInput = { prompt };
  try {
    const result = await suggestTrainingTools(input);
    return result;
  } catch (error) {
    console.error("Error getting tool suggestions:", error);
    throw new Error("Failed to get suggestions from AI.");
  }
}

// Meeting CRUD Actions
export interface MeetingData {
  title: string;
  description: string;
  date: string;
  time: string;
  creatorId?: string;
}

export async function createMeeting(meetingData: MeetingData, creatorId: string) {
  if (!db) throw new Error("Firestore is not initialized.");
  try {
    await addDoc(collection(db, "meetings"), {
      ...meetingData,
      creatorId: creatorId,
      createdAt: serverTimestamp(),
    });
    revalidatePath('/dashboard');
    return { success: true, message: "Meeting created successfully." };
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { success: false, message: "Failed to create meeting." };
  }
}

export async function updateMeeting(meetingId: string, meetingData: MeetingData) {
    if (!db) throw new Error("Firestore is not initialized.");
    try {
        const meetingRef = doc(db, "meetings", meetingId);
        await updateDoc(meetingRef, {
            ...meetingData,
        });
        revalidatePath('/dashboard');
        return { success: true, message: "Meeting updated successfully." };
    } catch (error) {
        console.error("Error updating meeting:", error);
        return { success: false, message: "Failed to update meeting." };
    }
}

export async function deleteMeeting(meetingId: string) {
    if (!db) throw new Error("Firestore is not initialized.");
    try {
        await deleteDoc(doc(db, "meetings", meetingId));
        revalidatePath('/dashboard');
        return { success: true, message: "Meeting deleted successfully." };
    } catch (error) {
        console.error("Error deleting meeting:", error);
        return { success: false, message: "Failed to delete meeting." };
    }
}
