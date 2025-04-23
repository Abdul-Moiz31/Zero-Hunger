import React, { useEffect, useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  AlertTriangle,
  Settings,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  AlertOctagon,
} from "lucide-react";
import { useAdminContext } from "@/contexts/AdminContext";

// Mock data
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "donor",
    status: "active",
    joinedDate: "2024-03-01",
    lastActive: "2024-03-15",
    totalContributions: 5,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "ngo",
    status: "active",
    joinedDate: "2024-02-15",
    lastActive: "2024-03-14",
    totalContributions: 8,
  },
];

const mockAlerts = [
  {
    id: "1",
    type: "warning",
    message: "New volunteer application needs review",
    timestamp: new Date().toISOString(),
    resolved: false,
  },
  {
    id: "2",
    type: "critical",
    message: "System maintenance scheduled",
    timestamp: new Date().toISOString(),
    resolved: false,
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  role: "donor" | "ngo" | "volunteer";
  status: "active" | "suspended" | "pending";
  joinedDate: string;
  lastActive: string;
  totalContributions: number;
}

interface Alert {
  id: string;
  type: "warning" | "critical" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "ngos" | "donors" | "volunteers" | "alerts" | "settings"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended" | "pending"
  >("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    "suspend" | "delete" | null
  >(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const {
    getDashboardStats,
    stats,
    users: allusers,
    updateUserStatus,
    deleteUser
  } = useAdminContext();

  const handleUserAction = (user: User, action: "suspend" | "delete") => {
    setSelectedUser(user);
    setSelectedAction(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (!selectedUser || !selectedAction) return;

    if (selectedAction === "suspend") {
      const newStatus =
        selectedUser.status === "suspended" ? "active" : "suspended";
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, status: newStatus } : user
        )
      );
    } else if (selectedAction === "delete") {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
    }

    setShowConfirmDialog(false);
    setSelectedUser(null);
    setSelectedAction(null);
  };

  const handleStatusChange = (userId, status) => {
    let data = {
      userId,
      status: status == "approved" ? true : false,
    };

    updateUserStatus(data);
  };


  const deleteUserByAdmin=(userId)=>{

    deleteUser(userId);
  }

  useEffect(() => {
    getDashboardStats();
  }, []);

  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full animate-scaleIn">
        <h3 className="text-xl font-semibold mb-4">Confirm Action</h3>
        <p className="text-gray-600 mb-6">
          {selectedAction === "suspend"
            ? `Are you sure you want to ${
                selectedUser?.status === "suspended" ? "reactivate" : "suspend"
              } ${selectedUser?.name}?`
            : `Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmAction}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              selectedAction === "delete"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const Overview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard
          icon={Building2}
          title="Total NGOs"
          value={String(stats.ngoCount)}
          trend="+5 this month"
          trendUp={true}
          color="blue"
        />
        <DashboardCard
          icon={Users}
          title="Active Donors"
          value={String(stats.donorCount)}
          trend="+12 this week"
          trendUp={true}
          color="green"
        />
        <DashboardCard
          icon={UserCheck}
          title="Volunteers"
          value={String(stats.volunteerCount)}
          trend="+3% growth"
          trendUp={true}
          color="purple"
        />
        <DashboardCard
          icon={AlertTriangle}
          title="Traffic"
          value={"20"}
          trend="2 critical"
          trendUp={false}
          color="red"
        />
      </div>

      <div className="overflow-x-auto w-[90%] mx-auto  pt-10">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-3 font-semibold text-gray-600">Name</th>
              <th className="pb-3 font-semibold text-gray-600">Email</th>
              <th className="pb-3 font-semibold text-gray-600">Status</th>
              <th className="pb-3 font-semibold text-gray-600">Joined Date</th>
              <th className="pb-3 font-semibold text-gray-600">Type</th>
              <th className="pb-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allusers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="py-4">{user.email}</td>
                <td className="py-4">
                  <select
                    className={`px-2 py-1 rounded-full text-sm font-medium focus:outline-none ${
                      user.isApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    value={user.isApproved ? "approved" : "not_approved"}
                    onChange={(e) =>
                      handleStatusChange(user._id, e.target.value)
                    }
                  >
                    <option value="approved">Approved</option>
                    <option value="not_approved">Not Approved</option>
                  </select>
                </td>

                <td className="py-4">
                  {user.createdAt &&
                    new Date(user?.createdAt).toLocaleDateString()}
                </td>

                <td className="py-4">{user.role}</td>

                <td className="py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteUserByAdmin(user._id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const UsersList = () => {
    const filteredUsers = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesRole =
        activeTab === "ngos"
          ? user.role === "ngo"
          : activeTab === "donors"
          ? user.role === "donor"
          : user.role === "volunteer";
      return matchesSearch && matchesStatus && matchesRole;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                  <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-3 font-semibold text-gray-600">Name</th>
                    <th className="pb-3 font-semibold text-gray-600">Email</th>
                    <th className="pb-3 font-semibold text-gray-600">Status</th>
                    <th className="pb-3 font-semibold text-gray-600">
                      Joined Date
                    </th>
                    <th className="pb-3 font-semibold text-gray-600">
                      Last Active
                    </th>
                    <th className="pb-3 font-semibold text-gray-600">
                      Contributions
                    </th>
                    <th className="pb-3 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4">{user.email}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : user.status === "suspended"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4">{user.joinedDate}</td>
                      <td className="py-4">{user.lastActive}</td>
                      <td className="py-4">{user.totalContributions}</td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {}}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user, "suspend")}
                            className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
                            title={
                              user.status === "suspended"
                                ? "Reactivate user"
                                : "Suspend user"
                            }
                          >
                            {user.status === "suspended" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleUserAction(user, "delete")}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Settings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Platform Settings</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">
                      Enable New Registrations
                    </span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-1"
                      />
                      <label
                        htmlFor="switch-1"
                        className="switch-label"
                      ></label>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Email Notifications</span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-2"
                        defaultChecked
                      />
                      <label
                        htmlFor="switch-2"
                        className="switch-label"
                      ></label>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Maintenance Mode</span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-3"
                      />
                      <label
                        htmlFor="switch-3"
                        className="switch-label"
                      ></label>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">
                      Two-Factor Authentication
                    </span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-4"
                        defaultChecked
                      />
                      <label
                        htmlFor="switch-4"
                        className="switch-label"
                      ></label>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">API Access</span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-5"
                        defaultChecked
                      />
                      <label
                        htmlFor="switch-5"
                        className="switch-label"
                      ></label>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Donation Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Donation Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Delivery Distance (km)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={20}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <TabButton
            label="Overview"
            isActive={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            label="NGOs"
            isActive={activeTab === "ngos"}
            onClick={() => setActiveTab("ngos")}
          />
          <TabButton
            label="Donors"
            isActive={activeTab === "donors"}
            onClick={() => setActiveTab("donors")}
          />
          <TabButton
            label="Volunteers"
            isActive={activeTab === "volunteers"}
            onClick={() => setActiveTab("volunteers")}
          />
          <TabButton
            label="Settings"
            isActive={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>
      </div>

      {activeTab === "overview" && <Overview />}
      {["ngos", "donors", "volunteers"].includes(activeTab) && <UsersList />}
      {activeTab === "settings" && <Settings />}

      {showConfirmDialog && <ConfirmDialog />}
    </div>
  );
};

const DashboardCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendUp,
  color,
}: {
  icon: any;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  color: "blue" | "green" | "purple" | "red";
}) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p
            className={`text-sm ${
              trendUp ? "text-green-600" : "text-gray-600"
            }`}
          >
            {trend}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({
  icon: Icon,
  title,
  stats,
}: {
  icon: any;
  title: string;
  stats: { label: string; value: string }[];
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center space-x-3 mb-6">
      <Icon className="w-5 h-5 text-blue-600" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-gray-600">{stat.label}</span>
          <span className="font-semibold">{stat.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const TabButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
      isActive
        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default AdminDashboard;
