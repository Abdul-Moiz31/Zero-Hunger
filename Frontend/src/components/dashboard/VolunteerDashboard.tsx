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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      _id: '1',
      title: 'Deliver Food Packages',
      type: 'Delivery',
      from_location: 'Gulberg, Lahore',
      to_location: 'Shadman, Lahore',
      status: 'available',
      pickup_window_start: '2025-05-15T09:00:00Z',
      pickup_window_end: '2025-05-15T11:00:00Z',
    },
    {
      _id: '2',
      title: 'Medical Supplies Transport',
      type: 'Transport',
      from_location: 'Clifton, Karachi',
      to_location: 'Korangi, Karachi',
      status: 'in_progress',
      pickup_window_start: '2025-05-15T10:00:00Z',
      pickup_window_end: '2025-05-15T12:00:00Z',
      feedback: { rating: 4, feedback: 'Timely delivery, well-handled.' },
    },
    {
      _id: '3',
      title: 'School Supplies Distribution',
      type: 'Distribution',
      from_location: 'F-7, Islamabad',
      to_location: 'G-9, Islamabad',
      status: 'completed',
      pickup_window_start: '2025-05-14T08:00:00Z',
      pickup_window_end: '2025-05-14T10:00:00Z',
      feedback: { rating: 5, feedback: 'Excellent coordination!' },
    },
    {
      _id: '4',
      title: 'Clothing Donation Delivery',
      type: 'Delivery',
      from_location: 'Model Town, Lahore',
      to_location: 'Cantt, Lahore',
      status: 'assigned',
      pickup_window_start: '2025-05-15T13:00:00Z',
      pickup_window_end: '2025-05-15T15:00:00Z',
    },
    {
      _id: '5',
      title: 'Flood Relief Supplies',
      type: 'Transport',
      from_location: 'Bahria Town, Rawalpindi',
      to_location: 'Chakwal, Punjab',
      status: 'completed',
      pickup_window_start: '2025-05-13T07:00:00Z',
      pickup_window_end: '2025-05-13T09:00:00Z',
      feedback: { rating: 3, feedback: 'Could improve communication.' },
    },
    {
      _id: '6',
      title: 'Ramadan Food Packs',
      type: 'Distribution',
      from_location: 'DHA, Karachi',
      to_location: 'Lyari, Karachi',
      status: 'available',
      pickup_window_start: '2025-05-15T16:00:00Z',
      pickup_window_end: '2025-05-15T18:00:00Z',
    },
    {
      _id: '7',
      title: 'Medical Camp Support',
      type: 'Support',
      from_location: 'Johar Town, Lahore',
      to_location: 'Wapda Town, Lahore',
      status: 'in_progress',
      pickup_window_start: '2025-05-15T11:00:00Z',
      pickup_window_end: '2025-05-15T13:00:00Z',
    },
    {
      _id: '8',
      title: 'Orphanage Supplies',
      type: 'Delivery',
      from_location: 'Gulshan, Karachi',
      to_location: 'Malir, Karachi',
      status: 'completed',
      pickup_window_start: '2025-05-12T09:00:00Z',
      pickup_window_end: '2025-05-12T11:00:00Z',
      feedback: { rating: 5, feedback: 'Very professional service.' },
    },
    {
      _id: '9',
      title: 'Education Kits Delivery',
      type: 'Delivery',
      from_location: 'F-11, Islamabad',
      to_location: 'I-8, Islamabad',
      status: 'available',
      pickup_window_start: '2025-05-15T14:00:00Z',
      pickup_window_end: '2025-05-15T16:00:00Z',
    },
    {
      _id: '10',
      title: 'Winter Clothing Drive',
      type: 'Distribution',
      from_location: 'PWD, Islamabad',
      to_location: 'Bani Gala, Islamabad',
      status: 'cancelled',
      pickup_window_start: '2025-05-14T12:00:00Z',
      pickup_window_end: '2025-05-14T14:00:00Z',
    },
  ]);

  const { getVolunteerStats, stats } = useVolunteerContext();

  useEffect(() => {
    getVolunteerStats();
  }, [getVolunteerStats]);

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks((prev) =>
      prev.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setShowStatusModal(false);
    setSelectedTask(null);
  };

  const StatusModal = () => {
    if (!selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Update Status</h3>
            <button
              onClick={() => {
                setShowStatusModal(false);
                setSelectedTask(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2">
            {['available', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => updateTaskStatus(selectedTask._id, status as Task['status'])}
                className={`w-full p-2 rounded-lg text-left ${
                  selectedTask.status === status
                    ? 'bg-green-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Package2 className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="text-lg font-semibold">Available Tasks</h3>
          <p className="text-3xl font-bold">{stats.available_Task || 3}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Route className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="text-lg font-semibold">In Progress</h3>
          <p className="text-3xl font-bold">{stats.in_progress_task || 2}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="text-lg font-semibold">Completed Today</h3>
          <p className="text-3xl font-bold">{stats.Completed_task || 1}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">From</th>
                  <th className="pb-3">To</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="border-b">
                    <td className="py-3">{task.type}</td>
                    <td>{task.from_location}</td>
                    <td>{task.to_location}</td>
                    <td>
                      {new Date(task.pickup_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(task.pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          task.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : task.status === 'completed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowStatusModal(true);
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <span>Update</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const Contributions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Contributions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold">10</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Completed Tasks</p>
            <p className="text-2xl font-bold">3</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Average Rating</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold mr-2">4.3</p>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Hours Contributed</p>
            <p className="text-2xl font-bold">25</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Completed Tasks & Feedback</h2>
        <div className="space-y-4">
          {tasks
            .filter((task) => task.status === 'completed' && task.feedback)
            .map((task) => (
              <div key={task._id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">
                      {task.from_location} → {task.to_location}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {task.feedback &&
                      [...Array(task.feedback.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                  </div>
                </div>
                {task.feedback?.feedback && (
                  <p className="text-sm text-gray-600 mt-2">
                    "{task.feedback.feedback}"
                  </p>
                )}
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>
                    {new Date(task.pickup_window_start).toLocaleDateString()}
                  </span>
                  <span>
                    {new Date(task.pickup_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(task.pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Volunteer Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('contributions')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
              activeTab === 'contributions'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Contributions
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? <Dashboard /> : <Contributions />}
      {showStatusModal && <StatusModal />}
    </div>
  );
};

export default VolunteerDashboard;