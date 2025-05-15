/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
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
  XCircle,
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
  pickup_location?: string;
}

// Define form data interface
interface FormData {
  title: string;
  description: string;
  quantity: string;
  quantity_unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  temperature_requirements: string;
  dietary_info: string;
  pickup_location: string;
  img?: File | null;
}

type DonationFields = {
  title: string;
  description: string;
  quantity: string;
  quantity_unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  temperature_requirements: string;
  dietary_info: string;
  pickup_location: string;
  img?: File | null;
};

const DonationForm = ({
  onClose,
  onSubmit,
  initialFormData,
}: {
  onClose: () => void;
  onSubmit: (e: React.FormEvent, formData: FormData) => Promise<void>;
  initialFormData: DonationFields;
}) => {
  const [formData, setFormData] = useState<DonationFields>(initialFormData);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        img: e.target.files![0],
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("quantity", formData.quantity);
    data.append("unit", formData.quantity_unit);
    data.append("expiry_time", formData.expiry_time);
    data.append("pickup_window_start", formData.pickup_window_start);
    data.append("pickup_window_end", formData.pickup_window_end);
    data.append("temperature_requirements", formData.temperature_requirements);
    data.append("dietary_info", formData.dietary_info);
    data.append("pickup_location", formData.pickup_location);

    if (formData.img) {
      data.append("img", formData.img);
    }

    onSubmit(e, data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-2xl animate-scaleIn overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold">
            Create New Donation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* All fields remain the same */}
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>

            {/* Quantity & Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm"
                  required
                />
                <select
                  name="quantity_unit"
                  value={formData.quantity_unit}
                  onChange={handleFormChange}
                  className="sm:w-32 w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="meals">Meals</option>
                  <option value="kg">Kilograms</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                rows={3}
                required
              />
            </div>

            {/* Date Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Time
              </label>
              <input
                type="datetime-local"
                name="expiry_time"
                value={formData.expiry_time}
                onChange={handleFormChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature Requirements
              </label>
              <input
                type="text"
                name="temperature_requirements"
                value={formData.temperature_requirements}
                onChange={handleFormChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Window Start
              </label>
              <input
                type="datetime-local"
                name="pickup_window_start"
                value={formData.pickup_window_start}
                onChange={handleFormChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Window End
              </label>
              <input
                type="datetime-local"
                name="pickup_window_end"
                value={formData.pickup_window_end}
                onChange={handleFormChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>

            {/* Dietary Info */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Information
              </label>
              <input
                type="text"
                name="dietary_info"
                value={formData.dietary_info}
                onChange={handleFormChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          {/* Location Info */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
               Pickup Location
              </label>
              <input
                type="text"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleFormChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>


          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Create Donation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showDonationForm, setShowDonationForm] = useState(false);
  // const [donations, setDonations] = useState<FoodListing[]>([]);
  const statusOptions = ["available", "assigned", "completed"];
  const [isLoading, setIsLoading] = useState(false);

  const initialFormData: FormData = {
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
    pickup_location:""
  };

  const {
    stats,
    donations,
    getDonorStats,
    getMyDonations,
    deleteDonation,
    updateDonationStatus,
  } = useDonorContext();

  const handleSubmit = useCallback(
    async (e: React.FormEvent, formData: FormData) => {
      e.preventDefault();

      try {
        try {
          const token = localStorage.getItem("token");

          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/donor/donate`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
          console.log("Donation created successfully", response.data);
        } catch (error) {
          console.error("Error uploading donation:", error);
        }

        // Refresh donations list after successful submission
        getMyDonations();
        setShowDonationForm(false);
      } catch (err) {
        console.error("Error uploading donation:", err);
        alert("Failed to create donation. Please try again.");
      }
    },
    [getMyDonations]
  );

  useEffect(() => {
    getDonorStats();
    getMyDonations();
  }, []);

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

  const DonationsList = useCallback(() => {
    const [editingStatusId, setEditingStatusId] = useState(null);

    const handleStatusChange = async (id, newStatus) => {
      await updateDonationStatus(id, newStatus);
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
                <th className="p-4 text-left">Pickup Location</th>
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
                    {donation.quantity}{" "}
                    {donation.unit || donation.quantity_unit || "items"}
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
                    {
                      donation.pickup_location
                  }
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [donations, deleteDonation, updateDonationStatus, statusOptions]);

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
      {/* Render form conditionally */}
      {showDonationForm && (
        <DonationForm
          onClose={() => setShowDonationForm(false)}
          onSubmit={handleSubmit}
          initialFormData={initialFormData}
        />
      )}
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
