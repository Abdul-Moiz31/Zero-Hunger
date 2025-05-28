/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Interfaces aligned with backend data
interface User {
  _id: string;
  name: string;
  email: string;
  role: "donor" | "ngo" | "volunteer";
  status?: "active" | "suspended" | "pending"; // Derived from isApproved
  joinedDate: string; // Maps to createdAt
  lastActive?: string; // Not provided by backend
  totalContributions?: number; // Not provided by backend
  isApproved?: boolean;
}

interface FoodDonation {
  _id: string;
  donorName: string;
  ngoName: string;
  volunteerName: string;
  title: string;
  quantity: number;
  unit: string;
  pickup_location: string;
  createdAt: string;
}

// Centralized tab configuration
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "donations", label: "Donations" },
  { id: "settings", label: "Settings" },
] as const;

type TabId = typeof TABS[number]["id"];

const formatDate = (dateValue: string | undefined | null) => {
  if (!dateValue) return "N/A";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended" | "pending"
  >("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [selectedAction, setSelectedAction] = useState<"suspend" | "delete" | null>(null);
  // const [highlightRows, setHighlightRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<User | null>(null);
  const [settings, setSettings] = useState({
    enableRegistrations: false,
    emailNotifications: true,
    maintenanceMode: false,
    twoFactorAuth: true,
    apiAccess: true,
    minDonation: 10,
    maxDistance: 20,
  });

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

  // Memoized formatDate
  const memoizedFormatDate = useCallback(formatDate, []);

  // Fetch data with improved error handling and retry mechanism
  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state
        await Promise.all([getDashboardStats(), getFoodDonations()]);
      } catch (err: any) {
        console.error("Error fetching data:", err.message || err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to load data. Please try again.";
        if (err.response?.status === 401 && retryCount < 1) {
          // Retry once if unauthorized (token might need refresh)
          console.warn("Unauthorized access, retrying once...");
          return fetchData(retryCount + 1);
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Highlight new rows
  // useEffect(() => {
  //   const newRowIds = [...new Set([...allusers.map((user: any) => user._id), ...foodDonations.map((d: any) => d._id)])];
  //   setHighlightRows(newRowIds);
  //   const timer = setTimeout(() => setHighlightRows([]), 2000);
  //   return () => clearTimeout(timer);
  // }, [allusers.length, foodDonations.length]);

  // Handle user actions
  const handleUserAction = (user: User, action: "suspend" | "delete") => {
    setSelectedUser(user);
    setSelectedAction(action);
    setShowConfirmDialog(true);
   
  };

  // Handle donation deletion
  const handleDonationDelete = (donation: FoodDonation) => {
    setSelectedDonation(donation);
    setSelectedAction("delete");
    setShowConfirmDialog(true);
    
  };

  // Confirm action
  const confirmAction = () => {
    if (selectedAction === "delete" && selectedDonation) {
      deleteFoodDonation(selectedDonation._id);
    } else if (selectedUser && selectedAction) {
      if (selectedAction === "suspend") {
        const newStatus = selectedUser.status === "suspended" ? "active" : "suspended";
        updateUserStatus({ userId: selectedUser._id, status: newStatus === "active" });
      } else if (selectedAction === "delete") {
        deleteUser(selectedUser._id);
      }
    }
    setShowConfirmDialog(false);
    setSelectedUser(null);
    setSelectedDonation(null);
    setSelectedAction(null);
  };

  // Update user status
  const handleStatusChange = (userId: string, status: string) => {
    updateUserStatus({ userId, status: status === "approved" });
  };

  // Settings change handler with validation
  const handleSettingsChange = (key: keyof typeof settings, value: any) => {
    if (key === "minDonation" || key === "maxDistance") {
      if (value < 0) {
        toast.error(`${key === "minDonation" ? "Minimum donation" : "Maximum distance"} cannot be negative`);
        return;
      }
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Placeholder for saving settings
  const saveSettings = () => {
    toast.success("Settings saved successfully");
  };

  // Memoized filtered users with data mapping
  const filteredUsers = useMemo(() => {
    return allusers
      .map((user: any) => ({
        ...user,
        joinedDate: user.createdAt, // Map createdAt to joinedDate
        status: user.isApproved ? "active" : "pending", // Derive status from isApproved
        lastActive: user.lastActive || "N/A", // Fallback
        totalContributions: user.totalContributions || 0, // Fallback
      }))
      .filter((user: User) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        const matchesRole =
          activeTab === "ngos"
            ? user.role === "ngo"
            : activeTab === "donors"
            ? user.role === "donor"
            : user.role === "volunteer";
        return matchesSearch && matchesStatus && matchesRole;
      });
  }, [allusers, searchTerm, statusFilter, activeTab]);

  // Memoized filtered donations
  const filteredDonations = useMemo(() => {
    return foodDonations.filter((donation: FoodDonation) =>
      donation.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [foodDonations, searchTerm]);

  // Components
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

  const UserDetailsModal = ({ user }: { user: User }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">{user.name}</h3>
        <p className="text-sm sm:text-base">Email: {user.email}</p>
        <p className="text-sm sm:text-base">Role: {user.role}</p>
        <p className="text-sm sm:text-base">Status: {user.status || "N/A"}</p>
        <p className="text-sm sm:text-base">Joined: {memoizedFormatDate(user.joinedDate)}</p>
        <p className="text-sm sm:text-base">Last Active: {user.lastActive || "N/A"}</p>
        <p className="text-sm sm:text-base">Contributions: {user.totalContributions || 0}</p>
        <button
          onClick={() => setShowUserDetails(null)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm sm:text-base"
        >
          Close
        </button>
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
      <div className="bg-white rounded-xl shadow-sm table-container">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Name</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Email</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Status</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Joined Date</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Type</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allusers.map((user: any) => (
                  <tr
                    // key={user._id}
                    // className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                    //   highlightRows.includes(user._id) ? "highlight-row" : ""
                    // }`}
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
                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                      >
                        <option value="approved">Approved</option>
                        <option value="not_approved">Not Approved</option>
                      </select>
                    </td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">
                      {memoizedFormatDate(user.createdAt)}
                    </td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.role}</td>
                    <td className="py-3 sm:py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowUserDetails({
                            ...user,
                            joinedDate: user.createdAt,
                            status: user.isApproved ? "active" : "pending",
                            lastActive: "N/A",
                            totalContributions: 0,
                          })}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label={`View details for ${user.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction({
                            ...user,
                            joinedDate: user.createdAt,
                            status: user.isApproved ? "active" : "pending",
                            lastActive: "N/A",
                            totalContributions: 0,
                          }, "delete")}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete user ${user.name}`
                        }
                        
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

  const UsersList = () => (
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
                  aria-label={`Search ${activeTab}`}
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm sm:text-base"
                  aria-label="Filter by status"
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
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Name</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Email</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Status</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Joined Date</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Last Active</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Contributions</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    // key={user._id}
                    // className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                    //   highlightRows.includes(user._id) ? "highlight-row" : ""
                    // }`}
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
                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "N/A"}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{memoizedFormatDate(user.joinedDate)}</td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.lastActive || "N/A"}</td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{user.totalContributions || 0}</td>
                    <td className="py-3 sm:py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowUserDetails(user)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label={`View details for ${user.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user, "suspend")}
                          className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
                          aria-label={user.status === "suspended" ? `Reactivate user ${user.name}` : `Suspend user ${user.name}`}
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
                          aria-label={`Delete user ${user.name}`}
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

  const DonationsList = () => (
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
                  aria-label="Search donations"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Donor</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">NGO</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Volunteer</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Food Item</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Quantity</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Location</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Listed</th>
                  <th scope="col" className="pb-3 font-semibold text-gray-600 px-4 text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation: FoodDonation) => (
                  <tr
                    // key={donation._id}
                    // className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                    //   highlightRows.includes(donation._id) ? "highlight-row" : ""
                    // }`}
                  >
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.donorName}</td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.ngoName}</td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.volunteerName}</td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.title}</td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{`${donation.quantity} ${donation.unit}`}</td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{donation.pickup_location}</td>
                    <td className="py-3 sm:py-4 px-4 text-sm sm:text-base">{memoizedFormatDate(donation.createdAt)}</td>
                    <td className="py-3 sm:py-4 px-4">
                      <button
                        onClick={() => handleDonationDelete(donation)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`Delete donation ${donation.title}`}
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
                        checked={settings.enableRegistrations}
                        onChange={(e) => handleSettingsChange("enableRegistrations", e.target.checked)}
                        aria-label="Toggle new registrations"
                      />
                      <label htmlFor="switch-1" className="switch-label" aria-hidden="true"></label>
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
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingsChange("emailNotifications", e.target.checked)}
                        aria-label="Toggle email notifications"
                      />
                      <label htmlFor="switch-2" className="switch-label" aria-hidden="true"></label>
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
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleSettingsChange("maintenanceMode", e.target.checked)}
                        aria-label="Toggle maintenance mode"
                      />
                      <label htmlFor="switch-3" className="switch-label" aria-hidden="true"></label>
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
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingsChange("twoFactorAuth", e.target.checked)}
                        aria-label="Toggle two-factor authentication"
                      />
                      <label htmlFor="switch-4" className="switch-label" aria-hidden="true"></label>
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
                        checked={settings.apiAccess}
                        onChange={(e) => handleSettingsChange("apiAccess", e.target.checked)}
                        aria-label="Toggle API access"
                      />
                      <label htmlFor="switch-5" className="switch-label" aria-hidden="true"></label>
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
                    value={settings.minDonation}
                    onChange={(e) => handleSettingsChange("minDonation", Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    aria-label="Minimum donation amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Delivery Distance (km)
                  </label>
                  <input
                    type="number"
                    value={settings.maxDistance}
                    onChange={(e) => handleSettingsChange("maxDistance", Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    aria-label="Maximum delivery distance"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => setSettings({
                enableRegistrations: false,
                emailNotifications: true,
                maintenanceMode: false,
                twoFactorAuth: true,
                apiAccess: true,
                minDonation: 10,
                maxDistance: 20,
              })}
              className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
              className={`text-xs sm:text-sm ${trendUp ? "text-green-600" : "text-gray-600"}`}
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
        isActive ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-300"
      }`}
      aria-label={`Switch to ${label} tab`}
    >
      {label}
    </button>
  );

  // CSS for toggle switches and table
  const styles = `
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
    .table-container {
      overflow-x: auto;
      max-width: 100%;
    }
    table {
      width: 100%;
      table-layout: auto;
    }
    .highlight-row {
      animation: highlight 2s ease-out;
    }
    @keyframes highlight {
      0% { background-color: rgba(34, 197, 94, 0.2); }
      100% { background-color: transparent; }
    }
    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out;
    }
    @keyframes scaleIn {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;

  // Inject styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // if (isLoading) return <div className="text-center p-6 text-gray-600">Loading...</div>;
  // if (error) return (
  //   <div className="text-center p-6 text-red-600">
  //     {error}
  //     <button
  //       onClick={() => {
  //         setIsLoading(true);
  //         setError(null);
  //         Promise.all([getDashboardStats(), getFoodDonations()]).catch((err: any) => {
  //           setError(err.message || "Failed to load data. Please try again.");
  //           setIsLoading(false);
  //         });
  //       }}
  //       className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //     >
  //       Retry
  //     </button>
  //   </div>
  // );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {activeTab === "overview" && <Overview />}
      {["ngos", "donors", "volunteers"].includes(activeTab) && <UsersList />}
      {activeTab === "donations" && <DonationsList />}
      {activeTab === "settings" && <Settings />}
      {showConfirmDialog && <ConfirmDialog />}
      {showUserDetails && <UserDetailsModal user={showUserDetails} />}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default AdminDashboard;