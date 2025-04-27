// src/contexts/ngoContext.tsx
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

interface NGOStats {
  Volunteers: number;
  total_donations: number;
  completedDonations: number;
}

interface NGOContextType {
  stats: NGOStats;
  getNGOStats: () => void;
}

const NGOContext = createContext<NGOContextType | undefined>(undefined);

export function useNGOContext() {
  const context = useContext(NGOContext);
  if (!context)
    throw new Error("useNGOContext must be used within NGOProvider");
  return context;
}

export function NGOProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<NGOStats>({
    Volunteers: 0,
    total_donations: 0,
    completedDonations: 0,
  });

  async function getNGOStats() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo/stats`
      );
      const {
        Volunteers,
        total_donations,
        completedDonations,
      } = response.data;

      setStats({
        Volunteers,
        total_donations,
        completedDonations
      });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch NGO stats:", error);
    }
  }

  return (
    <NGOContext.Provider value={{ stats, getNGOStats }}>
      {children}
    </NGOContext.Provider>
  );
}
