export interface Subject {
  id: string;
  name: string | undefined;
  createdAt: string;
}

import { supabase } from "@/lib/supabase";

const SUBJECTS_KEY = "subjects";

export function getSubjects(): Subject[] {
  if (typeof window === "undefined") return [];
  
  const subjects = localStorage.getItem(SUBJECTS_KEY);
  return subjects ? JSON.parse(subjects) : [];
}

export function saveSubject(name?: string): string {
  if (typeof window === "undefined") return "" ;

  const subjects = getSubjects();
  const newSubject = {
    id: crypto.randomUUID(),
    name: name?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  subjects.push(newSubject);
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  return newSubject.id;
}

export function getSubjectName(id: string | null): string | undefined {
  if (typeof window === "undefined" || id === null) return undefined;
  
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === id);
  return subject?.name;
}

export async function getUserId(): Promise<string> {
  if (typeof window === "undefined") return "";
  
  try {
    // Get the current user session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // Return the user ID if session exists
    if (session?.user?.id) {
      return session.user.id;
    }
    
    // If no session, return empty string
    return "";
  } catch (error) {
    console.error("Error getting user ID from Supabase:", error);
    return "";
  }
}

export async function hasUserId(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  try {
    // Get the current user session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // Return true if session exists and has a user ID
    return !!session?.user?.id;
  } catch (error) {
    console.error("Error checking user ID from Supabase:", error);
    return false;
  }
}
