import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  Utensils,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAdminContext } from "@/contexts/AdminContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

interface FoodDonation {
  id: string;
  _id?: string; // Add this to handle both id and _id
  donorName: string;
  ngoName: string;
  volunteerName: string;
  title: string;
  quantity: number;
  unit: string;
  pickup_location: string;
  createdAt: string;
}
const formatDate = (dateValue: string | undefined | null) => {
  if (!dateValue) return 'No date';
  
  try {
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateValue);
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error, 'for value:', dateValue);
    return 'Date error';
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "ngos" | "donors" | "volunteers" | "alerts" | "settings" | "donations"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended" | "pending"
  >("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    "suspend" | "delete" | null
  >(null);
  const [users, setUsers] = useState<User[]>([]);
  const [highlightRows, setHighlightRows] = useState<string[]>([]);

  const {
    getDashboardStats,
    stats,
    users: allusers,
    updateUserStatus,
    deleteUser,
    foodDonations,
    getFoodDonations,
    deleteFoodDonation,
  } = useAdminContext();

  useEffect(() => {
    const newRowIds = allusers.map((user: any) => user._id).concat(foodDonations.map((d: any) => d.id));
    setHighlightRows(newRowIds);
    const timer = setTimeout(() => setHighlightRows([]), 2000);
    return () => clearTimeout(timer);
  }, [allusers, foodDonations]);

  const handleUserAction = (user: User, action: "suspend" | "delete") => {
    setSelectedUser(user);
    setSelectedAction(action);
    setShowConfirmDialog(true);
  };

  const handleDonationDelete = (donation: FoodDonation) => {
    setSelectedDonation(donation);
    setSelectedAction("delete");
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (selectedAction === "delete" && selectedDonation) {
      deleteFoodDonation(selectedDonation.id);
    } else if (selectedUser && selectedAction) {
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
    }

    setShowConfirmDialog(false);
    setSelectedUser(null);
    setSelectedDonation(null);
    setSelectedAction(null);
  };

  const handleStatusChange = (userId: string, status: string) => {
    const data = {
      userId,
      status: status === "approved" ? true : false,
    };
    updateUserStatus(data);
  };

  const deleteUserByAdmin = (userId: string) => {
    deleteUser(userId);
  };

  useEffect(() => {
    getDashboardStats();
    getFoodDonations();
  }, []);

  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full animate-scaleIn">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Confirm Action</h3>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {selectedDonation && selectedAction === "delete"
            ? `Are you sure you want to delete the donation "${selectedDonation.title}"? This action cannot be undone.`
            : selectedAction === "suspend"
            ? `Are you sure you want to ${
                selectedUser?.status === "suspended" ? "reactivate" : "suspend"
              } ${selectedUser?.name}?`
            : `Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={confirmAction}
            className={`px-3 sm:px-4 py-2 text-white rounded-lg transition-colors text-sm sm:text-base ${
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
    <div className="space-y-6 px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          icon={Utensils}
          title="Total Donations"
          value={String(stats.donationCount)}
          trend="+10 this month"
          trendUp={true}
          color="red"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Users</h2>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Name</th>
                <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Email</th>
                <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Status</th>
                <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Joined Date</th>
                <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Type</th>
                <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allusers.map((user: any) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                    highlightRows.includes(user._id)
                      ? "animate-pulse bg-green-50"
                      : ""
                  }`}
                >
                  <td className="py-3 sm:py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-sm sm:text-base">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.email}</td>
                  <td className="py-3 sm:py-4 px-4">
                    <select
                      className={`px-2 py-1 rounded-full text-sm font-medium focus:outline-none transition-colors ease-in-out duration-300 ${
                        user.isApproved
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
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
                  <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">
                    {user.createdAt &&
                      new Date(user?.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.role}</td>
                  <td className="py-3 sm:py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteUserByAdmin(user._id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors ease-in-out duration-300"
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
      <div className="space-y-6 px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full sm:w-40">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm sm:text-base"
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
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Name</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Email</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Status</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Joined Date</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Last Active</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Contributions</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        highlightRows.includes(user.id)
                          ? "animate-pulse bg-green-50"
                          : ""
                      }`}
                    >
                      <td className="py-3 sm:py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-sm sm:text-base">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.email}</td>
                      <td className="py-3 sm:py-4 px-4">
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
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.joinedDate}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.lastActive}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.totalContributions}</td>
                      <td className="py-3 sm:py-4 px-4">
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

  const DonationsList = () => {
    const filteredDonations = foodDonations.filter((donation: FoodDonation) =>
      donation.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search donations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Donor</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">NGO</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Volunteer</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Food Item</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Quantity</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Location</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Listed</th>
                    <th className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation: FoodDonation) => (
                    <tr
                      key={donation.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        highlightRows.includes(donation.id)
                          ? "animate-pulse bg-green-50"
                          : ""
                      }`}
                    >
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.donorName}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.ngoName}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.volunteerName}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.title}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{`${donation.quantity} ${donation.unit}`}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.pickup_location}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">
                        {formatDate(
    donation.createdAt 
  )}
                                  
                      </td>
                      <td className="py-3 sm:py-4 px-4">
                        <button
                          onClick={() => handleDonationDelete(donation)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete donation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
    <div className="space-y-6 px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">Platform Settings</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm sm:text-base">Enable New Registrations</span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-1"
                      />
                      <label htmlFor="switch-1" className="switch-label"></label>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm sm:text-base">Email Notifications</span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-2"
                        defaultChecked
                      />
                      <label htmlFor="switch-2" className="switch-label"></label>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm sm:text-base">Maintenance Mode</span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-3"
                      />
                      <label htmlFor="switch-3" className="switch-label"></label>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm sm:text-base">Two-Factor Authentication</span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-4"
                        defaultChecked
                      />
                      <label htmlFor="switch-4" className="switch-label"></label>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm sm:text-base">API Access</span>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        className="switch-checkbox"
                        id="switch-5"
                        defaultChecked
                      />
                      <label htmlFor="switch-5" className="switch-label"></label>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-4">Donation Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Donation Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    defaultValue={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Delivery Distance (km)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    defaultValue={20}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base">
              Cancel
            </button>
            <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <TabButton
            label="Overview"
            isActive={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            label="Donations"
            isActive={activeTab === "donations"}
            onClick={() => setActiveTab("donations")}
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
      {activeTab === "donations" && <DonationsList />}
      {activeTab === "settings" && <Settings />}

      {showConfirmDialog && <ConfirmDialog />}
      <ToastContainer position="top-right" autoClose={2000} />
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
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 sm:w-6 h-5 sm:h-6" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{value}</p>
          <p
            className={`text-xs sm:text-sm ${
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
    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
      isActive
        ? "bg-green-600 text-white"
        : "text-gray-600 hover:bg-gray-300"
    }`}
  >
    {label}
  </button>
);

// CSS for toggle switches
const ToggleSwitchStyles = `
  .switch-checkbox {
    display: none;
  }
  .switch-label {
    display: block;
    width: 48px;
    height: 24px;
    background-color: #e5e7eb;
    border-radius: 9999px;
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .switch-label:after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }
  .switch-checkbox:checked + .switch-label {
    background-color: #2563eb;
  }
  .switch-checkbox:checked + .switch-label:after {
    transform: translateX(24px);
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = ToggleSwitchStyles;
document.head.appendChild(styleSheet);

export default AdminDashboard;