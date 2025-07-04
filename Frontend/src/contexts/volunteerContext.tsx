/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import axios from "axios";

interface VolunteerStats {
  available_Task: number;
  in_progress_task: number;
  Completed_task: number;
}

interface Task {
  _id: string;
  title: string;
  type: string;
  from_location: string;
  to_location: string;
  pickup_location: string;
  status: "available" | "assigned" | "in_progress" | "completed" ;
  pickup_window_start: string;
  pickup_window_end: string;
  ngoId: { organization_name: string };
  contact_number: number,
  donorId: { name: string; email: string };
  feedback?: { rating: number; feedback: string };
}

interface Notification {
  _id: string;
  message: string;
  taskId: string;
  read: boolean;
  createdAt: string;
}

interface VolunteerContextType {
  stats: VolunteerStats;
  volunteerTasks: Task[];
  notifications: Notification[];
  loading: { stats: boolean; tasks: boolean; updating: boolean; notifications: boolean };
  error: string | null;
  getVolunteerStats: (silent?: boolean) => Promise<void>;
  getVolunteerTasks: (silent?: boolean) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>;
  getNotifications: (silent?: boolean) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export function useVolunteerContext() {
  const context = useContext(VolunteerContext);
  if (!context) {
    throw new Error("useVolunteerContext must be used within the VolunteerProvider");
  }
  return context;
}

export function VolunteerProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<VolunteerStats>({
    available_Task: 0,
    in_progress_task: 0,
    Completed_task: 0,
  });
  const [volunteerTasks, setVolunteerTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState({
    stats: false,
    tasks: false,
    updating: false,
    notifications: false,
  });
  const [error, setError] = useState<string | null>(null);
  const requestInProgress = useRef({ 
    stats: false, 
    tasks: false, 
    updating: false, 
    notifications: false 
  });

  // Track if initial data has been loaded
  const [hasInitialData, setHasInitialData] = useState({
    stats: false,
    tasks: false,
    notifications: false,
  });

  const getVolunteerStats = useCallback(async (silent = false) => {
    if (requestInProgress.current.stats) return;
    requestInProgress.current.stats = true;

    // Only show loading on initial fetch or explicit non-silent calls
    const shouldShowLoading = !silent && !hasInitialData.stats;
    
    if (shouldShowLoading) {
      setLoading((prev) => ({ ...prev, stats: true }));
    }
    
    // Only clear error on non-silent calls
    if (!silent) {
      setError(null);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/volunteer/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setStats({
        available_Task: response.data.available_Task || 0,
        in_progress_task: response.data.in_progress_task || 0,
        Completed_task: response.data.Completed_task || 0,
      });

      // Mark as having initial data
      if (!hasInitialData.stats) {
        setHasInitialData(prev => ({ ...prev, stats: true }));
      }

    } catch (error: any) {
      console.error("Error fetching stats:", error);
      // Only set error on non-silent calls to avoid disrupting UI
      if (!silent) {
        setError(error.message || "Failed to fetch stats");
      }
    } finally {
      if (shouldShowLoading) {
        setLoading((prev) => ({ ...prev, stats: false }));
      }
      requestInProgress.current.stats = false;
    }
  }, [hasInitialData.stats]);

  const getVolunteerTasks = useCallback(async (silent = false) => {
    if (requestInProgress.current.tasks) return;
    requestInProgress.current.tasks = true;

    const shouldShowLoading = !silent && !hasInitialData.tasks;
    
    if (shouldShowLoading) {
      setLoading((prev) => ({ ...prev, tasks: true }));
    }

    if (!silent) {
      setError(null);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/volunteer/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setVolunteerTasks(response.data || []);

      if (!hasInitialData.tasks) {
        setHasInitialData(prev => ({ ...prev, tasks: true }));
      }

    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      if (!silent) {
        setError(error.message || "Failed to fetch tasks");
      }
    } finally {
      if (shouldShowLoading) {
        setLoading((prev) => ({ ...prev, tasks: false }));
      }
      requestInProgress.current.tasks = false;
    }
  }, [hasInitialData.tasks]);

  const getNotifications = useCallback(async (silent = false) => {
    if (requestInProgress.current.notifications) return;
    requestInProgress.current.notifications = true;

    const shouldShowLoading = !silent && !hasInitialData.notifications;
    
    if (shouldShowLoading) {
      setLoading((prev) => ({ ...prev, notifications: true }));
    }

    if (!silent) {
      setError(null);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/volunteer/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(response.data || []);

      if (!hasInitialData.notifications) {
        setHasInitialData(prev => ({ ...prev, notifications: true }));
      }

    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      if (!silent) {
        setError(error.message || "Failed to fetch notifications");
      }
    } finally {
      if (shouldShowLoading) {
        setLoading((prev) => ({ ...prev, notifications: false }));
      }
      requestInProgress.current.notifications = false;
    }
  }, [hasInitialData.notifications]);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task["status"]) => {
    if (requestInProgress.current.updating) return;
    requestInProgress.current.updating = true;
    setLoading((prev) => ({ ...prev, updating: true }));
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      // console.log("Updating task:", { taskId, status });
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/volunteer/tasks/${taskId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // console.log("Update Status Response:", response.data);
      
      // Refresh tasks silently after update
      await getVolunteerTasks(true);
      await getVolunteerStats(true);
      
    } catch (error: any) {
      console.error("Error updating task status:", error);
      throw new Error(error.response?.data?.message || "Failed to update task status");
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
      requestInProgress.current.updating = false;
    }
  }, [getVolunteerTasks, getVolunteerStats]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/volunteer/notifications/${notificationId}/read`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state immediately for better UX
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      // Silently fail for better UX - don't show error for this action
      console.warn("Failed to mark notification as read, but continuing...");
    }
  }, []);

  return (
    <VolunteerContext.Provider
      value={{
        stats,
        volunteerTasks,
        notifications,
        loading,
        error,
        getVolunteerStats,
        getVolunteerTasks,
        updateTaskStatus,
        getNotifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </VolunteerContext.Provider>
  );
}