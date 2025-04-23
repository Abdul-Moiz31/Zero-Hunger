import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, Tag } from 'lucide-react';

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

const dummyListings: FoodListing[] = [
  {
    id: '1',
    title: 'Fresh Vegetables Assortment',
    description: 'Mix of fresh vegetables including carrots, tomatoes, and lettuce. Perfect for a soup kitchen or community center.',
    location: 'Downtown Food Market, NY',
    quantity: 50,
    expiryDate: '2024-03-20',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=384&q=80',
    donor: {
      name: 'Green Market Co.',
      rating: 4.8
    }
  },
  {
    id: '2',
    title: 'Bakery Items Bundle',
    description: 'Assorted bread, pastries, and baked goods from our daily excess. Still fresh and perfect for immediate distribution.',
    location: 'Sweet Life Bakery, Brooklyn',
    quantity: 30,
    expiryDate: '2024-03-18',
    category: 'Baked Goods',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=384&q=80',
    donor: {
      name: 'Sweet Life Bakery',
      rating: 4.9
    }
  },
  {
    id: '3',
    title: 'Canned Food Collection',
    description: 'Various canned goods including soups, vegetables, and fruits. Long shelf life and perfect for food banks.',
    location: 'Metro Grocery, Queens',
    quantity: 100,
    expiryDate: '2024-06-15',
    category: 'Canned Goods',
    imageUrl: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=384&q=80',
    donor: {
      name: 'Metro Grocery',
      rating: 4.7
    }
  },
  {
    id: '4',
    title: 'Fresh Fruit Box',
    description: 'Seasonal fruits including apples, oranges, and bananas. Great source of vitamins and nutrients.',
    location: 'Fresh Farms Market, Staten Island',
    quantity: 40,
    expiryDate: '2024-03-19',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=384&q=80',
    donor: {
      name: 'Fresh Farms',
      rating: 4.6
    }
  }
];

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredListings = dummyListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(dummyListings.map(listing => listing.category))];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
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
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{listing.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{listing.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{listing.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Expires: {new Date(listing.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Tag className="w-4 h-4 mr-2" />
                    <span className="text-sm">Quantity: {listing.quantity} units</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{listing.donor.name}</p>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">{listing.donor.rating}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Claim
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Listings;