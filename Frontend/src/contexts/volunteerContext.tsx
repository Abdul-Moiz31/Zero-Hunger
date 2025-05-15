import React, { useContext ,  createContext, useState } from "react";
import axios from "axios"



interface VolunteerStats {
   available_Task: number;
   in_progress_task: number ;
   Completed_task : number;
}

interface VolunteerContextType {
    stats : VolunteerStats;
    volunteerTasks : any[];
    getVolunteerStats: () => void ;
    getVolunteerTasks: () => void ;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export function useVolunteerContext() {
    const context = useContext(VolunteerContext);
    if(!context)
        throw new Error(" useVolunteerContext must be used within the Volunteer Provider ");
    return context;
}

export function VolunteerProvider({children}: { children : React.ReactNode}){
    const [stats , setStats] = useState<VolunteerStats>({
    available_Task: 0,
   in_progress_task: 0 , 
   Completed_task : 0,
    });
    const [volunteerTasks , setVolunteerTasks] = useState<any[]>([]);

    async function getVolunteerStats() {
        try {
          const token = localStorage.getItem("token");  // Get token from localStorage (adjust if using cookies)
      
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/volunteer/stats`,
            {
              headers: {
                Authorization: `Bearer ${token}`,  // Add the token to the Authorization header
              }
            }
          );
          setStats({
            available_Task: response.data.available_Task,
            in_progress_task: response.data.in_progress_task,
            Completed_task: response.data.Completed_task,
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }

      const getVolunteerTasks = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/volunteer/tasks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setVolunteerTasks(response.data);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      }

    return (
        <VolunteerContext.Provider value={{ stats, getVolunteerStats,getVolunteerTasks, volunteerTasks }}>
          {children}
        </VolunteerContext.Provider>
        );
}