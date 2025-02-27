"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Subject {
  // You may want to define the properties of the Subject interface
  // For example:
  id: string;
  name: string;
}

interface SubjectContextType {
  currentSubjectId: string | null;
  setCurrentSubjectId: (id: string) => void;
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectProvider({ children }: { children: ReactNode }) {
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  return (
    <SubjectContext.Provider
      value={{ currentSubjectId, setCurrentSubjectId, subjects, setSubjects }}
    >
      {children}
    </SubjectContext.Provider>
  );
}

export function useSubject() {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error("useSubject must be used within a SubjectProvider");
  }
  return context;
}
