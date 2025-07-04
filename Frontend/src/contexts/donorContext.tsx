/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export interface Notification {
  _id: string;
  recipientId: string;
  message: string;
  taskId: { _id: string; title: string };
  read: boolean;
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
  status: "available" | "assigned" | "completed";
  temperature_requirements?: string;
  contact_number: string;
  dietary_info?: string;
  img?: string;
  pickup_location?: string;
  createdAt?: string;
}

export interface DonorStats {
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
  const [isFetching, setIsFetching] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
  };

  const getDonorStats = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/stats`,
        getAuthHeaders()
      );
      const { totalDonations, pendingDonations, completedDonations } = response.data;
      setStats({ totalDonations, pendingDonations, completedDonations });
    } catch (error: any) {
      console.error("Failed to fetch donor stats:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch donor stats";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getMyDonations = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/my-donations`,
        getAuthHeaders()
      );
      setDonations(response.data);
    } catch (error: any) {
      console.error("Failed to fetch donations:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch donations";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteDonation = useCallback(async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/donor/donate/${id}`,
        getAuthHeaders()
      );
      await getMyDonations();
      toast.success("Donation deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete donation:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete donation";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getMyDonations]);

  const updateDonationStatus = useCallback(async (id: string, status: string, ngoId?: string) => {
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
      const errorMessage = error.response?.data?.message || "Failed to update donation status";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getMyDonations]);

  const getNotifications = useCallback(async () => {
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
      const errorMessage = error.response?.data?.message || "Failed to fetch notifications";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
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
      const errorMessage = error.response?.data?.message || "Failed to mark notification as read";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Initial fetch with loading state
  useEffect(() => {
    const fetchData = async () => {
      if (isFetching) return;
      setIsFetching(true);
      try {
        await Promise.all([getDonorStats(), getMyDonations(), getNotifications()]);
      } catch (error: any) {
        console.error("Error in initial data fetch:", error);
        toast.error(error.message || "Failed to load initial data");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [getDonorStats, getMyDonations, getNotifications]);

  // Polling for notifications
  useEffect(() => {
    const interval = setInterval(() => {
      getNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [getNotifications]);

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