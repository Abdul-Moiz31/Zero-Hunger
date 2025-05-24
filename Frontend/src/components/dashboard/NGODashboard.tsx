  import React, { useState, useEffect } from "react";
  import { useNGOContext } from "@/contexts/ngoContext";
  import {
    Users,
    Package2,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Filter,
    DollarSign,
    Eye,
  } from "lucide-react";
  import toast, { Toaster } from "react-hot-toast";
  

  // Use interfaces from the NGO context
 interface Volunteer {
  _id: string;
  title : string;
  email: string;
  contact_number: string;
  address: string;
  completedOrders: number;
  status: "Active" | "Inactive";
  joinedDate: string;
  organization_name: string; // Added
}

interface VolunteerFormProps {
  editingVolunteer: Volunteer | null;
  onSubmit: (data: { name: string; email: string; contact_number: string }, id?: string) => Promise<void>;
  onClose: () => void;
}

  interface Donation {
    id: string;
    donorName: string;
    quantity: number;
    date: string;
    status: "Pending" | "Completed" | "Cancelled";
    assignedVolunteer: string | null;
  }

 interface Activity {
  id: string;
  description: string;
  date: string;
  volunteerName: string | null; // Make nullable for claimed foods
  organizationName?: string; // Added for organization name
}

 interface Food {
  _id: string;
  title: string; // Changed from title to name
  quantity: number;
  quantity_unit: string;
  description: string;
  expiry_time: string;
  temperature_requirements: string;
  pickup_window_start: string;
  pickup_window_end: string;
  dietary_info: string;
  img: string;
  status: "Pending" | "Completed" | "Cancelled" | "assigned";
  acceptance_time: string;
  donorId: { name: string; email: string };
  volunteerId?: { name: string; email: string; _id: string };
}

  const NGODashboard = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showVolunteerForm, setShowVolunteerForm] = useState(false);
    const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(
      null
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
      "all" | "Active" | "Inactive"
    >("all");
    const [donationStatusFilter, setDonationStatusFilter] = useState<
      "all" | "Pending" | "Completed" | "Cancelled"
    >("all");
    const [foodStatusFilter, setFoodStatusFilter] = useState<"all" | "assigned">(
      "all"
    );
    const [error, setError] = useState<string | null>(null);

    // Replace with empty arrays instead of mock data
    const [donations, setDonations] = useState<Donation[]>([]);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

    // Get data from NGO context
    const {
      getNGOStats,
      getClaimedFoods,
      stats,
      getVolunteers,
      volunteers,
      claimedFoods,
      assignVolunteerToFood,
      deleteVolunteer,
      updateVolunteer, 
      addVolunteer,
      updateFoodStatus,
      deleteClaimedFood,
    } = useNGOContext();

    const filteredVolunteers = volunteers.filter((volunteer) => {
      const matchesSearch =
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || volunteer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const filteredDonations = donations.filter((donation) => {
      const matchesSearch = donation.donorName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        donationStatusFilter === "all" ||
        donation.status === donationStatusFilter;
      return matchesSearch && matchesStatus;
    });

    const filteredClaimedFoods = claimedFoods.filter((food) => {
      const matchesSearch =
        food.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        foodStatusFilter === "all" || food.status === foodStatusFilter;
      return matchesSearch && matchesStatus;
    });

    useEffect(() => {
      // Fetch NGO stats, volunteers, and claimed foods when component mounts
      getNGOStats();
      getVolunteers();
      getClaimedFoods();
    }, []);

    useEffect(() => {
  const activities: Activity[] = [];

  // Volunteer registrations
  volunteers.forEach((volunteer) => {
    activities.push({
      id: `volunteer-${volunteer._id}`,
      description: `New volunteer ${volunteer.name} registered with the organization`,
      date: volunteer.joinedDate,
      volunteerName: volunteer.name,
      organizationName: volunteer.organization_name, // Assuming this field exists
    });
  });

  // Claimed food donations
  claimedFoods.forEach((food) => {
    activities.push({
      id: `claimed-${food._id}`,
      description: `Food donation "${food.title || 'Unnamed Donation'}" claimed`,
      date: food.acceptance_time,
      volunteerName: null,
      organizationName: undefined, // No organization for claimed food
    });

    // Assigned donations
    if (food.volunteerId) {
      const assignedVolunteer = volunteers.find(v => v._id === food.volunteerId._id);
      activities.push({
        id: `assigned-${food._id}`,
        description: `Food donation "${food.title || 'Unnamed Donation'}" assigned to  ${food.volunteerId.name}`, 
        date: food.acceptance_time,
        volunteerName: food.volunteerId,
        organizationName: assignedVolunteer?.organization_name, 
      });
    }
  });

  // Sort by date (descending) and limit to 9
  const sortedActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 9);

  setRecentActivities(sortedActivities);
}, [volunteers, claimedFoods]);

    const handleAddVolunteer = async (data: { name: string; email: string; contact_number: string }, id?: string) => {
    try {
      if (id) {
        await updateVolunteer(id, data);
        toast.success("Volunteer updated successfully!", {
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
        await addVolunteer(data);
        toast.success("Volunteer added successfully!", {
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
      }
      setError(null);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to save volunteer";
      setError(message);
      throw new Error(message);
    }
  };

    const handleEditVolunteer = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setShowVolunteerForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this volunteer?")) {
      try {
        console.log("Attempting to delete volunteer with ID:", id);
        await deleteVolunteer(id);
        toast.success("Volunteer deleted successfully!", {
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
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to delete volunteer";
        console.error("Delete error:", err.response?.data || err.message);
        setError(errorMessage);
      }
    }
  };

    const handleCloseForm = () => {
    setShowVolunteerForm(false);
    setEditingVolunteer(null);
    setError(null);
  };

const handleAssignVolunteer = async (foodId: string, volunteerId: string) => {
    if (!volunteerId) {
      setError("Please select a volunteer to assign");
      toast.error("Please select a volunteer to assign", {
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
      return;
    }
    try {
      await assignVolunteerToFood(volunteerId, foodId);
      toast.success("Volunteer assigned successfully!", {
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
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to assign volunteer";
      setError(errorMessage);
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
  };

    const handleUpdateDonationStatus = (
      donationId: string,
      status: "Pending" | "Completed" | "Cancelled"
    ) => {
      console.log("Updating donation status:", donationId, status);
    };
    const handleUpdateFoodStatus = async (foodId: string, status: string) => {
    try {
      await updateFoodStatus(foodId, status);
      toast.success("Donation status updated successfully!", {
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
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update donation status";
      setError(errorMessage);
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
  };

  const handleDeleteClaimedFood = async (foodId: string) => {
    if (window.confirm("Are you sure you want to delete this claimed donation?")) {
      try {
        await deleteClaimedFood(foodId);
        toast.success("Claimed donation deleted successfully!", {
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
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to delete claimed donation";
        setError(errorMessage);
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
    }
  };

    const VolunteerForm: React.FC<VolunteerFormProps> = ({ editingVolunteer, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
  });

  useEffect(() => {
    if (editingVolunteer) {
      setFormData({
        name: editingVolunteer.name,
        email: editingVolunteer.email,
        contact_number: editingVolunteer.contact_number,
      });
    } else {
      setFormData({ name: "", email: "", contact_number: "" });
    }
  }, [editingVolunteer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData, editingVolunteer?._id);
      onClose();
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full animate-scaleIn">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">{editingVolunteer ? "Edit Volunteer" : "Add Volunteer"}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {editingVolunteer ? "Update Volunteer" : "Add Volunteer"}
            </button>
          </form>
        </div>
      </div>
    );
  };

    const VolunteersTable = () => (
    <div className="bg-white rounded-xl shadow-sm">
      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "Active" | "Inactive")
                }
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button
              onClick={() => setShowVolunteerForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Add Volunteer</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 font-semibold text-gray-600">Name</th>
                <th className="pb-3 font-semibold text-gray-600">Email</th>
                <th className="pb-3 font-semibold text-gray-600">Contact Number</th>
                <th className="pb-3 font-semibold text-gray-600">Status</th>
                <th className="pb-3 font-semibold text-gray-600">Completed Orders</th>
                <th className="pb-3 font-semibold text-gray-600">Joined Date</th>
                <th className="pb-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map((volunteer) => (
                  <tr
                    key={volunteer._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-green-600">
                            {volunteer.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <span className="font-medium">{volunteer.name}</span>
                      </div>
                    </td>
                    <td className="py-4">{volunteer.email}</td>
                    <td className="py-4">{volunteer.contact_number}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          volunteer.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {volunteer.status}
                      </span>
                    </td>
                    <td className="py-4">{volunteer.completedOrders}</td>
                    <td className="py-4">{new Date(volunteer.joinedDate).toLocaleDateString()}</td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVolunteer(volunteer)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit volunteer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(volunteer._id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete volunteer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    No volunteers found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

    const DonationsTable = () => (
    <div className="bg-white rounded-xl shadow-sm">
      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={foodStatusFilter}
              onChange={(e) =>
                setDonationStatusFilter(e.target.value as "all" | "Pending" | "Completed" | "Cancelled" )
              }
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="assigned">Assigned</option>
            </select>
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 font-semibold text-gray-600">Donor Name</th>
                <th className="pb-3 font-semibold text-gray-600">Quantity</th>
                <th className="pb-3 font-semibold text-gray-600">Pickup Time</th>
                <th className="pb-3 font-semibold text-gray-600">Pickup Location</th>
                <th className="pb-3 font-semibold text-gray-600">Status</th>
                <th className="pb-3 font-semibold text-gray-600">Assigned Volunteer</th>
                <th className="pb-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaimedFoods.length > 0 ? (
                filteredClaimedFoods.map((food) => (
                  <tr
                    key={food._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4">{food.donorId.name}</td>
                    <td className="py-4">{food.quantity} {food.quantity_unit}</td>
                    <td className="py-4">{new Date(food.pickup_window_start).toLocaleString()}</td>
                    <td className="py-4">{food.pickup_location || "N/A"}</td>
                    <td className="py-4">
                      <select
                        value={food.status}
                        onChange={(e) => handleUpdateFoodStatus(food._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          food.status === "assigned"
                            ? "bg-blue-100 text-blue-700"
                            : food.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : food.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        } focus:outline-none`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="assigned">Assigned</option>
                      </select>
                    </td>
                    <td className="py-4">
                      <select
                        value={food.volunteerId?._id || ""}
                        onChange={(e) => handleAssignVolunteer(food._id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Unassigned</option>
                        {volunteers.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleDeleteClaimedFood(food._id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete donation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    No claimed donations found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

    const ClaimedFoodsTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [selectedVolunteer, setSelectedVolunteer] = useState<string>("");

      return (
      <div className="bg-white rounded-xl shadow-sm">
        {isModalOpen && selectedFood && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full mx-auto">
              <div className="flex justify-between items-center bg-green-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  Food & Donor Details
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedVolunteer("");
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-48">
                  {selectedFood.img ? (
                    <img
                      src={selectedFood.img}
                      alt={selectedFood.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400">No Image Available</span>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">Title:</span>{" "}
                    {selectedFood.title || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Description:</span>{" "}
                    {selectedFood.description || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Quantity:</span>{" "}
                    {selectedFood.quantity} {selectedFood.quantity_unit}
                  </div>
                  <div>
                    <span className="font-semibold">Expiry:</span>{" "}
                    {new Date(selectedFood.expiry_time).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">Pickup Window:</span>{" "}
                    {new Date(selectedFood.pickup_window_start).toLocaleString()} -{" "}
                    {new Date(selectedFood.pickup_window_end).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedFood.status === "assigned"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedFood.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Accepted:</span>{" "}
                    {new Date(selectedFood.acceptance_time).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">Temperature:</span>{" "}
                    {selectedFood.temperature_requirements || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Dietary Info:</span>{" "}
                    {selectedFood.dietary_info || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Donor:</span>{" "}
                    {selectedFood.donorId?.name || "N/A"} ({selectedFood.donorId?.email || "N/A"})
                  </div>
                  <div>
                    <span className="font-semibold">Volunteer:</span>{" "}
                    {selectedFood.volunteerId?.name || "Unassigned"} (
                    {selectedFood.volunteerId?.email || "N/A"})
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign Volunteer
                    </label>
                    <select
                      value={selectedVolunteer}
                      onChange={(e) => setSelectedVolunteer(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Unassigned</option>
                      {volunteers.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (selectedVolunteer && selectedFood._id) {
                          handleAssignVolunteer(selectedFood._id, selectedVolunteer);
                        } else {
                          toast.error("Please select a volunteer");
                        }
                      }}
                      className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

           <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search claimed foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="relative">
              <select
                value={foodStatusFilter}
                onChange={(e) =>
                  setFoodStatusFilter(e.target.value as "all" | "assigned")
                }
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
              </select>
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 font-semibold text-gray-600">Title</th>
                  <th className="pb-3 font-semibold text-gray-600">Quantity</th>
                  <th className="pb-3 font-semibold text-gray-600">Description</th>
                  <th className="pb-3 font-semibold text-gray-600">Expiry Time</th>
                  <th className="pb-3 font-semibold text-gray-600">Pickup Window</th>
                  <th className="pb-3 font-semibold text-gray-600">Status</th>
                  <th className="pb-3 font-semibold text-gray-600">Acceptance Time</th>
                  <th className="pb-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaimedFoods.length > 0 ? (
                  filteredClaimedFoods.map((food) => (
                    <tr
                      key={food._id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4">{food.title}</td>
                      <td className="py-4">{food.quantity} {food.quantity_unit}</td>
                      <td className="py-4">{food.description}</td>
                      <td className="py-4">{new Date(food.expiry_time).toLocaleDateString()}</td>
                      <td className="py-4">
                        {new Date(food.pickup_window_start).toLocaleString()} - <br />
                        {new Date(food.pickup_window_end).toLocaleString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            food.status === "assigned"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {food.status}
                        </span>
                      </td>
                      <td className="py-4">{new Date(food.acceptance_time).toLocaleString()}</td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedFood(food);
                              setSelectedVolunteer(food.volunteerId?._id || "");
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View food details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClaimedFood(food._id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete claimed food"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-500">
                      No claimed foods found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

    const Dashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          icon={Users}
          title="Total Volunteers"
          stats={String(stats.totalVolunteers || 0)}
          trend="+3 from last week"
          trendUp={true}
        />
        <DashboardCard
          icon={Package2}
          title="Total Donations"
          stats={String(stats.total_donations || 0)}
          trend="+5 this month"
          trendUp={true}
        />
        <DashboardCard
          icon={DollarSign}
          title="Pending Donations"
          stats={String(stats.pendingDonations || 0)}
          trend="+2 this month"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
  {recentActivities.map((activity) => (
    <div
      key={activity.id}
      className="flex justify-between items-center border-b border-gray-100 pb-4"
    >
      <div>
        <p className="font-semibold">{activity.description}</p>
        <p className="text-sm text-gray-600">
          {activity.volunteerName
            ? `By ${activity.organizationName ? ` ${activity.organizationName}` : ''}`
            : 'By System'}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString()}</p>
      </div>
    </div>
  ))}
</div>
          ) : (
            <p className="text-center text-gray-500 py-6">No recent activities to display.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <QuickActionButton
              label="View All Donations"
              color="blue"
              onClick={() => setActiveTab("donations")}
            />
            <QuickActionButton
              label="Manage Volunteers"
              color="green"
              onClick={() => setActiveTab("volunteers")}
            />
            <QuickActionButton
              label="View Claimed Foods"
              color="purple"
              onClick={() => setActiveTab("claimedFoods")}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6 p-6">
      <Toaster />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">NGO Dashboard</h1>
        <div className="flex space-x-4">
          <TabButton label="Overview" isActive={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <TabButton
            label="Manage Volunteers"
            isActive={activeTab === "volunteers"}
            onClick={() => setActiveTab("volunteers")}
          />
          <TabButton label="Donations" isActive={activeTab === "donations"} onClick={() => setActiveTab("donations")} />
          <TabButton
            label="Claimed Foods"
            isActive={activeTab === "claimedFoods"}
            onClick={() => setActiveTab("claimedFoods")}
          />
        </div>
      </div>
      {activeTab === "dashboard" ? (
        <Dashboard />
      ) : activeTab === "volunteers" ? (
        <VolunteersTable />
      ) : activeTab === "donations" ? (
        <DonationsTable />
      ) : (
        <ClaimedFoodsTable />
      )}
      {showVolunteerForm && (
        <VolunteerForm
          editingVolunteer={editingVolunteer}
          onSubmit={handleAddVolunteer}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

const DashboardCard = ({
  icon: Icon,
  title,
  stats,
  trend,
  trendUp,
}: {
  icon: React.ElementType;
  title: string;
  stats: string | { label: string; value: string }[];
  trend: string;
  trendUp: boolean;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-4">
      <div className="bg-green-100 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Array.isArray(stats) ? (
          <ul className="text-2xl font-bold text-gray-800">
            {stats.map((stat, index) => (
              <li key={index}>
                {stat.label}: {stat.value}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-2xl font-bold text-gray-800">{stats}</p>
        )}
        <p className={`text-sm ${trendUp ? "text-green-600" : "text-gray-600"}`}>{trend}</p>
      </div>
    </div>
  </div>
);

const QuickActionButton = ({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "blue" | "green" | "purple";
  onClick: () => void;
}) => {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-500",
    green: "bg-green-600 hover:bg-green-500",
    purple: "bg-purple-600 hover:bg-purple-500",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${colors[color]}`}
    >
      {label}
    </button>
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
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
      isActive
        ? "bg-green-600 text-white shadow-md hover:bg-green-500"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default NGODashboard;