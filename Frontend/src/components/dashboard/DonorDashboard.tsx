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
  Bell,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

// Define interfaces based on context
interface Donation {
  _id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  status: "available" | "assigned" | "completed";
  temperature_requirements?: string;
  dietary_info?: string;
  img?: string;
  pickup_location?: string;
  createdAt?: string;
}

interface Notification {
  _id: string;
  recipientId: string;
  message: string;
  taskId: { _id: string; title: string };
  read: boolean;
  createdAt: string;
}

interface DonorStats {
  totalDonations: number;
  pendingDonations: number;
  completedDonations: number;
}

interface FormData {
  title: string;
  description: string;
  quantity: string;
  unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  temperature_requirements: string;
  dietary_info: string;
  pickup_location: string;
  img?: File | null;
}

type DonationFields = FormData;

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
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Partial<FormData> = {};
    const now = new Date();
    const expiry = new Date(formData.expiry_time);
    const pickupStart = new Date(formData.pickup_window_start);
    const pickupEnd = new Date(formData.pickup_window_end);

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.quantity || Number(formData.quantity) <= 0)
      errors.quantity = "Quantity must be a positive number";
    if (!formData.unit) errors.unit = "Unit is required";
    if (!formData.expiry_time) errors.expiry_time = "Expiry time is required";
    else if (expiry <= now)
      errors.expiry_time = "Expiry time must be in the future";
    if (!formData.pickup_window_start)
      errors.pickup_window_start = "Pickup start time is required";
    else if (pickupStart <= now)
      errors.pickup_window_start = "Pickup start time must be in the future";
    if (!formData.pickup_window_end)
      errors.pickup_window_end = "Pickup end time is required";
    else if (pickupEnd <= pickupStart)
      errors.pickup_window_end = "Pickup end time must be after start time";
    if (!formData.pickup_location.trim())
      errors.pickup_location = "Pickup location is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(e, formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg sm:max-w-2xl animate-scaleIn overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">
            Create New Donation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close donation form"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className={`w-full p-2 border ${
                  formErrors.title ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                required
                disabled={isSubmitting}
              />
              {formErrors.title && (
                <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
              )}
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
                  className={`flex-1 p-2 border ${
                    formErrors.quantity ? "border-red-500" : "border-gray-300"
                  } rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  required
                  min="1"
                  disabled={isSubmitting}
                />
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                  className={`w-full sm:w-32 p-2 border ${
                    formErrors.unit ? "border-red-500" : "border-gray-300"
                  } rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  disabled={isSubmitting}
                >
                  <option value="meals">Meals</option>
                  <option value="kg">Kilograms</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>
              {formErrors.quantity && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.quantity}
                </p>
              )}
              {formErrors.unit && (
                <p className="text-red-500 text-xs mt-1">{formErrors.unit}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className={`w-full p-2 border ${
                  formErrors.description ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                rows={3}
                required
                disabled={isSubmitting}
              />
              {formErrors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.description}
                </p>
              )}
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
                className={`w-full p-2 border ${
                  formErrors.expiry_time ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                required
                min={new Date().toISOString().slice(0, 16)}
                disabled={isSubmitting}
              />
              {formErrors.expiry_time && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.expiry_time}
                </p>
              )}
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
                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSubmitting}
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
                className={`w-full p-2 border ${
                  formErrors.pickup_window_start
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                required
                min={new Date().toISOString().slice(0, 16)}
                disabled={isSubmitting}
              />
              {formErrors.pickup_window_start && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.pickup_window_start}
                </p>
              )}
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
                className={`w-full p-2 border ${
                  formErrors.pickup_window_end
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                required
                min={
                  formData.pickup_window_start ||
                  new Date().toISOString().slice(0, 16)
                }
                disabled={isSubmitting}
              />
              {formErrors.pickup_window_end && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.pickup_window_end}
                </p>
              )}
            </div>

            {/* Dietary Info */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Information
              </label>
              <input
                type="text"
                name="dietary_info"
                value={formData.dietary_info}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Pickup Location */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleFormChange}
                className={`w-full p-2 border ${
                  formErrors.pickup_location
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                required
                disabled={isSubmitting}
              />
              {formErrors.pickup_location && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.pickup_location}
                </p>
              )}
            </div>

            {/* File Upload */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm sm:text-base disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Donation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "donations">(
    "overview"
  );
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    stats,
    donations,
    notifications,
    getDonorStats,
    setDonations,
    getMyDonations,
    deleteDonation,
    updateDonationStatus,
    getNotifications,
    markNotificationAsRead,
  } = useDonorContext();

  const initialFormData: FormData = {
    title: "",
    description: "",
    quantity: "",
    unit: "meals",
    expiry_time: "",
    pickup_window_start: "",
    pickup_window_end: "",
    temperature_requirements: "",
    dietary_info: "",
    pickup_location: "",
    img: null,
  };

  const statusOptions = ["available", "assigned", "completed"] as const;

  const handleSubmit = useCallback(
    async (e: React.FormEvent, formData: FormData) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const submissionData = new FormData();
        submissionData.append("title", formData.title);
        submissionData.append("description", formData.description);
        submissionData.append("quantity", formData.quantity);
        submissionData.append("unit", formData.unit);
        submissionData.append("expiry_time", formData.expiry_time);
        submissionData.append(
          "pickup_window_start",
          formData.pickup_window_start
        );
        submissionData.append("pickup_window_end", formData.pickup_window_end);
        submissionData.append(
          "temperature_requirements",
          formData.temperature_requirements || ""
        );
        submissionData.append("dietary_info", formData.dietary_info || "");
        submissionData.append("pickup_location", formData.pickup_location);
        if (formData.img) {
          submissionData.append("img", formData.img);
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/donor/donate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: submissionData,
            credentials: "include",
          }
        );

        if (response.status === 201) {
          const data = await response.json();
          setDonations((prev) => [data.food, ...prev]);
          setShowDonationForm(false);
          toast.success("Donation created successfully!", {
            duration: 3000,
            position: "top-right",
            style: {
              background: "#16a34a",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create donation");
        }
      } catch (err: any) {
        console.error("Error uploading donation:", err);
        const errorMessage =
          err.message || "Failed to create donation. Please try again.";
        toast.error(errorMessage, {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#dc2626",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        });
      }
    },
    [setDonations]
  );

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        setError(null);
        await Promise.all([
          getDonorStats(),
          getMyDonations(),
          getNotifications(),
        ]);
      } catch (err: any) {
        console.error("Error fetching donor data:", err);
        const errorMessage =
          err.message || "Failed to load data. Please try again.";
        if (err.response?.status === 401 && retryCount < 1) {
          return fetchData(retryCount + 1);
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getDonorStats, getMyDonations, getNotifications]);

  const Overview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard
          icon={Package2}
          title="Total Donations"
          stats={[
            {
              label: "Total Donations",
              value: String(stats.totalDonations || 0),
            },
          ]}
          trend="+3 this week"
          trendUp={true}
        />
        <DashboardCard
          icon={Clock}
          title="Pending Pickups"
          stats={[
            {
              label: "Pending Pickups",
              value: String(stats.pendingDonations || 0),
            },
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
              value: String(stats.completedDonations || 0),
            },
          ]}
          trend="+12% this month"
          trendUp={true}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Recent Donations
        </h2>
        <div className="space-y-4">
          {donations.slice(0, 10).map((donation: Donation) => (
            <div
              key={donation._id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 last:border-b-0 gap-4"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Package2 className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {donation.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {donation.quantity} {donation.unit}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mt-1">
                    <span className="flex items-center">
                      <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      {new Date(
                        donation.pickup_window_start
                      ).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock3 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      {new Date(
                        donation.pickup_window_start
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Karachi",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
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
          {donations.length === 0 && (
            <p className="text-gray-500 text-center py-4 text-sm sm:text-base">
              No recent donations available.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const DonationsList = () => {
    const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleStatusChange = async (id: string, newStatus: string) => {
      setActionLoading(id);
      try {
        await updateDonationStatus(id, newStatus);
      } catch (err: any) {
        console.error("Error updating status:", err);
        toast.error("Failed to update donation status.", {
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setActionLoading(null);
        setEditingStatusId(null);
      }
    };

    const handleDelete = async (id: string) => {
      setActionLoading(id);
      try {
        await deleteDonation(id);
      } catch (err: any) {
        console.error("Error deleting donation:", err);
        toast.error("Failed to delete donation.", {
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setActionLoading(null);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            All Donations
          </h2>
          <button
            onClick={() => setShowDonationForm(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition duration-300 text-sm sm:text-base"
            aria-label="Create new donation"
          >
            <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>New Donation</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-[640px] w-full bg-white text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th scope="col" className="p-3 sm:p-4 text-left">
                  Title
                </th>
                <th scope="col" className="p-3 sm:p-4 text-left">
                  Quantity
                </th>
                <th scope="col" className="p-3 sm:p-4 text-left">
                  Pickup Window
                </th>
                <th scope="col" className="p-3 sm:p-4 text-left">
                  Expiry Time
                </th>
                <th scope="col" className="p-3 sm:p-4 text-left">
                  Pickup Location
                </th>
                <th scope="col" className="p-3 sm:p-4 text-left">
                  Status
                </th>
                <th scope="col" className="p-3 sm:p-4 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation: Donation) => (
                <tr
                  key={donation._id}
                  className="border-t hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {donation.title}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {donation.quantity} {donation.unit}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {`${new Date(donation.pickup_window_start).toLocaleString(
                      [],
                      { timeZone: "Asia/Karachi" }
                    )} - ${new Date(donation.pickup_window_end).toLocaleString(
                      [],
                      { timeZone: "Asia/Karachi" }
                    )}`}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {new Date(donation.expiry_time).toLocaleString([], {
                      timeZone: "Asia/Karachi",
                    })}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {donation.pickup_location}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <select
                      value={donation.status}
                      onChange={(e) => {
                        setEditingStatusId(donation._id);
                        handleStatusChange(donation._id, e.target.value);
                      }}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        donation.status === "available"
                          ? "bg-green-100 text-green-700"
                          : donation.status === "assigned"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      disabled={actionLoading === donation._id}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <button
                      onClick={() => handleDelete(donation._id)}
                      className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                      title="Delete donation"
                      aria-label={`Delete donation ${donation.title}`}
                      disabled={actionLoading === donation._id}
                    >
                      <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {donations.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-center text-gray-500 text-sm sm:text-base"
                  >
                    No donations available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const NotificationsDropdown = () => {
    const handleMarkAsRead = async (id: string) => {
      try {
        await markNotificationAsRead(id);
      } catch (err: any) {
        console.error("Error marking notification as read:", err);
        toast.error("Failed to mark notification as read.", {
          duration: 3000,
          position: "top-right",
        });
      }
    };

    return (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          <button
            onClick={() => setShowNotifications(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center text-sm">
              No notifications available.
            </p>
          ) : (
            notifications.map((notification: Notification) => (
              <div
                key={notification._id}
                className={`p-3 rounded-lg border ${
                  notification.read ? "bg-gray-50" : "bg-blue-50"
                }`}
              >
                <p
                  className={`text-sm ${
                    notification.read
                      ? "text-gray-600"
                      : "text-gray-800 font-medium"
                  }`}
                >
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString([], {
                    timeZone: "Asia/Karachi",
                  })}
                </p>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const styles = `
    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out;
    }
    @keyframes scaleIn {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600">
        {error}
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            Promise.all([
              getDonorStats(),
              getMyDonations(),
              getNotifications(),
            ]).catch((err: any) => {
              setError(err.message || "Failed to load data. Please try again.");
              setIsLoading(false);
            });
          }}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter(
    (notif: Notification) => !notif.read
  ).length;

  return (
    <div className="p-4 sm:p-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Donor Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition duration-300 text-sm sm:text-base ${
                activeTab === "overview"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-300"
              }`}
              aria-label="Switch to Overview tab"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("donations")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition duration-300 text-sm sm:text-base ${
                activeTab === "donations"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-300"
              }`}
              aria-label="Switch to My Donations tab"
            >
              My Donations
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-200 transition duration-300 relative"
              aria-label={`Toggle notifications (${unreadCount} unread)`}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && <NotificationsDropdown />}
          </div>
        </div>
      </div>

      {activeTab === "overview" ? <Overview /> : <DonationsList />}
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
  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
    <div className="flex items-center space-x-3 mb-4 sm:mb-6">
      <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
        <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
        {title}
      </h3>
    </div>
    <div className="space-y-3 sm:space-y-4">
      {stats.length > 0 ? (
        stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-gray-600 text-sm sm:text-base">
              {stat.label}
            </span>
            <span className="font-semibold text-sm sm:text-base">
              {stat.value}
            </span>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm sm:text-base">No stats available</p>
      )}
      {trend && (
        <p
          className={`text-xs sm:text-sm ${
            trendUp ? "text-green-600" : "text-gray-600"
          }`}
        >
          {trend}
        </p>
      )}
    </div>
  </div>
);

export default DonorDashboard;
