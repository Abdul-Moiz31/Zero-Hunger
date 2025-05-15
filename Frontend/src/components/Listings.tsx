'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, MapPin, Clock, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return { user };
};

interface FoodListing {
  id: string;
  title: string;
  description: string;
  location: string;
  quantity: number;
  expiryDate: string;
  category: string;
  imageUrl: string;
  donor: {
    name: string;
    rating: number;
  };
}

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock data with Pexels image URLs
  const mockListings: FoodListing[] = [
    {
      id: '1',
      title: 'Fresh Naan Bread',
      description: 'Freshly baked naan bread, perfect for community meals.',
      location: 'Gulberg, Lahore',
      quantity: 100,
      expiryDate: '2025-05-20T00:00:00Z',
      category: 'Baked Goods',
      imageUrl: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg', // Naan bread
      donor: { name: 'Muhammad Ali', rating: 4.5 },
    },
    {
      id: '2',
      title: 'Vegetable Boxes',
      description: 'Assorted fresh vegetables including tomatoes, onions, and potatoes.',
      location: 'Clifton, Karachi',
      quantity: 30,
      expiryDate: '2025-05-18T00:00:00Z',
      category: 'Vegetables',
      imageUrl: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg', // Vegetables
      donor: { name: 'Fatima Khan', rating: 4.0 },
    },
    {
      id: '3',
      title: 'Rice Sacks',
      description: 'High-quality basmati rice for distribution.',
      location: 'F-7, Islamabad',
      quantity: 50,
      expiryDate: '2025-06-01T00:00:00Z',
      category: 'Grains',
      imageUrl: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg', // Rice
      donor: { name: 'Ahmed Hassan', rating: 4.8 },
    },
    {
      id: '4',
      title: 'Canned Fruits',
      description: 'Canned peaches and pineapples, long shelf life.',
      location: 'Model Town, Lahore',
      quantity: 80,
      expiryDate: '2025-12-15T00:00:00Z',
      category: 'Canned Goods',
      imageUrl: 'https://images.pexels.com/photos/1291680/pexels-photo-1291680.jpeg', // Canned fruits
      donor: { name: 'Ayesha Siddiqui', rating: 3.9 },
    },
    {
      id: '5',
      title: 'Milk Cartons',
      description: 'Pasteurized milk cartons for children.',
      location: 'DHA, Karachi',
      quantity: 60,
      expiryDate: '2025-05-22T00:00:00Z',
      category: 'Dairy',
      imageUrl: 'https://images.pexels.com/photos/533661/pexels-photo-533661.jpeg', // Milk
      donor: { name: 'Omar Farooq', rating: 4.2 },
    },
    {
      id: '6',
      title: 'Lentil Bags',
      description: 'Red and yellow lentils for soup kitchens.',
      location: 'Bahria Town, Rawalpindi',
      quantity: 40,
      expiryDate: '2025-07-10T00:00:00Z',
      category: 'Legumes',
      imageUrl: 'https://images.pexels.com/photos/3296420/pexels-photo-3296420.jpeg', // Lentils
      donor: { name: 'Zainab Malik', rating: 4.6 },
    },
    {
      id: '7',
      title: 'Fresh Fruits',
      description: 'Apples, oranges, and bananas, freshly harvested.',
      location: 'Johar Town, Lahore',
      quantity: 70,
      expiryDate: '2025-05-19T00:00:00Z',
      category: 'Fruits',
      imageUrl: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg', // Fresh fruits
      donor: { name: 'Bilal Ahmed', rating: 4.3 },
    },
    {
      id: '8',
      title: 'Cooking Oil',
      description: 'Pure canola oil in 5-liter cans.',
      location: 'Gulshan, Karachi',
      quantity: 25,
      expiryDate: '2025-11-30T00:00:00Z',
      category: 'Oils',
      imageUrl: 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg', // Cooking oil
      donor: { name: 'Hafsa Noor', rating: 4.1 },
    },
    {
      id: '9',
      title: 'Pasta Packs',
      description: 'Assorted pasta shapes for community kitchens.',
      location: 'F-11, Islamabad',
      quantity: 90,
      expiryDate: '2025-10-01T00:00:00Z',
      category: 'Pasta',
      imageUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', // Pasta
      donor: { name: 'Yusuf Khan', rating: 4.7 },
    },
    {
      id: '10',
      title: 'Egg Trays',
      description: 'Fresh farm eggs, packed in trays of 30.',
      location: 'PWD, Islamabad',
      quantity: 120,
      expiryDate: '2025-05-25T00:00:00Z',
      category: 'Eggs',
      imageUrl: 'https://images.pexels.com/photos/162712/pexels-photo-162712.jpeg', // Eggs
      donor: { name: 'Maryam Iqbal', rating: 4.4 },
    },
  ];

  useEffect(() => {
    // Set mock data only once on mount
    setListings(mockListings);
  }, []); // Empty dependency array to run once

  // Memoize categories to prevent re-computation
  const categories = useMemo(() => ['all', ...new Set(listings.map((listing) => listing.category))], [listings]);

  // Memoize filtered listings to optimize performance
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, selectedCategory]);

  const handleClaim = (listingId: string) => {
    if (!user) {
      setPopupVisible(true);
    } else {
      navigate(`/claim/${listingId}`);
    }
  };

  const handleLoginRedirect = () => {
    setPopupVisible(false);
    navigate('/login');
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <p className="text-gray-600 text-center">No listings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image for ${listing.title}: ${listing.imageUrl}`);
                    e.currentTarget.src = '/default-food-image.jpg'; // Local fallback
                  }}
                  loading="lazy" // Optimize image loading
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
                      <span className="text-sm">{listing.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Expires: {new Date(listing.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      <span className="text-sm">Quantity: {listing.quantity} {listing.category.toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{listing.donor.name}</p>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">{listing.donor.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaim(listing.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Claim
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
      </div>
    </div>
  );
};

export default Listings;