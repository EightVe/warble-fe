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
import DashHeader from "./components/DashHeader"
import DashNav from "./components/DashNav"
import SystemTime from "./components/SystemTime"
import OnlineUsers from "./components/OnlineUsers"
import QuickActions from "./components/QuickActions"
import RecentFeedbacks from "./components/RecentFeedbacks"
import RecentAletts from "./components/RecentAletts"
import RecentTickets from "./components/RecentTickets"
import OverviewTables from "./components/OverviewTables"
import { useSocket } from "@/contexts/SocketContext"
export default function Dashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [activeUsers, setActiveUsers] = useState(1842)
  const [videoSessions, setVideoSessions] = useState(756)
  const [reportedUsers, setReportedUsers] = useState(24)
  const [isLoading, setIsLoading] = useState(true)
  const { onlineUsers = [] } = useSocket(); // Ensure default empty array
  const onlineCount = onlineUsers.filter(user => user.status === "online").length;
  const awayCount = onlineUsers.filter(user => user.status === "away").length;
  const offlineCount = onlineUsers.filter(user => user.status === "offline").length;
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Simulate changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 200) + 1700)
      setVideoSessions(Math.floor(Math.random() * 100) + 700)
      setReportedUsers(Math.floor(Math.random() * 5) + 20)
    }, 3000)

    return () => clearInterval(interval)
  }, [])
  return (
<div className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 top-0">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-2 border-4 border-t-[#ff5757] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-[#ff5757] border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-[#ff5757] border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-[#ff5757] border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-[#ff5757] font-mono text-sm tracking-wider">DASHBOARD INITIALIZING</div>
          </div>
        </div>
      )}

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
        <div className="text-xs text-slate-400">Currently Online</div>
      </div>
      <div className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
      {onlineCount}
      </div>
      <span className="text-[11px] text-slate-500">Away : {awayCount}</span>
      <div className="absolute bottom-2 right-2 flex items-center"><Users className="h-4 w-4 text-slate-500"/></div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-[#ff5757] to-[#ff8a8a]"></div>
    </div>
    <div className={`bg-slate-800/40 rounded-lg border border-slate-800 p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400">Active Sessions</div>
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
      {onlineCount}
      </div>
      <div className="absolute bottom-2 right-2 flex items-center"><Video className="h-4 w-4 text-slate-500"/></div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-[#84ff57] to-[#8aff98]"></div>
    </div>
    <div className={`bg-slate-800/40 rounded-lg border border-slate-800 p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400">Active Reports</div>
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
      {onlineCount}
      </div>
      <div className="absolute bottom-2 right-2 flex items-center"><Flag className="h-4 w-4 text-slate-500"/></div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-[#5779ff] to-[#8aabff]"></div>
    </div>
                  </div>
                  <OverviewTables />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-6">


                <RecentAletts />
              </div>

              {/* Recent Tickets */}
             <RecentTickets />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="grid gap-6">
              {/* System time */}
             <SystemTime />

              {/* Online Users */}
              <OnlineUsers />

              {/* Quick actions */}
              <QuickActions />

              {/* Recent Feedbacks */}
              <RecentFeedbacks />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// Component for metric cards

