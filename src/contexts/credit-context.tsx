"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserId } from "@/utils/local-storage";

export interface CreditContextType {
  credits: number | null;
  isLoading: boolean;
  fetchCredits: () => Promise<void>;
  userId: string | null;
}

export const CreditContext = createContext<CreditContextType | null>(null);

export function useCreditContext() {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCreditContext must be used within a CreditProvider");
  }
  return context;
}

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/credit/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credit);
      } else {
        console.error("Failed to fetch credits");
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };

    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCredits();
    }
  }, [userId, fetchCredits]);

  return (
    <CreditContext.Provider
      value={{ credits, isLoading, fetchCredits, userId }}
    >
      {children}
    </CreditContext.Provider>
  );
}
