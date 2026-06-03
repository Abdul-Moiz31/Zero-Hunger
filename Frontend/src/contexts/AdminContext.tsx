/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

// Define types for better type safety
interface Stats {
  ngoCount: number;
  donorCount: number;
  volunteerCount: number;
  donationCount: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "donor" | "ngo" | "volunteer";
  isApproved?: boolean;
  createdAt: string;
}

interface FoodDonation {
  _id: string;
  donorName: string;
  ngoName: string;
  volunteerName: string;
  title: string;
  quantity: number;
  unit: string;
  pickup_location: string;
  createdAt: string;
}

interface AdminContextType {
  stats: Stats;
  users: User[];
  foodDonations: FoodDonation[];
  getDashboardStats: () => Promise<void>;
  updateUserStatus: (data: { userId: string; status: boolean }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getFoodDonations: () => Promise<void>;
  deleteFoodDonation: (donationId: string) => Promise<void>;
  saveSettings: (settings: any) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider");
  }
  return context;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>({
    ngoCount: 0,
    donorCount: 0,
    volunteerCount: 0,
    donationCount: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [foodDonations, setFoodDonations] = useState<FoodDonation[]>([]);

  async function getDashboardStats() {
    try {
      const response = await api.get(`/admin/dashboard-stats`);
      const { users, donorCount, ngoCount, volunteerCount, donationCount } = response.data;
      setUsers(Array.isArray(users) ? users : []);
      setStats({
        ngoCount: ngoCount ?? 0,
        donorCount: donorCount ?? 0,
        volunteerCount: volunteerCount ?? 0,
        donationCount: donationCount ?? 0,
      });
    } catch (error: any) {
      console.error("getDashboardStats error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch dashboard stats");
    }
  }

  async function updateUserStatus(data: { userId: string; status: boolean }) {
    if (!data.status) return; // Only allow approval
    try {
      await api.put(`/admin/user-status/update`, {
        userId: data.userId,
        status: true,
      });
      await getDashboardStats(); // Refresh data
    } catch (error: any) {
      console.error("updateUserStatus error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update user status");
    }
  }

  async function deleteUser(userId: string) {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.warning("Deleted successfully");
      await getDashboardStats(); // Refresh data
    } catch (error: any) {
      console.error("deleteUser error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete user");
    }
  }

  async function getFoodDonations() {
    try {
      const response = await api.get(`/admin/food-donations`);
      setFoodDonations(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("getFoodDonations error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch food donations");
    }
  }

  async function deleteFoodDonation(donationId: string) {
    try {
      await api.delete(`/admin/food-donations/${donationId}`);
      toast.warning("Deleted successfully");
      await getFoodDonations(); // Refresh data
    } catch (error: any) {
      console.error("deleteFoodDonation error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete food donation");
    }
  }

  async function saveSettings(settings: any) {
    try {
      // Placeholder: Add backend API endpoint to save settings
      await api.put(`/admin/settings`, settings);
    } catch (error: any) {
      console.error("saveSettings error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to save settings");
    }
  }

  return (
    <AdminContext.Provider
      value={{
        stats,
        users,
        foodDonations,
        getDashboardStats,
        updateUserStatus,
        deleteUser,
        getFoodDonations,
        deleteFoodDonation,
        saveSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}