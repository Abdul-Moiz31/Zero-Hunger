/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVolunteerContext } from '@/contexts/volunteerContext';
import { Package2, Route, CheckCircle, Star, X, Upload, Camera } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { StatCard, StatusBadge, DataTable, NotificationBell, Button, type Column } from '../ui';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface Task {
  _id: string;
  title: string;
  type: string;
  from_location: string;
  to_location: string;
  pickup_location: string;
  status: 'available' | 'assigned' | 'in_progress' | 'completed';
  pickup_window_start: string;
  pickup_window_end: string;
  ngoId: { organization_name: string };
  contact_number: number;
  donorId: { name: string; email: string };
  feedback?: { rating: number; feedback: string };
}

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contributions'>('dashboard');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

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
      console.error('Initial data fetch failed:', err);
    }
  }, [getVolunteerStats, getVolunteerTasks, getNotifications]);

  useEffect(() => {
    if (!hasFetched) fetchData();
  }, [fetchData, hasFetched]);

  // Real-time: refresh notifications instantly and toast when one arrives.
  const onRealtime = useCallback(
    (n: { message: string }) => {
      getNotifications(true).catch(() => {});
      toast.success(n.message, { duration: 4000, position: 'top-right' });
    },
    [getNotifications]
  );
  useRealtimeNotifications(onRealtime);

  // Poll notifications + tasks (silent). Socket.IO supersedes this in prod.
  useEffect(() => {
    const n = setInterval(() => getNotifications(true).catch(() => {}), 8000);
    const t = setInterval(() => {
      getVolunteerTasks(true).catch(() => {});
      getVolunteerStats(true).catch(() => {});
    }, 12000);
    return () => {
      clearInterval(n);
      clearInterval(t);
    };
  }, [getNotifications, getVolunteerTasks, getVolunteerStats]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status'], proofFile?: File) => {
    try {
      await updateTaskStatus(taskId, newStatus, proofFile);
      toast.success(`Task marked ${newStatus.replace('_', ' ')}`);
      setSelectedTask(null);
      setShowStatusModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status');
    }
  };

  const completedTasks = volunteerTasks.filter((t) => t.status === 'completed');
  const averageRating =
    completedTasks.length > 0
      ? completedTasks.reduce((s, t) => s + (t.feedback?.rating || 0), 0) / completedTasks.length
      : 0;

  const taskColumns: Column<Task>[] = [
    { key: 'title', header: 'Task', render: (t) => <span className="font-medium text-gray-900">{t.title || 'N/A'}</span> },
    { key: 'ngo', header: 'NGO', render: (t) => t.ngoId?.organization_name || 'N/A' },
    { key: 'pickup', header: 'Pickup', render: (t) => t.pickup_location || t.to_location || 'N/A' },
    {
      key: 'time',
      header: 'Window',
      render: (t) => `${fmtTime(t.pickup_window_start)} – ${fmtTime(t.pickup_window_end)}`,
    },
    { key: 'phone', header: 'Contact', render: (t) => t.contact_number || 'N/A' },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    {
      key: 'action',
      header: '',
      render: (t) =>
        t.status === 'completed' ? (
          <span className="text-xs text-gray-400">Done</span>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedTask(t);
              setShowStatusModal(true);
            }}
          >
            Update
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
          <p className="text-sm text-gray-500">Pick up, deliver, and track your rescues.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1">
            {(['dashboard', 'contributions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'dashboard' ? 'Tasks' : 'My Impact'}
              </button>
            ))}
          </div>
          <NotificationBell
            notifications={notifications}
            onMarkRead={handleMarkAsRead}
            loading={loading.notifications}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 p-4 text-rose-700">
          <span>{error}</span>
          <Button size="sm" variant="danger" onClick={() => fetchData()}>
            Retry
          </Button>
        </div>
      )}

      {activeTab === 'dashboard' ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard label="Tasks to pick up" value={stats.available_Task} icon={Package2} accent="blue" index={0} />
            <StatCard label="In progress" value={stats.in_progress_task} icon={Route} accent="violet" index={1} />
            <StatCard label="Completed" value={stats.Completed_task} icon={CheckCircle} accent="green" index={2} />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Your tasks</h2>
            <DataTable
              columns={taskColumns}
              rows={volunteerTasks as Task[]}
              rowKey={(t) => t._id}
              loading={loading.tasks && volunteerTasks.length === 0}
              emptyTitle="No tasks assigned yet"
              emptyHint="When an NGO assigns you a delivery, it will appear here."
            />
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            <StatCard label="Total tasks" value={volunteerTasks.length} icon={Package2} accent="blue" index={0} />
            <StatCard label="Completed" value={completedTasks.length} icon={CheckCircle} accent="green" index={1} />
            <StatCard label="Avg. rating" value={averageRating} decimals={1} icon={Star} accent="amber" index={2} />
            <StatCard label="Hours given" value={completedTasks.length * 2} icon={Route} accent="violet" index={3} />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Completed deliveries</h2>
            {completedTasks.length > 0 ? (
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <FeedbackCard key={task._id} task={task} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center text-sm text-gray-500">
                No completed deliveries yet — your impact story starts with your first rescue.
              </p>
            )}
          </div>
        </div>
      )}

      {showStatusModal && selectedTask && (
        <StatusModal
          task={selectedTask}
          updating={loading.updating}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTask(null);
          }}
          onSelect={(status, proofFile) => handleUpdateTaskStatus(selectedTask._id, status, proofFile)}
        />
      )}
    </div>
  );
};

const StatusModal = ({
  task,
  updating,
  onClose,
  onSelect,
}: {
  task: Task;
  updating: boolean;
  onClose: () => void;
  onSelect: (status: Task['status'], proofFile?: File) => void;
}) => {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Update status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500">{task.title}</p>

        {/* Proof of delivery upload — shown when completing */}
        {task.status === 'in_progress' && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-gray-600 flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" /> Proof photo (optional — shown when marking complete)
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-3 text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition"
            >
              <Upload className="h-4 w-4" />
              {proofFile ? proofFile.name : 'Upload delivery proof'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {previewUrl && (
              <img src={previewUrl} alt="proof preview" className="mt-2 h-24 w-full rounded-lg object-cover" />
            )}
          </div>
        )}

        <div className="space-y-2">
          {(['in_progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onSelect(status, status === 'completed' ? (proofFile ?? undefined) : undefined)}
              disabled={updating || task.status === status}
              className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
                task.status === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              Mark as {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeedbackCard = ({ task }: { task: Task }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex justify-between gap-4">
      <div className="flex-1">
        <h3 className="mb-1 font-semibold text-gray-900">{task.title || 'N/A'}</h3>
        <div className="space-y-0.5 text-sm text-gray-600">
          <p>
            <span className="font-medium">Donor:</span> {task.donorId?.name || 'N/A'}
          </p>
          <p>
            <span className="font-medium">NGO:</span> {task.ngoId?.organization_name || 'N/A'}
          </p>
        </div>
      </div>
      <div className="flex items-start">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor((task.feedback?.rating || 0) + 0.5)
                ? 'fill-current text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
      <span>{new Date(task.pickup_window_start).toLocaleDateString()}</span>
      <span>
        {fmtTime(task.pickup_window_start)} – {fmtTime(task.pickup_window_end)}
      </span>
    </div>
  </div>
);

export default VolunteerDashboard;
