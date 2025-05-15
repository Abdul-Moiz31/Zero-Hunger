import React, { useState, useEffect } from 'react';
import { useNGOContext } from '@/contexts/ngoContext';
import { Users, Package2, MapPin, Plus, Pencil, Trash2, X, Search, Filter, DollarSign } from 'lucide-react';

// Use interfaces from the NGO context
interface Volunteer {
  id: string;
  name: string;
  email: string;
  contact_number: string;
  address: string;
  completedOrders: number;
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  assignedVolunteer: string | null;
}

interface Activity {
  id: string;
  description: string;
  date: string;
  volunteerName: string;
}

interface Food {
  _id: string;
  title: string;
  quantity: number;
  quantity_unit: string;
  description: string;
  expiry_time: string;
  temperature_requirements: string;
  pickup_window_start: string;
  pickup_window_end: string;
  dietary_info: string;
  img: string;
  status: string;
  acceptance_time: string;
}

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [donationStatusFilter, setDonationStatusFilter] = useState<'all' | 'Pending' | 'Completed' | 'Cancelled'>('all');
  const [foodStatusFilter, setFoodStatusFilter] = useState<'all' | 'assigned'>('all');

  // Replace with empty arrays instead of mock data
  const [donations, setDonations] = useState<Donation[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Get data from NGO context
  const { getNGOStats, getClaimedFoods, stats, getVolunteers, volunteers, claimedFoods } = useNGOContext();

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = donationStatusFilter === 'all' || donation.status === donationStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredClaimedFoods = claimedFoods.filter(food => {
    const matchesSearch = food.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = foodStatusFilter === 'all' || food.status === foodStatusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    // Fetch NGO stats, volunteers, and claimed foods when component mounts
    getNGOStats();
    getVolunteers();
    getClaimedFoods();
  }, []);

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVolunteer) {
      console.log("Editing volunteer:", editingVolunteer.id, formData);
    } else {
      console.log("Adding new volunteer:", formData);
    }
    handleCloseForm();
  };

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      contact_number: volunteer.contact_number,
      address: volunteer.address
    });
    setShowVolunteerForm(true);
  };

  const handleDeleteVolunteer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      console.log("Deleting volunteer:", id);
    }
  };

  const handleCloseForm = () => {
    setShowVolunteerForm(false);
    setEditingVolunteer(null);
    setFormData({ name: '', email: '', contact_number: '', address: '' });
  };

  const handleAssignVolunteer = (donationId: string, volunteerId: string) => {
    console.log("Assigning volunteer:", volunteerId, "to donation:", donationId);
  };

  const handleUpdateDonationStatus = (donationId: string, status: 'Pending' | 'Completed' | 'Cancelled') => {
    console.log("Updating donation status:", donationId, status);
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    address: ''
  });

  const VolunteerForm = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full animate-scaleIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {editingVolunteer ? 'Edit Volunteer' : 'Add New Volunteer'}
          </h3>
          <button 
            onClick={handleCloseForm}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleAddVolunteer} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {editingVolunteer ? 'Update Volunteer' : 'Add Volunteer'}
          </button>
        </form>
      </div>
    </div>
  );

  const VolunteersTable = () => (
    <div className="bg-white rounded-xl shadow-sm">
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Active' | 'Inactive')}
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
                  <tr key={volunteer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        volunteer.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
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
                          onClick={() => handleDeleteVolunteer(volunteer.id)}
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
              value={donationStatusFilter}
              onChange={(e) => setDonationStatusFilter(e.target.value as 'all' | 'Pending' | 'Completed' | 'Cancelled')}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 font-semibold text-gray-600">Donor Name</th>
                <th className="pb-3 font-semibold text-gray-600">Amount</th>
                <th className="pb-3 font-semibold text-gray-600">Date</th>
                <th className="pb-3 font-semibold text-gray-600">Status</th>
                <th className="pb-3 font-semibold text-gray-600">Assigned Volunteer</th>
                <th className="pb-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">{donation.donorName}</td>
                    <td className="py-4">PKR {donation.amount}</td>
                    <td className="py-4">{new Date(donation.date).toLocaleDateString()}</td>
                    <td className="py-4">
                      <select
                        value={donationpeat.status}
                        onChange={(e) => handleUpdateDonationStatus(donation.id, e.target.value as 'Pending' | 'Completed' | 'Cancelled')}
                        className="px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4">
                      <select
                        value={volunteers.find(v => v.name === donation.assignedVolunteer)?.id || ''}
                        onChange={(e) => handleAssignVolunteer(donation.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-200 focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {volunteers.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => console.log("Delete donation:", donation.id)}
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
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No donations found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ClaimedFoodsTable = () => (
    <div className="bg-white rounded-xl shadow-sm">
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
              onChange={(e) => setFoodStatusFilter(e.target.value as 'all' | 'assigned')}
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
              </tr>
            </thead>
            <tbody>
              {filteredClaimedFoods.length > 0 ? (
                filteredClaimedFoods.map((food) => (
                  <tr key={food._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">{food.title}</td>
                    <td className="py-4">{food.quantity} {food.quantity_unit}</td>
                    <td className="py-4">{food.description}</td>
                    <td className="py-4">{new Date(food.expiry_time).toLocaleDateString()}</td>
                    <td className="py-4">
                      {new Date(food.pickup_window_start).toLocaleString()} - <br />
                      {new Date(food.pickup_window_end).toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        food.status === 'assigned'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {food.status}
                      </span>
                    </td>
                    <td className="py-4">{new Date(food.acceptance_time).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
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

  const Dashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          icon={Users}
          title="Total Volunteers"
          stats={String(stats.Volunteers || 0)}
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
          stats={String(stats.completedDonations || 0)}
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
                <div key={activity.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <p className="font-semibold">{activity.description}</p>
                    <p className="text-sm text-gray-600">By {activity.volunteerName}</p>
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
              onClick={() => setActiveTab('donations')}
            />
            <QuickActionButton
              label="Manage Volunteers"
              color="green"
              onClick={() => setActiveTab('volunteers')}
            />
            <QuickActionButton
              label="View Claimed Foods"
              color="purple"
              onClick={() => setActiveTab('claimedFoods')}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">NGO Dashboard</h1>
        <div className="flex space-x-4">
          <TabButton
            label="Overview"
            isActive={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <TabButton
            label="Manage Volunteers"
            isActive={activeTab === 'volunteers'}
            onClick={() => setActiveTab('volunteers')}
          />
          <TabButton
            label="Donations"
            isActive={activeTab === 'donations'}
            onClick={() => setActiveTab('donations')}
          />
          <TabButton
            label="Claimed Foods"
            isActive={activeTab === 'claimedFoods'}
            onClick={() => setActiveTab('claimedFoods')}
          />
        </div>
      </div>
      
      {activeTab === 'dashboard' ? (
        <Dashboard />
      ) : activeTab === 'volunteers' ? (
        <VolunteersTable />
      ) : activeTab === 'donations' ? (
        <DonationsTable />
      ) : (
        <ClaimedFoodsTable />
      )}
      {showVolunteerForm && <VolunteerForm />}
    </div>
  );
};

const DashboardCard = ({ 
  icon: Icon, 
  title, 
  stats, 
  trend,
  trendUp 
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
        <p className={`text-sm ${trendUp ? 'text-green-600' : 'text-gray-600'}`}>
          {trend}
        </p>
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ 
  label, 
  color, 
  onClick 
}: { 
  label: string;
  color: 'blue' | 'green' | 'purple';
  onClick: () => void;
}) => {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-500',
    green: 'bg-green-600 hover:bg-green-500',
    purple: 'bg-purple-600 hover:bg-purple-500'
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
  onClick 
}: { 
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
      isActive 
        ? 'bg-green-600 text-white shadow-md hover:bg-green-500' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

export default NGODashboard;