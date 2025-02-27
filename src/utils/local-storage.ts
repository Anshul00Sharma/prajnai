export interface Subject {
  id: string;
  name: string | undefined;
  createdAt: string;
}

const SUBJECTS_KEY = "subjects";
const USER_ID_KEY = "userId";

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

export function getUserId(): string {
  if (typeof window === "undefined") return "";
  
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function hasUserId(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(USER_ID_KEY);
}
