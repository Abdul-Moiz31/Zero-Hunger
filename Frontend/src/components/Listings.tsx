// Listings.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, MapPin, Clock, Tag, Thermometer, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFoodListings } from '@/contexts/FoodContext';

const useAuth = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return { user };
};

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDietaryInfo, setSelectedDietaryInfo] = useState('all');
  const [popupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { getAllAvailableListings, listings, loading, claimFood } = useFoodListings();
  
  useEffect(() => {
    getAllAvailableListings();
  }, []); // Empty dependency array to run once

  // Extract unique dietary info options for filtering
  const dietaryOptions = useMemo(() => {
    const options = listings
      .map(listing => listing.dietary_info)
      .filter((info): info is string => !!info);
    return ['all', ...new Set(options)];
  }, [listings]);

  // Filter listings based on search term and dietary info
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDietaryInfo = 
        selectedDietaryInfo === 'all' || 
        listing.dietary_info === selectedDietaryInfo;
      return matchesSearch && matchesDietaryInfo;
    });
  }, [listings, searchTerm, selectedDietaryInfo]);

  const [claimLoading, setClaimLoading] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleClaim = async (listingId: string) => {
    if (!user) {
      setPopupVisible(true);
      return;
    }
    
    setClaimLoading(listingId);
    
    try {
      const result = await claimFood(listingId);
      
      setClaimResult(result);
      
      if (result.success) {
        // Show success message briefly before redirecting
        setTimeout(() => {
          navigate('/my-claims');
        }, 2000);
      }
    } catch (error) {
      console.error("Error claiming food:", error);
      setClaimResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to claim food'
      });
    } finally {
      setClaimLoading(null);
    }
  };

  const handleLoginRedirect = () => {
    setPopupVisible(false);
    navigate('/login');
  };

  // Format donor name for display
  const getDonorName = (donor: any) => {
    if (!donor) return 'Unknown';
    return typeof donor === 'object' ? donor.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Available Food Listings</h1>
          <p className="text-gray-600">Browse available food donations in your area</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedDietaryInfo}
              onChange={(e) => setSelectedDietaryInfo(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
            >
              {dietaryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All Dietary Types' : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <p className="text-gray-600 text-center py-12">No listings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={listing.img || '/default-food-image.jpg'}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-food-image.jpg'; // Fallback image
                  }}
                  loading="lazy"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{listing.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">Pickup window: {listing.pickup_window_start} - {listing.pickup_window_end}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Expires: {new Date(listing.expiry_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      <span className="text-sm">Quantity: {listing.quantity} {listing.unit}</span>
                    </div>
                    {listing.temperature_requirements && (
                      <div className="flex items-center text-gray-600">
                        <Thermometer className="w-4 h-4 mr-2" />
                        <span className="text-sm">Temp: {listing.temperature_requirements}</span>
                      </div>
                    )}
                    {listing.dietary_info && (
                      <div className="flex items-center text-gray-600">
                        <Info className="w-4 h-4 mr-2" />
                        <span className="text-sm">Diet: {listing.dietary_info}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {getDonorName(listing.donorId)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleClaim(listing._id)}
                        disabled={claimLoading === listing._id}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          claimLoading === listing._id 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {claimLoading === listing._id ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Claiming...
                          </span>
                        ) : (
                          'Claim'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {popupVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl text-center max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Sign in Required</h2>
              <p className="text-gray-600 mb-6">You must sign in first to claim a listing.</p>
              <button
                onClick={handleLoginRedirect}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
        
        {claimResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className={`bg-white rounded-lg p-6 shadow-xl text-center max-w-sm w-full ${
              claimResult.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
            }`}>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                {claimResult.success ? 'Success!' : 'Operation Failed'}
              </h2>
              <p className="text-gray-600 mb-6">{claimResult.message}</p>
              <button
                onClick={() => setClaimResult(null)}
                className={`px-4 py-2 rounded transition ${
                  claimResult.success 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {claimResult.success ? 'Great!' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;