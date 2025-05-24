import React, { useState, useEffect, useCallback } from "react";
import { useVolunteerContext } from "@/contexts/volunteerContext";
import { Package2, Route, CheckCircle, Star, ChevronDown, X, Bell } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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

const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "contributions">("dashboard");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const {
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
  } = useVolunteerContext();

 const fetchData = useCallback(async () => {
    try {
      await Promise.all([getVolunteerStats(), getVolunteerTasks(), getNotifications()]);
      setHasFetched(true);
    } catch (err) {
      console.error("Initial data fetch failed:", err);
    }
  }, [getVolunteerStats, getVolunteerTasks, getNotifications]);

  // Initial fetch on mount
  useEffect(() => {
    if (!hasFetched) {
      fetchData();
    }
  }, [fetchData, hasFetched]);

  // Polling for tasks and notifications every 5 seconds without showing loading
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await Promise.all([getVolunteerTasks(), getNotifications()]);
      } catch (err) {
        console.error("Polling fetch failed:", err);
      }
    }, 10000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [getVolunteerTasks, getNotifications]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.some((n) => !n.read)) {
      notifications.filter((n) => !n.read).forEach((n) => markNotificationAsRead(n._id));
    }
  };

const handleUpdateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    if (!taskId) {
      toast.error("No task selected");
      return;
    }
    console.log("Sending status update:", { taskId, newStatus });
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success(`Task status updated to ${newStatus.replace("_", " ")}`);
      setSelectedTask(null);
      setShowStatusModal(false);
      // Fetch updated tasks immediately after status update
      await getVolunteerTasks();
    } catch (error: any) {
      console.error("Status update failed:", error);
      toast.error(error.message || "Failed to update task status");
    }
  };

  const StatusModal = () => {
    if (!selectedTask) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Update Status</h3>
            <button
              onClick={() => {
                setShowStatusModal(false);
                setSelectedTask(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {["available", "in_progress", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => handleUpdateTaskStatus(selectedTask._id, status as Task["status"])}
                disabled={loading.updating}
                className={`w-full text-left py-2 px-4 rounded-lg transition ${
                  selectedTask.status === status
                    ? "bg-green-600 text-white"
                    : loading.updating
                    ? "bg-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

   const Overview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card
        icon={<Package2 className="w-6 h-6 text-green-600" />}
        title="Available Tasks"
        value={loading.stats ? "Loading..." : stats.available_Task}
      />
      <Card
        icon={<Route className="w-6 h-6 text-blue-600" />}
        title="In Progress"
        value={loading.stats ? "Loading..." : stats.in_progress_task}
      />
      <Card
        icon={<CheckCircle className="w-6 h-6 text-gray-600" />}
        title="Completed Today"
        value={loading.stats ? "Loading..." : stats.Completed_task}
      />
    </div>
  );

   const TasksTable = () => (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      {loading.tasks ? (
        <p className="text-center text-gray-500">Loading tasks...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="pb-3">Title</th>
                <th>From</th>
                <th>To</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {volunteerTasks.length > 0 ? (
                volunteerTasks.map((task: Task) => (
                  <tr key={task._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{task.title || "N/A"}</td>
                    <td>{task.ngoId?.organization_name || "N/A"}</td>
                    <td>{task.pickup_location || task.to_location || "N/A"}</td>
                    <td>
                      {new Date(task.pickup_window_start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(task.pickup_window_end).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <Badge status={task.status} />
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowStatusModal(true);
                        }}
                        className="flex items-center text-blue-600 hover:underline"
                        disabled={loading.updating}
                      >
                        Update <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No tasks found. {error ? "Please check the error above." : "Try refreshing the page."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const Contributions = () => {
    const completedTasks = volunteerTasks.filter((t) => t.status === "completed");
    const averageRating = completedTasks.length * 0.5;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Contributions</h2>
          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Tasks" value={volunteerTasks.length} />
            <Stat label="Completed Tasks" value={completedTasks.length} />
            <Stat
              label="Average Rating"
              value={averageRating.toFixed(1)}
              icon={<Star className="text-yellow-400 w-5 h-5" />}
            />
            <Stat label="Hours Contributed" value={0} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
          {loading.tasks ? (
            <p className="text-center text-gray-500">Loading tasks...</p>
          ) : completedTasks.length > 0 ? (
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <FeedbackCard key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6">
              No completed tasks yet. {error ? "Please check the error above." : ""}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <Toaster />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Volunteer Dashboard</h1>
        <div className="flex items-center space-x-4">
          <nav className="space-x-4">
            <Tab
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
            />
            <Tab
              label="My Contributions"
              active={activeTab === "contributions"}
              onClick={() => setActiveTab("contributions")}
            />
          </nav>
          <div className="relative">
            <button onClick={handleNotificationClick} className="relative focus:outline-none">
              <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-3 z-50 animate-fadeIn">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {loading.notifications ? (
                  <p className="text-sm text-gray-500 p-2">Loading notifications...</p>
                ) : notifications.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-3 rounded-lg transition-colors ${
                          n.read ? "bg-gray-50" : "bg-blue-50"
                        } hover:bg-gray-100 cursor-pointer`}
                        onClick={() => markNotificationAsRead(n._id)}
                      >
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-2">No notifications</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
          <button
            onClick={() => fetchData()}
            className="ml-4 underline text-red-800 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}
      {activeTab === "dashboard" ? (
        <>
          <Overview />
          <TasksTable />
        </>
      ) : (
        <Contributions />
      )}
      {showStatusModal && <StatusModal />}
    </div>
  );
};

const Card = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number | string }) => (
  <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
    <div className="flex items-center mb-2">{icon}</div>
    <h3 className="text-lg font-medium text-gray-600">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const map: { [key: string]: string } = {
    available: "bg-green-100 text-green-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-sm ${map[status]}`}>
      {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
};

const Stat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) => (
  <div className="bg-gray-50 p-4 rounded-lg text-center">
    <p className="text-sm text-gray-600">{label}</p>
    <div className="flex items-center justify-center mt-1">
      <p className="text-2xl font-bold">{value}</p>
      {icon && <span className="ml-2">{icon}</span>}
    </div>
  </div>
);

const Tab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`${
      active ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
    } px-4 py-2 rounded-lg transition focus:outline-none`}
  >
    {label}
  </button>
);

const FeedbackCard = ({ task }: { task: Task }) => (
  <div className="border-b pb-4">
    <div className="flex justify-between">
      <div>
        <h3 className="font-semibold">{task.title || "N/A"}</h3>
        <p className="text-sm text-gray-600">
          {task.from_location || "N/A"} → {task.to_location || task.pickup_location || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Status: {task.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </p>
        <p className="text-sm text-gray-600">
          Donor: {task.donorId?.name || "N/A"} ({task.donorId?.email || "N/A"})
        </p>
        <p className="text-sm text-gray-600">NGO: {task.ngoId?.organization_name || "N/A"}</p>
      </div>
      <div className="flex">
        {[...Array(Math.floor((task.feedback?.rating || 0) + 0.5))].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400" />
        ))}
      </div>
    </div>
    {task.feedback?.feedback && (
      <p className="mt-2 text-sm text-gray-600">"{task.feedback.feedback}"</p>
    )}
    <div className="flex justify-between text-sm text-gray-500 mt-2">
      <span>{new Date(task.pickup_window_start).toLocaleDateString()}</span>
      <span>
        {new Date(task.pickup_window_start).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        -{" "}
        {new Date(task.pickup_window_end).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  </div>
);

export default VolunteerDashboard;