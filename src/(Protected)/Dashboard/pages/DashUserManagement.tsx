"use client"

import { useEffect, useState } from "react"
import {
  Activity,
  AlertCircle,
  Ban,
  BarChart3,
  Bell,
  Camera,
  Check,
  CircleOff,
  Command,
  Edit,
  Eye,
  Flag,
  Globe,
  Hexagon,
  LightbulbOff,
  LineChart,
  Lock,
  type LucideIcon,
  MessageSquare,
  Mic,
  Moon,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldBan,
  Sticker,
  Sun,
  Terminal,
  Ticket,
  Trash2,
  UserPlus,
  Users,
  Video,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashHeader from "../components/DashHeader"
import DashNav from "../components/DashNav"
import SystemTime from "../components/SystemTime"
import OverviewTables from "../components/OverviewTables"
import UserManagementTable from "../components/user-management-table"
import { useSocket } from "@/contexts/SocketContext"
import axiosInstance from "@/lib/axiosInstance"

export default function DashUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { onlineUsers = [] } = useSocket(); // Ensure default empty array
  const fetchRecentUsers = async () => {
    try {
      const response = await axiosInstance.get("/dash/all-users");
      setUsers(response.data); // Data is already sorted (latest first)
      setLoading(false);
    } catch (err) {
      setError("An error occurred while fetching users...");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentUsers();
  }, []);
  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.isAdmin).length;
  const totalBanned = users.filter((user) => user.isBanned).length;
  return (
<div className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">


      <div className="p-4 relative z-10">
        {/* Header */}
      <DashHeader />

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <DashNav />

          {/* Main dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-7">
            <div className="grid gap-6">
              {/* Platform overview */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757]/5 via-transparent to-transparent opacity-50 -z-1"></div>
                <CardHeader className="border-b border-slate-700/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center font-normal">
                      <Activity className="mr-2 h-5 w-5 text-[#ff5757]" />
                      Platform Overview
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 bo">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`bg-slate-800/40 rounded-lg border border-slate-800 p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400">Total Users</div>
      </div>
      <div className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
{totalUsers}
      </div>
      <div className="absolute bottom-2 right-2 flex items-center"><Users className="h-4 w-4 text-slate-500"/></div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-[#ff5757] to-[#ff8a8a]"></div>
    </div>
    <div className={`bg-slate-800/40 rounded-lg border border-slate-800 p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400">Admins</div>
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
{totalAdmins}
      </div>
      <div className="absolute bottom-2 right-2 flex items-center"><Shield className="h-4 w-4 text-slate-500"/></div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-[#84ff57] to-[#8aff98]"></div>
    </div>
    <div className={`bg-slate-800/40 rounded-lg border border-slate-800 p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400">Banned Users</div>
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
      {totalBanned}
      </div>
      <div className="absolute bottom-2 right-2 flex items-center"><ShieldBan className="h-4 w-4 text-slate-500"/></div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-[#5779ff] to-[#8aabff]"></div>
    </div>
                  </div>
                  <UserManagementTable/>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="grid gap-6">
              {/* System time */}
             <SystemTime />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// Component for metric cards

