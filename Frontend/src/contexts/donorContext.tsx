"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import axios from "axios"

export interface Donation {
  _id: string
  title: string
  description: string
  quantity: number
  unit: string
  expiry_time: string
  pickup_window_start: string
  pickup_window_end: string
  status: "available" | "assigned" | "completed" | "cancelled"
  temperature_requirements?: string
  dietary_info?: string
  img?: string
}

interface DonorStats {
  totalDonations: number
  pendingDonations: number
  completedDonations: number
}

interface DonorContextType {
  stats: DonorStats
  donations: Donation[]
  getDonorStats: () => Promise<void>
  setDonations: React.Dispatch<React.SetStateAction<Donation[]>>
  getMyDonations: () => Promise<void>
  deleteDonation: (id: string) => Promise<void>
  updateDonationStatus: (id: string, status: string) => Promise<void>
}

const DonorContext = createContext<DonorContextType | undefined>(undefined)

export function useDonorContext() {
  const context = useContext(DonorContext)
  if (!context) {
    throw new Error("useDonorContext must be used within DonorProvider")
  }
  return context
}

export function DonorProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<DonorStats>({
    totalDonations: 0,
    pendingDonations: 0,
    completedDonations: 0,
  })

  const [donations, setDonations] = useState<Donation[]>([])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

  async function getDonorStats() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/stats`,
        getAuthHeaders()
      )
      const { totalDonations, pendingDonations, completedDonations } = response.data

      setStats({ totalDonations, pendingDonations, completedDonations })
    } catch (error) {
      console.error("Failed to fetch donor stats:", error)
    }
  }

  async function getMyDonations() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/donor/my-donations`,
        getAuthHeaders()
      )
      setDonations(response.data)
    } catch (error) {
      console.error("Failed to fetch donations:", error)
    }
  }

  async function deleteDonation(id: string) {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/donor/donation/${id}`,
        getAuthHeaders()
      )
      getMyDonations()
    } catch (error) {
      console.error("Failed to delete donation:", error)
    }
  }

  async function updateDonationStatus(id: string, status: string) {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/donor/donation/${id}/status`,
        { status },
        getAuthHeaders()
      )
      getMyDonations()
    } catch (error) {
      console.error("Failed to update donation status:", error)
    }
  }

  return (
    <DonorContext.Provider
      value={{ stats, donations, getDonorStats, getMyDonations, deleteDonation, updateDonationStatus , setDonations }}
    >
      {children}
    </DonorContext.Provider>
  )
}
