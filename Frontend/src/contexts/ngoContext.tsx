import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface NGOStats {
  totalVolunteers: number;
  total_donations: number;
  pendingDonations: number;
}
interface Notification {
  _id: string;
  message: string;
  taskId: string;
  read: boolean;
  createdAt: string;
}

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  contact_number: string;
  address: string;
  role: string;
  organization_name: string;
  status: "Active" | "Inactive";
  completedOrders: number;
  joinedDate: string;
  ngoId: string;
  isApproved: boolean;
}

interface Food {
  _id: string;
  name: string;
  status: string;
  acceptance_time: string;
  volunteerId?: string;
}

interface NGOContextType {
  stats: NGOStats;
  volunteers: Volunteer[];
  claimedFoods: Food[];
  notifications: Notification[];
  getNGOStats: () => Promise<void>;
  getVolunteers: () => Promise<void>;
  getClaimedFoods: () => Promise<void>;
  assignVolunteerToFood: (volunteerId: string, foodId: string) => Promise<void>;
  deleteVolunteer: (id: string) => Promise<void>;
  updateVolunteer: (id: string, data: { name: string; email: string; contact_number: string }) => Promise<void>;
  addVolunteer: (data: { name: string; email: string; contact_number: string }) => Promise<void>;
  updateFoodStatus: (foodId: string, status: string) => Promise<void>;
  deleteClaimedFood: (foodId: string) => Promise<void>;
  getNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const NGOContext = createContext<NGOContextType | undefined>(undefined);

export function useNGOContext() {
  const context = useContext(NGOContext);
  if (!context) {
    throw new Error("useNGOContext must be used within NGOProvider");
  }
  return context;
}

export function NGOProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<NGOStats>({
  totalVolunteers: 0,
    total_donations: 0,
    pendingDonations: 0,
  });

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [claimedFoods, setClaimedFoods] = useState<Food[]>([]);

  async function getNGOStats() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/ngo/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { totalVolunteers, totalCompletedDonations, totalPendingDonations } = response.data;

      setStats({
        totalVolunteers: totalVolunteers,
        total_donations: totalCompletedDonations + totalPendingDonations,
        pendingDonations: totalPendingDonations,
      });
    } catch (error) {
      console.error("Failed to fetch NGO stats:", error);
    }
  }
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function getNotifications() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/ngo/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch NGO notifications:", error);
    }
  }

  async function markNotificationAsRead(notificationId: string) {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/ngo/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark NGO notification as read:", error);
    }
  }

  async function getVolunteers() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/ngo/volunteers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setVolunteers(response.data);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    }
  }

  async function getClaimedFoods() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/ngo/claimed/foods`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setClaimedFoods(response.data.data);
    } catch (error) {
      console.error("Failed to fetch claimed foods:", error);
    }
  }

  async function assignVolunteerToFood(volunteerId: string, foodId: string) {
    try {
      const token = localStorage.getItem("token");
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
      setClaimedFoods((prev) =>
        prev.map((food) => (food._id === foodId ? { ...food, volunteerId } : food))
      );
    } catch (error) {
      console.error("Failed to assign volunteer:", error);
      throw error;
    }
  }

  async function deleteVolunteer(id: string) {
    try {
      const token = localStorage.getItem("token");
      console.log("Deleting volunteer with ID:", id);
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/ngo/volunteers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("Delete response:", response.data);
      setVolunteers((prev) => prev.filter((vol) => vol._id !== id));
    } catch (error: any) {
      console.error("Failed to delete volunteer:", error.response?.data || error.message);
      throw error;
    }
  }

  async function updateVolunteer(id: string, data: { name: string; email: string; contact_number: string }) {
    try {
      const token = localStorage.getItem("token");
      console.log("Updating volunteer with ID:", id, "Data:", data);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/ngo/volunteers/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("Update response:", response.data);
      setVolunteers((prev) =>
        prev.map((vol) => (vol._id === id ? { ...vol, ...data } : vol))
      );
    } catch (error: any) {
      console.error("Failed to update volunteer:", error.response?.data || error.message);
      throw error;
    }
  }

  async function addVolunteer(data: { name: string; email: string; contact_number: string }) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/ngo/volunteers`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setVolunteers((prev) => [...prev, response.data]);
    } catch (error: any) {
      console.error("Failed to add volunteer:", error.response?.data || error.message);
      throw error;
    }
  }

const updateFoodStatus = async (foodId: string, status: string) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/ngo/food/${foodId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  );
  await getClaimedFoods();
};
const deleteClaimedFood = async (foodId: string) => {
  const token = localStorage.getItem("token");
  await axios.delete(
    `${import.meta.env.VITE_API_BASE_URL}/ngo/claimed-food/${foodId}`,
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  );
  await getClaimedFoods();
};

  return (
    <NGOContext.Provider
      value={{
        stats,
        volunteers,
        claimedFoods,
        notifications,
        getNGOStats,
        getVolunteers,
        getClaimedFoods,
        assignVolunteerToFood,
        deleteVolunteer,
        updateVolunteer,
        addVolunteer,
        updateFoodStatus,
        deleteClaimedFood,
        getNotifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </NGOContext.Provider>
  );
}