/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from 'react';
import api from '@/utils/axios';
import toast from 'react-hot-toast';

interface NGOStats {
  totalVolunteers: number;
  total_donations: number;
  pendingDonations: number;
}
interface Notification {
  _id: string;
  message: string;
  taskId: string;
  type?: string;
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
  status: 'Active' | 'Inactive';
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
  contact_number: string;
}

export interface InventoryDelivery {
  _id: string;
  title: string;
  quantity: number;
  unit: string;
  dietary_info?: string;
  delivered_time?: string;
  donorId?: { name: string };
  volunteerId?: { name: string };
}

export interface InventoryData {
  totalMeals: number;
  totalDeliveries: number;
  categories: { name: string; count: number }[];
  deliveries: InventoryDelivery[];
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
  confirmDelivery: (foodId: string) => Promise<void>;
  getInventory: (days?: number) => Promise<InventoryData>;
  getNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const NGOContext = createContext<NGOContextType | undefined>(undefined);

export function useNGOContext() {
  const context = useContext(NGOContext);
  if (!context) {
    throw new Error('useNGOContext must be used within NGOProvider');
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function getNGOStats() {
    try {
      const { data } = await api.get('/ngo/stats');
      setStats({
        totalVolunteers: data.totalVolunteers,
        total_donations: data.totalCompletedDonations + data.totalPendingDonations,
        pendingDonations: data.totalPendingDonations,
      });
    } catch (error) {
      console.error('Failed to fetch NGO stats:', error);
    }
  }

  async function getNotifications() {
    try {
      const { data } = await api.get('/ngo/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch NGO notifications:', error);
    }
  }

  async function markNotificationAsRead(notificationId: string) {
    try {
      await api.patch(`/ngo/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark NGO notification as read:', error);
    }
  }

  async function getVolunteers() {
    try {
      const { data } = await api.get('/ngo/volunteers');
      setVolunteers(data);
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    }
  }

  async function getClaimedFoods() {
    try {
      const { data } = await api.get('/ngo/claimed/foods');
      setClaimedFoods(data.data);
    } catch (error) {
      console.error('Failed to fetch claimed foods:', error);
    }
  }

  async function assignVolunteerToFood(volunteerId: string, foodId: string) {
    try {
      await api.post('/ngo/assign-volunteer', { volunteerId, foodId });
      setClaimedFoods((prev) =>
        prev.map((food) => (food._id === foodId ? { ...food, volunteerId } : food))
      );
      toast.success('Volunteer assigned successfully');
    } catch (error) {
      console.error('Failed to assign volunteer:', error);
      throw error;
    }
  }

  async function deleteVolunteer(id: string) {
    try {
      await api.delete(`/ngo/volunteers/${id}`);
      setVolunteers((prev) => prev.filter((vol) => vol._id !== id));
      toast.success('Volunteer removed');
    } catch (error: any) {
      console.error('Failed to delete volunteer:', error.response?.data || error.message);
      throw error;
    }
  }

  async function updateVolunteer(
    id: string,
    data: { name: string; email: string; contact_number: string }
  ) {
    try {
      await api.put(`/ngo/volunteers/${id}`, data);
      setVolunteers((prev) => prev.map((vol) => (vol._id === id ? { ...vol, ...data } : vol)));
      toast.success('Volunteer updated');
    } catch (error: any) {
      console.error('Failed to update volunteer:', error.response?.data || error.message);
      throw error;
    }
  }

  async function addVolunteer(data: { name: string; email: string; contact_number: string }) {
    try {
      const { data: created } = await api.post('/ngo/volunteers', data);
      setVolunteers((prev) => [...prev, created]);
      toast.success('Volunteer added — login details emailed');
    } catch (error: any) {
      console.error('Failed to add volunteer:', error.response?.data || error.message);
      throw error;
    }
  }

  const updateFoodStatus = async (foodId: string, status: string) => {
    await api.patch(`/ngo/food/${foodId}/status`, { status });
    await getClaimedFoods();
  };

  const deleteClaimedFood = async (foodId: string) => {
    await api.delete(`/ngo/claimed-food/${foodId}`);
    await getClaimedFoods();
  };

  const confirmDelivery = async (foodId: string) => {
    await api.patch(`/ngo/food/${foodId}/confirm-delivery`);
    await getClaimedFoods();
  };

  const getInventory = async (days = 30): Promise<InventoryData> => {
    const { data } = await api.get(`/ngo/inventory?days=${days}`);
    return data;
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
        confirmDelivery,
        getInventory,
        getNotifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </NGOContext.Provider>
  );
}
