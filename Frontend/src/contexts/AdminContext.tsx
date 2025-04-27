/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

interface AdminContextType{
    stats:{
        ngoCount: number,
    donorCount: number,
    volunteerCount: number,
    },
    
    users:any[],
    getDashboardStats: () => void,
    updateUserStatus:(data:any) =>  void,
    deleteUser:(userId:string) => void
}

const AdminContext = createContext<AdminContextType|undefined>(undefined);

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState({
    ngoCount: 0,
    donorCount: 0,
    volunteerCount: 0,
  });

  const [users, setUsers] = useState([]);

  async function getDashboardStats() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-stats`
      );
      const { users, donorCount, ngoCount, volunteerCount } = response.data;

      setUsers(users);

      setStats({
        ngoCount,
        donorCount,
        volunteerCount,
      });
    } catch (error) {
      // @ts-expect-error Error Type Unkonw
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async function updateUserStatus(data:any){
    try {
         await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/admin/user-status/update`,{
            userId:data.userId,
            status:data.status
          }
        );
        getDashboardStats();
      } catch (error) {
        // @ts-expect-error Error Type Unkonw
        throw new Error(error?.message || "Something went wrong");
      }
  }

  async function deleteUser(userId : any){
    try {
         await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/admin/users/${userId}`
        );

        getDashboardStats();
      } catch (error) {
        // @ts-expect-error Error Type Unkonw
        throw new Error(error?.message || "Something went wrong");
      }
  }



  return (
    <AdminContext.Provider value={{ stats, users,getDashboardStats,updateUserStatus,deleteUser }}>
      {children}
    </AdminContext.Provider>
  );
}
