/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

// Axios interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface AdminContextType {
  stats: {
    ngoCount: number;
    donorCount: number;
    volunteerCount: number;
    donationCount: number;
  };
  users: any[];
  foodDonations: any[];
  getDashboardStats: () => void;
  updateUserStatus: (data: any) => void;
  deleteUser: (userId: string) => void;
  getFoodDonations: () => void;
  deleteFoodDonation: (donationId: string) => void;
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
  const [stats, setStats] = useState({
    ngoCount: 0,
    donorCount: 0,
    volunteerCount: 0,
    donationCount: 0
  });

  const [users, setUsers] = useState([]);
  const [foodDonations, setFoodDonations] = useState([]);

  async function getDashboardStats() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-stats`
      );
      const { users, donorCount, ngoCount, volunteerCount , donationCount } = response.data;

      setUsers(users);
      setStats({
        ngoCount,
        donorCount,
        volunteerCount,
        donationCount
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async function updateUserStatus(data: any) {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/admin/user-status/update`,
        {
          userId: data.userId,
          status: data.status,
        }
      );
      getDashboardStats();
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async function deleteUser(userId: string) {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users/${userId}`
      );
      getDashboardStats();
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async function getFoodDonations() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/food-donations`
      );
      setFoodDonations(response.data);
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async function deleteFoodDonation(donationId: string) {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/admin/food-donations/${donationId}`
      );
      getFoodDonations();
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
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
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}