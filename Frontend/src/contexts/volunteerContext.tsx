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
  status: "available" | "assigned" | "in_progress" | "completed" | "cancelled";
  pickup_window_start: string;
  pickup_window_end: string;
  ngoId: { organization_name: string };
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
  getVolunteerStats: () => Promise<void>;
  getVolunteerTasks: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>;
  getNotifications: () => Promise<void>;
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
  const requestInProgress = useRef({ stats: false, tasks: false, updating: false, notifications: false });

  const getVolunteerStats = useCallback(async () => {
    if (requestInProgress.current.stats) return;
    requestInProgress.current.stats = true;
    setLoading((prev) => ({ ...prev, stats: true }));
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/volunteer/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Stats Response:", response.data);
      setStats({
        available_Task: response.data.available_Task || 0,
        in_progress_task: response.data.in_progress_task || 0,
        Completed_task: response.data.Completed_task || 0,
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      setError(error.message || "Failed to fetch stats");
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
      requestInProgress.current.stats = false;
    }
  }, []);

  const getVolunteerTasks = useCallback(async () => {
    if (requestInProgress.current.tasks) return;
    requestInProgress.current.tasks = true;
    setLoading((prev) => ({ ...prev, tasks: true }));
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/volunteer/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Tasks Response:", response.data);
      setVolunteerTasks(response.data || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setError(error.message || "Failed to fetch tasks");
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
      requestInProgress.current.tasks = false;
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task["status"]) => {
    if (requestInProgress.current.updating) return;
    requestInProgress.current.updating = true;
    setLoading((prev) => ({ ...prev, updating: true }));
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      console.log("Updating task:", { taskId, status });
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/volunteer/tasks/${taskId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Update Status Response:", response.data);
      await getVolunteerTasks(); // Refresh tasks after update
    } catch (error: any) {
      console.error("Error updating task status:", error);
      throw new Error(error.response?.data?.message || "Failed to update task status");
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
      requestInProgress.current.updating = false;
    }
  }, [getVolunteerTasks]);

  const getNotifications = useCallback(async () => {
    if (requestInProgress.current.notifications) return;
    requestInProgress.current.notifications = true;
    setLoading((prev) => ({ ...prev, notifications: true }));
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/volunteer/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setError(error.message || "Failed to fetch notifications");
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }));
      requestInProgress.current.notifications = false;
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/volunteer/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      setError(error.message || "Failed to mark notification as read");
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