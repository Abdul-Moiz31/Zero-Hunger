import React, { useState } from 'react';
import { Users, Package2, MapPin, Plus, Pencil, Trash2, X, Search, Filter } from 'lucide-react';

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

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State',
      completedOrders: 15,
      status: 'Active',
      joinedDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave, City, State',
      completedOrders: 23,
      status: 'Active',
      joinedDate: '2024-02-01'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                onChange={(e) => setStatusFilter(e.target.value as any)}
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

  const Dashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          icon={Package2}
          title="Available Donations"
          value="12"
          trend="+3 from last week"
          trendUp={true}
        />
        <DashboardCard
          icon={Users}
          title="Active Volunteers"
          value={volunteers.length.toString()}
          trend="+2 this month"
          trendUp={true}
        />
        <DashboardCard
          icon={MapPin}
          title="Service Areas"
          value="5"
          trend="Same as last month"
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Volunteer Activity</h2>
          <div className="space-y-4">
            {volunteers.slice(0, 3).map((volunteer) => (
              <div key={volunteer.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-green-600">
                      {volunteer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{volunteer.name}</p>
                    <p className="text-sm text-gray-600">{volunteer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{volunteer.completedOrders} Orders</p>
                  <p className="text-sm text-gray-600">Completed</p>
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
              onClick={() => {}}
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
        </div>
      </div>
      
      {activeTab === 'dashboard' ? <Dashboard /> : <VolunteersTable />}
      {showVolunteerForm && <VolunteerForm />}
    </div>
  );
};

const DashboardCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend,
  trendUp 
}: { 
  icon: any;
  title: string;
  value: string;
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
        <p className="text-2xl font-bold text-gray-800">{value}</p>
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