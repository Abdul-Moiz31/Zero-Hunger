import React, { createContext, useContext, useState } from "react";
import axios from "axios";

interface NGOStats {
  Volunteers: number;
  total_donations: number;
  completedDonations: number;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  completedDonationsCount: number;
}

interface Food {
  _id: string;
  name: string;
  status: string;
  acceptance_time: string;
  // Add other food properties as needed
}

interface NGOContextType {
  stats: NGOStats;
  volunteers: Volunteer[];
  claimedFoods: Food[];
  getNGOStats: () => Promise<void>;
  getVolunteers: () => Promise<void>;
  getClaimedFoods: () => Promise<void>;
  assignVolunteerToFood: (volunteerId: string, foodId: string) => Promise<void>;
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
  
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [claimedFoods, setClaimedFoods] = useState<Food[]>([]);

  async function getNGOStats() {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      const {
        totalVolunteers,
        totalCompletedDonations,
        totalPendingDonations,
      } = response.data;
      
      setStats({
        Volunteers: totalVolunteers,
        total_donations: totalCompletedDonations,
        completedDonations: totalPendingDonations,
      });
    } catch (error) {
      console.error("Failed to fetch NGO stats:", error);
    }
  }

  async function getVolunteers() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo/volunteers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setVolunteers(response.data);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    }
  }

  async function getClaimedFoods() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo/claimed/foods`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setClaimedFoods(response.data.data);
    } catch (error) {
      console.error("Failed to fetch claimed foods:", error);
    }
  }

  async function assignVolunteerToFood(
    volunteerId: string,
    foodId: string
  ) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/ngo/assign/volunteer`,
        { volunteerId, foodId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("Volunteer assigned successfully:", response.data);
    } catch (error) {
      console.error("Failed to assign volunteer:", error);
    }
  }

  return (
    <NGOContext.Provider value={{ stats, volunteers, claimedFoods, getNGOStats, getVolunteers, getClaimedFoods,assignVolunteerToFood }}>
      {children}
    </NGOContext.Provider>
  );
}