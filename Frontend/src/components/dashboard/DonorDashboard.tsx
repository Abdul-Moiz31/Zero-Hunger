import React, { useState } from 'react';
import { Package2, Clock, CheckCircle, Plus, X, Calendar, Clock3, Info } from 'lucide-react';

// Mock data
const mockDonations = [
  {
    id: '1',
    title: 'Fresh Produce',
    description: 'Assorted vegetables and fruits',
    quantity: 50,
    quantity_unit: 'kg',
    expiry_time: '2024-03-20T15:00:00Z',
    pickup_window_start: '2024-03-19T10:00:00Z',
    pickup_window_end: '2024-03-19T12:00:00Z',
    status: 'available',
    temperature_requirements: 'Refrigerated',
    dietary_info: 'Vegetarian'
  }
];

const mockNotifications = [
  {
    id: '1',
    title: 'Donation Picked Up',
    message: 'Your donation has been picked up by volunteer John',
    created_at: new Date().toISOString()
  }
];

interface FoodListing {
  id: string;
  title: string;
  description: string;
  quantity: number;
  quantity_unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  status: 'available' | 'assigned' | 'completed' | 'cancelled';
  temperature_requirements?: string;
  dietary_info?: string;
}

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donations, setDonations] = useState<FoodListing[]>(mockDonations);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(mockNotifications);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    quantity_unit: 'meals',
    expiry_time: '',
    pickup_window_start: '',
    pickup_window_end: '',
    temperature_requirements: '',
    dietary_info: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDonation = {
      id: (donations.length + 1).toString(),
      ...formData,
      quantity: parseInt(formData.quantity),
      status: 'available' as const
    };
    setDonations([newDonation, ...donations]);
    setShowDonationForm(false);
    setFormData({
      title: '',
      description: '',
      quantity: '',
      quantity_unit: 'meals',
      expiry_time: '',
      pickup_window_start: '',
      pickup_window_end: '',
      temperature_requirements: '',
      dietary_info: ''
    });
  };

  const DonationForm = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full animate-scaleIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Create New Donation</h3>
          <button 
            onClick={() => setShowDonationForm(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <select
                  value={formData.quantity_unit}
                  onChange={(e) => setFormData({ ...formData, quantity_unit: e.target.value })}
                  className="w-32 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, temperature_requirements: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, pickup_window_start: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, pickup_window_end: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, dietary_info: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Vegetarian, Contains nuts"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowDonationForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
          value={donations.length.toString()}
          trend="+3 this week"
          trendUp={true}
        />
        <DashboardCard
          icon={Clock}
          title="Pending Pickups"
          value={donations.filter(d => d.status === 'available').length.toString()}
          trend="2 expiring soon"
          trendUp={false}
        />
        <DashboardCard
          icon={CheckCircle}
          title="Completed"
          value={donations.filter(d => d.status === 'completed').length.toString()}
          trend="+12% this month"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
            <div className="space-y-4">
              {donations.slice(0, 5).map((donation) => (
                <div key={donation.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Package2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{donation.title}</h3>
                    <p className="text-sm text-gray-600">{donation.quantity} {donation.quantity_unit}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(donation.pickup_window_start).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock3 className="w-4 h-4 mr-1" />
                        {new Date(donation.pickup_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    donation.status === 'available' ? 'bg-green-100 text-green-800' :
                    donation.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    donation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const DonationsList = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Donations</h2>
          <button
            onClick={() => setShowDonationForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>New Donation</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">Title</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Pickup Window</th>
                <th className="pb-3">Expiry Time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id} className="border-b">
                  <td className="py-4">
                    <div>
                      <p className="font-medium">{donation.title}</p>
                      <p className="text-sm text-gray-600">{donation.description}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    {donation.quantity} {donation.quantity_unit}
                  </td>
                  <td className="py-4">
                    <div>
                      <p>{new Date(donation.pickup_window_start).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(donation.pickup_window_start).toLocaleTimeString()} - 
                        {new Date(donation.pickup_window_end).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="py-4">
                    {new Date(donation.expiry_time).toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      donation.status === 'available' ? 'bg-green-100 text-green-800' :
                      donation.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      donation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      View Details
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
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
              activeTab === 'overview' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
              activeTab === 'donations' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Donations
          </button>
        </div>
      </div>
      
      {activeTab === 'overview' ? <Overview /> : <DonationsList />}
      {showDonationForm && <DonationForm />}
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
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
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

export default DonorDashboard;