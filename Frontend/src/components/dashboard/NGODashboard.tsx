import React, { useState, useEffect } from 'react';
import { useNGOContext } from '@/contexts/ngoContext';
import { Users, Package2, MapPin, Plus, Pencil, Trash2, X, Search, Filter, DollarSign } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
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

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [donationStatusFilter, setDonationStatusFilter] = useState<'all' | 'Pending' | 'Completed' | 'Cancelled'>('all');

  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    { id: '1', name: 'Muhammad Ali', email: 'muhammad.ali@example.com', phone: '+92 300 1234567', address: '123 Gulberg, Lahore', completedOrders: 15, status: 'Active', joinedDate: '2024-01-15' },
    { id: '2', name: 'Fatima Khan', email: 'fatima.khan@example.com', phone: '+92 321 9876543', address: '456 Model Town, Karachi', completedOrders: 23, status: 'Active', joinedDate: '2024-02-01' },
    { id: '3', name: 'Ahmed Hassan', email: 'ahmed.hassan@example.com', phone: '+92 333 4567890', address: '789 Clifton, Karachi', completedOrders: 8, status: 'Active', joinedDate: '2024-03-10' },
    { id: '4', name: 'Ayesha Siddiqui', email: 'ayesha.siddiqui@example.com', phone: '+92 301 2345678', address: '321 DHA, Lahore', completedOrders: 12, status: 'Inactive', joinedDate: '2024-04-05' },
    { id: '5', name: 'Omar Farooq', email: 'omar.farooq@example.com', phone: '+92 322 3456789', address: '654 F-7, Islamabad', completedOrders: 19, status: 'Active', joinedDate: '2024-05-20' },
    { id: '6', name: 'Zainab Malik', email: 'zainab.malik@example.com', phone: '+92 300 5678901', address: '987 Johar Town, Lahore', completedOrders: 5, status: 'Active', joinedDate: '2024-06-15' },
    { id: '7', name: 'Bilal Ahmed', email: 'bilal.ahmed@example.com', phone: '+92 323 6789012', address: '147 Bahria Town, Rawalpindi', completedOrders: 25, status: 'Active', joinedDate: '2024-07-01' },
    { id: '8', name: 'Hafsa Noor', email: 'hafsa.noor@example.com', phone: '+92 301 7890123', address: '258 Gulshan, Karachi', completedOrders: 3, status: 'Inactive', joinedDate: '2024-08-10' },
    { id: '9', name: 'Yusuf Khan', email: 'yusuf.khan@example.com', phone: '+92 324 8901234', address: '369 PWD, Islamabad', completedOrders: 17, status: 'Active', joinedDate: '2024-09-05' },
    { id: '10', name: 'Maryam Iqbal', email: 'maryam.iqbal@example.com', phone: '+92 300 9012345', address: '741 F-11, Islamabad', completedOrders: 10, status: 'Active', joinedDate: '2024-10-01' },
  ]);

  const [donations, setDonations] = useState<Donation[]>([
    { id: '1', donorName: 'Abdullah Shah', amount: 5000, date: '2025-01-10', status: 'Completed', assignedVolunteer: 'Muhammad Ali' },
    { id: '2', donorName: 'Sana Mir', amount: 3000, date: '2025-02-15', status: 'Pending', assignedVolunteer: null },
    { id: '3', donorName: 'Imran Quresh', amount: 10000, date: '2025-03-01', status: 'Completed', assignedVolunteer: 'Fatima Khan' },
    { id: '4', donorName: 'Nadia Akram', amount: 2000, date: '2025-03-10', status: 'Cancelled', assignedVolunteer: null },
    { id: '5', donorName: 'Tariq Jamil', amount: 7500, date: '2025-04-05', status: 'Pending', assignedVolunteer: 'Ahmed Hassan' },
    { id: '6', donorName: 'Saba Qamar', amount: 4000, date: '2025-04-15', status: 'Completed', assignedVolunteer: 'Omar Farooq' },
    { id: '7', donorName: 'Khalid Mehmood', amount: 6000, date: '2025-05-01', status: 'Pending', assignedVolunteer: null },
    { id: '8', donorName: 'Rabia Basri', amount: 2500, date: '2025-05-10', status: 'Completed', assignedVolunteer: 'Zainab Malik' },
    { id: '9', donorName: 'Faisal Qureshi', amount: 8000, date: '2025-05-12', status: 'Pending', assignedVolunteer: 'Bilal Ahmed' },
    { id: '10', donorName: 'Amina Sheikh', amount: 3500, date: '2025-05-14', status: 'Completed', assignedVolunteer: 'Yusuf Khan' },
  ]);

  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    { id: '1', description: 'Distributed food packages to 50 families', date: '2025-05-01', volunteerName: 'Muhammad Ali' },
    { id: '2', description: 'Organized medical camp in rural area', date: '2025-05-02', volunteerName: 'Fatima Khan' },
    { id: '3', description: 'Conducted education workshop for children', date: '2025-05-03', volunteerName: 'Ahmed Hassan' },
    { id: '4', description: 'Collected donations for flood relief', date: '2025-05-04', volunteerName: 'Omar Farooq' },
    { id: '5', description: 'Distributed clothes to orphanage', date: '2025-05-05', volunteerName: 'Zainab Malik' },
    { id: '6', description: 'Organized clean-up drive in community', date: '2025-05-06', volunteerName: 'Bilal Ahmed' },
    { id: '7', description: 'Provided meals to homeless shelter', date: '2025-05-07', volunteerName: 'Yusuf Khan' },
    { id: '8', description: 'Conducted health awareness session', date: '2025-05-08', volunteerName: 'Maryam Iqbal' },
    { id: '9', description: 'Distributed school supplies to students', date: '2025-05-09', volunteerName: 'Ayesha Siddiqui' },
    { id: '10', description: 'Organized tree plantation drive', date: '2025-05-10', volunteerName: 'Hafsa Noor' },
  ]);

  const { getNGOStats, stats } = useNGOContext();

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

  useEffect(() => {
    getNGOStats();
  }, [getNGOStats]);

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVolunteer) {
      setVolunteers(volunteers.map(v => 
        v.id === editingVolunteer.id 
          ? { 
              ...v, 
              ...formData,
              status: v.status,
              completedOrders: v.completedOrders,
              joinedDate: v.joinedDate
            }
          : v
      ));
    } else {
      const newVolunteer = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        completedOrders: 0,
        status: 'Active' as const,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setVolunteers([...volunteers, newVolunteer]);
    }
    handleCloseForm();
  };

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      address: volunteer.address
    });
    setShowVolunteerForm(true);
  };

  const handleDeleteVolunteer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      setVolunteers(volunteers.filter(v => v.id !== id));
    }
  };

  const handleCloseForm = () => {
    setShowVolunteerForm(false);
    setEditingVolunteer(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  const handleAssignVolunteer = (donationId: string, volunteerId: string) => {
    setDonations(donations.map(d => 
      d.id === donationId 
        ? { ...d, assignedVolunteer: volunteers.find(v => v.id === volunteerId)?.name || null }
        : d
    ));
  };

  const handleUpdateDonationStatus = (donationId: string, status: 'Pending' | 'Completed' | 'Cancelled') => {
    setDonations(donations.map(d => 
      d.id === donationId ? { ...d, status } : d
    ));
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                <th className="pb-3 font-semibold text-gray-600">Phone</th>
                <th className="pb-3 font-semibold text-gray-600">Status</th>
                <th className="pb-3 font-semibold text-gray-600">Completed Orders</th>
                <th className="pb-3 font-semibold text-gray-600">Joined Date</th>
                <th className="pb-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">
                          {volunteer.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{volunteer.name}</span>
                    </div>
                  </td>
                  <td className="py-4">{volunteer.email}</td>
                  <td className="py-4">{volunteer.phone}</td>
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
                  <td className="py-4">{volunteer.joinedDate}</td>
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
              ))}
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
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">{donation.donorName}</td>
                  <td className="py-4">PKR {donation.amount}</td>
                  <td className="py-4">{donation.date}</td>
                  <td className="py-4">
                    <select
                      value={donation.status}
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
                      onClick={() => setDonations(donations.filter(d => d.id !== donation.id))}
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
  );

  const Dashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          icon={Package2}
          title="Total Volunteers"
          stats={String(stats.Volunteers || 10)}
          trend="+3 from last week"
          trendUp={true}
        />
        <DashboardCard
          icon={Users}
          title="Total Donations"
          stats={String(stats.total_donations || 25)}
          trend="+5 this month"
          trendUp={true}
        />
        <DashboardCard
          icon={MapPin}
          title="Service Areas"
          stats={String(stats.completedDonations || 15)}
          trend="+2 this month"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <p className="font-semibold">{activity.description}</p>
                  <p className="text-sm text-gray-600">By {activity.volunteerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
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
              label="Generate Reports"
              color="purple"
              onClick={() => {}}
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
        </div>
      </div>
      
      {activeTab === 'dashboard' ? <Dashboard /> : activeTab === 'volunteers' ? <VolunteersTable /> : <DonationsTable />}
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