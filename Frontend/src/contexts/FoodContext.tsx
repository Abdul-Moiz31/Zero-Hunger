// FoodContext.tsx - Updated with claimFood functionality
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Donor {
  _id: string;
  name: string;
}

interface NGO {
  _id: string;
  name: string;
}

interface Volunteer {
  _id: string;
  name: string;
}

// Update interface to match the MongoDB schema
export interface FoodListing {
  _id: string;
  donorId: string | Donor;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  expiry_time: Date | string;
  pickup_window_start: string;
  pickup_window_end: string;
  status: 'available' | 'assigned' | 'completed';
  ngoId?: string | NGO;
  acceptance_time?: Date | string;
  volunteerId?: string | Volunteer;
  delivered_time?: Date | string;
  temperature_requirements?: string;
  dietary_info?: string;
  img?: string;
}

interface FoodContextType {
  listings: FoodListing[];
  loading: boolean;
  error: string | null;
  getAllAvailableListings: () => Promise<void>;
  claimFood: (foodId: string) => Promise<{ success: boolean; message: string; data?: FoodListing }>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export const useFoodListings = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFoodListings must be used within a FoodListingsProvider');
  }
  return context;
};

export const FoodListingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch available food listings
  const getAllAvailableListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/food/available');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch available listings:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to claim food
  const claimFood = async (foodId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get auth token from localStorage or wherever you store it
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:5000/api/ngo/claim/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ foodId })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to claim food');
      }

      // Update the local state to reflect the change
      if (result.success) {
        setListings(prevListings => 
          prevListings.filter(listing => listing._id !== foodId)
        );
      }

      return result;
    } catch (err) {
      console.error('Error claiming food:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to claim food' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    listings,
    loading,
    error,
    getAllAvailableListings,
    claimFood
  };

  return (
    <FoodContext.Provider value={value}>
      {children}
    </FoodContext.Provider>
  );
};

export default FoodContext;