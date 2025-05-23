import React, { useEffect, useState } from 'react';
import { useVolunteerContext } from '@/contexts/volunteerContext';
import {
  Package2,
  Route,
  CheckCircle,
  Star,
  ChevronDown,
  X,
} from 'lucide-react';

// Task interface matching backend schema
interface Task {
  _id: string;
  title: string;
  type: string;
  from_location: string;
  to_location: string;
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  pickup_window_start: string;
  pickup_window_end: string;
  feedback?: {
    rating: number;
    feedback: string;
  };
}

const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contributions'>('dashboard');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Get stats and tasks from context
  const { stats, volunteerTasks, getVolunteerStats, getVolunteerTasks } = useVolunteerContext();

  useEffect(() => {
    getVolunteerStats();
    getVolunteerTasks();
  }, []);

  // Update local task status and persist via API if needed
  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    // Ideally call API to update then refresh context
    setSelectedTask(null);
    setShowStatusModal(false);
  };

  // Modal for updating status
  const StatusModal = () => {
    if (!selectedTask) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Update Status</h3>
            <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {['available', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => updateTaskStatus(selectedTask._id, status as Task['status'])}
                className={`w-full text-left py-2 px-4 rounded-lg transition ${
               selectedTask.status === status ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Overview cards
  const Overview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card icon={<Package2 />} title="Available Tasks" value={stats.available_Task} />
      <Card icon={<Route />} title="In Progress" value={stats.in_progress_task} />
      <Card icon={<CheckCircle />} title="Completed Today" value={stats.Completed_task} />
    </div>
  );

  // Tasks table
  const TasksTable = () => (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
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
            {volunteerTasks.map((task: Task) => (
              <tr key={task._id} className="border-b hover:bg-gray-50">
                <td className="py-3">{task.title}</td>
                <td>{task.ngoId.organization_name}</td>
                <td>{task.pickup_location}</td>
                <td>
                  {new Date(task.pickup_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(task.pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <Badge status={task.status} />
                </td>
                <td>
                  <button
                    onClick={() => { setSelectedTask(task); setShowStatusModal(true); }}
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    Update <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Contributions view
  const Contributions = () => (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Contributions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total Tasks" value={volunteerTasks.length} />
          <Stat label="Completed Tasks" value={volunteerTasks.filter(t => t.status === 'completed').length} />
          <Stat label="Average Rating" value={
            (volunteerTasks
              .filter(t => t.feedback)
              .reduce((sum, t) => sum + (t.feedback?.rating||0), 0) /
            (volunteerTasks.filter(t => t.feedback).length || 1)
            ).toFixed(1)
          } icon={<Star className="text-yellow-400" />} />
          <Stat label="Hours Contributed" value={/* calculate from data if available */ 0} />
        </div>
      </div>
      {/* Feedback list */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Completed Tasks & Feedback</h2>
        <div className="space-y-4">
          {volunteerTasks.filter(t => t.status === 'completed' && t.feedback).map(t => (
            <FeedbackCard key={t._id} task={t} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Volunteer Dashboard</h1>
        <nav className="space-x-4">
          <Tab label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <Tab label="My Contributions" active={activeTab === 'contributions'} onClick={() => setActiveTab('contributions')} />
        </nav>
      </header>
      {activeTab === 'dashboard' ? (
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

// Reusable components
const Card = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) => (
  <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
    <div className="flex items-center mb-2">{icon}</div>
    <h3 className="text-lg font-medium text-gray-600">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const map = {
    available: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return <span className={`px-2 py-1 rounded-full text-sm ${map[status]}`}>{status.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</span>;
};

const Stat = ({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) => (
  <div className="bg-gray-50 p-4 rounded-lg text-center">
    <p className="text-sm text-gray-600">{label}</p>
    <div className="flex items-center justify-center mt-1">
      <p className="text-2xl font-bold">{value}</p>{icon && <span className="ml-2">{icon}</span>}
    </div>
  </div>
);

const Tab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`${active ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'} px-4 py-2 rounded-lg transition`}
  >{label}</button>
);

const FeedbackCard = ({ task }: { task: Task }) => (
  <div className="border-b pb-4">
    <div className="flex justify-between">
      <div>
        <h3 className="font-semibold">{task.title}</h3>
        <p className="text-sm text-gray-600">{task.from_location} → {task.to_location}</p>
      </div>
      <div className="flex">
        {[...Array(task.feedback?.rating || 0)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400" />)}
      </div>
    </div>
    {task.feedback?.feedback && <p className="mt-2 text-sm text-gray-600">"{task.feedback.feedback}"</p>}
    <div className="flex justify-between text-sm text-gray-500 mt-2">
      <span>{new Date(task.pickup_window_start).toLocaleDateString()}</span>
      <span>
        {new Date(task.pickup_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
        {new Date(task.pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </div>
);

export default VolunteerDashboard;