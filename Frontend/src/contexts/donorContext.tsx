import React, { createContext, useContext, useState } from "react";
import axios from "axios";

interface DonorStats {
    totalDonations: number;
    pendingDonations: number;
    completedDonations: number;
}

interface DonorContextType {
  stats: DonorStats;
  getDonorStats: () => void;
}

const DonorContext = createContext<DonorContextType | undefined>(undefined);

export function useDonorContext() {
  const context = useContext(DonorContext);
  if (!context) {
    throw new Error("useDonorContext must be used within DonorProvider");
  }
  return context;
}

export function DonorProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<DonorStats>({
    totalDonations: 0,
    pendingDonations: 0,
    completedDonations: 0,
  });

  async function getDonorStats() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/stats`
      );

      const {
        totalDonations,
        pendingDonations,
        completedDonations,
      } = response.data;

      setStats({
        totalDonations,
        pendingDonations,
        completedDonations
      });
    } catch (error) {
      console.error("Failed to fetch donor stats:", error);
    }
  }

  return (
    <DonorContext.Provider value={{ stats, getDonorStats }}>
      {children}
    </DonorContext.Provider>
  );
}
