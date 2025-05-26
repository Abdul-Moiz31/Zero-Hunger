"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";



export interface Notification {
  _id: string;
  recipientId: string;
  message: string;
  taskId: { _id: string; title: string }; // Updated taskId to reflect populated object
  read: boolean; // Added createdAt
  createdAt: string;
}

export interface Donation {
  _id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  status: "available" | "assigned" | "completed" ;
  temperature_requirements?: string;
  dietary_info?: string;
  img?: string;
  pickup_location?: string;
  createdAt?: string; 
}

interface DonorStats {
  totalDonations: number;
  pendingDonations: number;
  completedDonations: number;
}

interface DonorContextType {
  stats: DonorStats;
  donations: Donation[];
  notifications: Notification[];
  getDonorStats: () => Promise<void>;
  setDonations: React.Dispatch<React.SetStateAction<Donation[]>>;
  getMyDonations: () => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  updateDonationStatus: (id: string, status: string, ngoId?: string) => Promise<void>;
  getNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
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

  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
  };

  async function getDonorStats() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/stats`,
        getAuthHeaders()
      );
      const { totalDonations, pendingDonations, completedDonations } = response.data;
      setStats({ totalDonations, pendingDonations, completedDonations });
    } catch (error: any) {
      console.error("Failed to fetch donor stats:", error);
      toast.error("Failed to fetch donor stats");
    }
  }

  async function getMyDonations() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/my-donations`,
        getAuthHeaders()
      );
      setDonations(response.data);
    } catch (error: any) {
      console.error("Failed to fetch donations:", error);
      toast.error("Failed to fetch donations");
    }
  }

  async function deleteDonation(id: string) {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/donor/donate/${id}`,
        getAuthHeaders()
      );
      await getMyDonations();
      toast.success("Donation deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete donation:", error);
      toast.error("Failed to delete donation");
    }
  }

  async function updateDonationStatus(id: string, status: string, ngoId?: string) {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/donor/donation/${id}/status`,
        { status, ngoId },
        getAuthHeaders()
      );
      await getMyDonations();
      toast.success("Donation status updated");
    } catch (error: any) {
      console.error("Failed to update donation status:", error);
      toast.error("Failed to update donation status");
    }
  }

  async function getNotifications() {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user._id) {
        console.error("No user ID found in localStorage");
        toast.error("User not logged in. Please log in again");
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/Notifications`,
        getAuthHeaders()
      );
      setNotifications(response.data);
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to fetch notifications");
    }
  }

  async function markNotificationAsRead(id: string) {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/donor/notifications/${id}/read`, 
        {},
        getAuthHeaders()
      );
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
      );
      toast.success("Notification marked as read");
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  }

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getDonorStats(), getMyDonations(), getNotifications()]);
      } catch (error) {
        console.error("Error in initial data fetch:", error);
      }
    };
    fetchData();
  }, []);

  // Polling for notifications
  useEffect(() => {
    const interval = setInterval(() => {
      getNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DonorContext.Provider
      value={{
        stats,
        donations,
        notifications,
        getDonorStats,
        setDonations,
        getMyDonations,
        deleteDonation,
        updateDonationStatus,
        getNotifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </DonorContext.Provider>
  );
}