/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useDonorContext } from "@/contexts/donorContext";
import {
  Package2,
  Clock,
  CheckCircle,
  Plus,
  X,
  Calendar,
  Clock3,
  Trash2, 
  XCircle
} from "lucide-react";
import axios from "axios";

interface FoodListing {
  id: string;
  title: string;
  description: string;
  quantity: number;
  quantity_unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  status: "available" | "assigned" | "completed" | "cancelled";
  temperature_requirements?: string;
  dietary_info?: string;
}

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showDonationForm, setShowDonationForm] = useState(false);
  // const [donations, setDonations] = useState<FoodListing[]>([]);
  const statusOptions = ["available", "assigned", "completed", "cancelled"];
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    quantity: string;
    quantity_unit: string;
    expiry_time: string;
    pickup_window_start: string;
    pickup_window_end: string;
    temperature_requirements: string;
    dietary_info: string;
    img: File | null;
  }>({
    title: "",
    description: "",
    quantity: "",
    quantity_unit: "meals",
    expiry_time: "",
    pickup_window_start: "",
    pickup_window_end: "",
    temperature_requirements: "",
    dietary_info: "",
    img: null,
  });

  const {
    stats,
    donations,
    getDonorStats,
    getMyDonations,
    deleteDonation,
    updateDonationStatus,
  } = useDonorContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
const formPayload = new FormData();
formPayload.append('title', formData.title);
formPayload.append('description', formData.description);
formPayload.append('quantity', formData.quantity);
formPayload.append('unit', formData.quantity_unit);
formPayload.append('expiry_time', formData.expiry_time);
formPayload.append('pickup_window_start', formData.pickup_window_start);
formPayload.append('pickup_window_end', formData.pickup_window_end);
formPayload.append('temperature_requirements', formData.temperature_requirements);
formPayload.append('dietary_info', formData.dietary_info);
if (formData.img) {
  formPayload.append('image', formData.img);
}

try {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/donor/donate`,
    formPayload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );
  console.log('Donation created successfully', response.data);
} catch (error) {
  console.error('Error uploading donation:', error);
}

      // Refresh donations list after successful submission
      getMyDonations();
      setShowDonationForm(false);

      // Reset form data
      setFormData({
        title: "",
        description: "",
        quantity: "",
        quantity_unit: "meals",
        expiry_time: "",
        pickup_window_start: "",
        pickup_window_end: "",
        temperature_requirements: "",
        dietary_info: "",
        img: null,
      });
    } catch (err) {
      console.error("Error uploading donation:", err);
      alert("Failed to create donation. Please try again.");
    }
  };

  useEffect(() => {
    getDonorStats();
    getMyDonations();
  }, []);

  const DonationForm = () => (
    
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
  <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-2xl animate-scaleIn overflow-y-auto max-h-[90vh]">
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <h3 className="text-lg sm:text-xl font-semibold">Create New Donation</h3>
      <button
        onClick={() => setShowDonationForm(false)}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>

    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              required
            />
            <select
              value={formData.quantity_unit}
              onChange={(e) =>
                setFormData({ ...formData, quantity_unit: e.target.value })
              }
              className="sm:w-32 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="meals">Meals</option>
              <option value="kg">Kilograms</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Time
          </label>
          <input
            type="datetime-local"
            value={formData.expiry_time}
            onChange={(e) =>
              setFormData({ ...formData, expiry_time: e.target.value })
            }
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature Requirements
          </label>
          <input
            type="text"
            value={formData.temperature_requirements}
            onChange={(e) =>
              setFormData({
                ...formData,
                temperature_requirements: e.target.value,
              })
            }
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            placeholder="e.g., Refrigerated, Room temperature"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Window Start
          </label>
          <input
            type="datetime-local"
            value={formData.pickup_window_start}
            onChange={(e) =>
              setFormData({
                ...formData,
                pickup_window_start: e.target.value,
              })
            }
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Window End
          </label>
          <input
            type="datetime-local"
            value={formData.pickup_window_end}
            onChange={(e) =>
              setFormData({
                ...formData,
                pickup_window_end: e.target.value,
              })
            }
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dietary Information
          </label>
          <input
            type="text"
            value={formData.dietary_info}
            onChange={(e) =>
              setFormData({ ...formData, dietary_info: e.target.value })
            }
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            placeholder="e.g., Vegetarian, Contains nuts"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setFormData({ ...formData, img: e.target.files[0] });
            }
          }}
          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-3 sm:space-y-0">
        <button
          type="button"
          onClick={() => setShowDonationForm(false)}
          className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Create Donation
        </button>
      </div>
    </form>
  </div>
</div>

  );

  const Overview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          icon={Package2}
          title="Total Donations"
          stats={[
            { label: "Total Donations", value: String(stats.totalDonations) },
          ]}
          trend="+3 this week"
          trendUp={true}
        />
        <DashboardCard
          icon={Clock}
          title="Pending Pickups"
          stats={[
            { label: "Pending Pickups", value: String(stats.pendingDonations) },
          ]}
          trend="2 expiring soon"
          trendUp={false}
        />
        <DashboardCard
          icon={CheckCircle}
          title="Completed"
          stats={[
            {
              label: "Completed Donations",
              value: String(stats.completedDonations),
            },
          ]}
          trend="+12% this month"
          trendUp={true}
        />
      </div>
  
      <div className="w-full mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Recent Donations
          </h2>
          <div className="space-y-5">
            {donations.slice(0, 5).map((donation) => (
              <div
                key={donation.id}
                className="flex items-start justify-between border-b pb-4 last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-xl">
                    <Package2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {donation.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {donation.quantity} {donation.quantity_unit || "items"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(
                          donation.pickupWindow || donation.pickup_window_start
                        ).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock3 className="w-4 h-4 mr-1" />
                        {new Date(
                          donation.pickupWindow || donation.pickup_window_start
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    donation.status === "available"
                      ? "bg-green-100 text-green-700"
                      : donation.status === "assigned"
                      ? "bg-blue-100 text-blue-700"
                      : donation.status === "completed"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {donation.status.charAt(0).toUpperCase() +
                    donation.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
  

  const DonationsList = () => {
    const [editingStatusId, setEditingStatusId] = useState(null);
  
    const handleStatusChange = (id: string, newStatus: string) => {
      updateDonationStatus(id, newStatus);
      setEditingStatusId(null);
    };
  
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Donations</h2>
          <button
            onClick={() => setShowDonationForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition duration-300 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New Donation</span>
          </button>
        </div>
  
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Quantity</th>
                <th className="p-4 text-left">Pickup Window</th>
                <th className="p-4 text-left">Expiry Time</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr
                  key={donation._id}
                  className="border-t hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-4 py-3">{donation.title}</td>
                  <td className="px-4 py-3">
                    {donation.quantity} {donation.unit || "items"}
                  </td>
                  <td className="px-4 py-3">
                    {donation.pickupWindow
                      ? donation.pickupWindow
                      : `${new Date(
                          donation.pickup_window_start
                        ).toLocaleString()} - ${new Date(
                          donation.pickup_window_end
                        ).toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(
                      donation.expiryTime || donation.expiry_time
                    ).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={donation.status}
                      onChange={(e) =>
                        handleStatusChange(donation._id, e.target.value)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        donation.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : donation.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : donation.status === "assigned"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <button
                      onClick={() => deleteDonation(donation._id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {/* <button
                      onClick={() => editDonation(donation)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5" />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Donor Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
              activeTab === "overview"
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("donations")}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
              activeTab === "donations"
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            My Donations
          </button>
        </div>
      </div>

      {activeTab === "overview" ? <Overview /> : <DonationsList />}
      {showDonationForm && <DonationForm />}
    </div>
  );
};

const DashboardCard = ({
  icon: Icon,
  title,
  stats = [],
  trend,
  trendUp,
}: {
  icon: React.ElementType;
  title: string;
  stats: { label: string; value: string }[];
  trend: string;
  trendUp: boolean;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center space-x-3 mb-6">
      <div className="bg-green-100 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="space-y-4">
      {stats.length > 0 ? (
        stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-gray-600">{stat.label}</span>
            <span className="font-semibold">{stat.value}</span>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No stats available</p>
      )}
      {trend && (
        <p
          className={`text-sm ${trendUp ? "text-green-600" : "text-gray-600"}`}
        >
          {trend}
        </p>
      )}
    </div>
  </div>
);

export default DonorDashboard;
