import React, { createContext, useContext, useState } from "react";
import axios from "axios";

interface DonorStats {
  totalDonationCount: number;
  pendingPickups: number;
  completedPickups: number;
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
    totalDonationCount: 0,
    pendingPickups: 0,
    completedPickups: 0,
  });

  async function getDonorStats() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/stats`
      );

      const {
        totalDonationCount,
        pendingPickups,
        completedPickups,
      } = response.data;

      setStats({
        totalDonationCount,
        pendingPickups,
        completedPickups,
      });
    } catch (error) {
      // @ts-expect-error Error Type Unknown
      throw new Error(error?.message || "Something went wrong");
    }
  }

  return (
    <DonorContext.Provider value={{ stats, getDonorStats }}>
      {children}
    </DonorContext.Provider>
  );
}
