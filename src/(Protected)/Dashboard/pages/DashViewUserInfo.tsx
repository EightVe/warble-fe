"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  Biohazard,
  Calendar,
  CalendarArrowDown,
  CalendarCheck,
  CalendarIcon,
  Check,
  CircleCheck,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  Flag,
  Globe,
  GlobeIcon,
  IdCard,
  IdCardIcon,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Shield,
  ShieldBan,
  Unlock,
  UserX,
  Info,
  X,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "@/lib/axiosInstance"
import CustomLink from "@/hooks/useLink"
import DashNav from "../components/DashNav"
import BanUser from "../components/inside-actions/ban-user"
import ViewProfile from "../components/inside-actions/view-profile"
import { useSocket } from "@/contexts/SocketContext"

// Mock user data
const userData = {
  id: "user_789",
  name: "Marcus Wilson",
  avatar: "/placeholder.svg?height=128&width=128",
  email: "marcus.wilson@example.com",
  joinDate: "2021-03-15",
  lastActive: "2023-07-07",
  status: "banned",
  banInfo: {
    reason: "Harassment",
    date: "2023-07-08",
    duration: "90 days",
    expiryDate: "2023-10-06",
    banningAdmin: "Admin_Sarah",
    notes:
      "Multiple reports from different users about targeted harassment in gaming forums. User has been warned twice before.",
  },
  appeals: [
    {
      id: "AP-4532",
      date: "2023-07-10",
      status: "rejected",
      reason: "I didn't harass anyone, they were just sensitive about losing the game.",
      adminResponse: "Evidence reviewed shows clear pattern of harassment. Appeal denied.",
    },
    {
      id: "AP-5621",
      date: "2023-07-20",
      status: "rejected",
      reason: "I've learned my lesson and won't do it again. Please unban me.",
      adminResponse: "Too soon after previous appeal. Ban remains in effect.",
    },
    {
      id: "AP-7890",
      date: "2023-08-15",
      status: "pending",
      reason:
        "I've taken time to reflect on my actions and understand why they were harmful. I apologize sincerely and promise to follow community guidelines going forward.",
      adminResponse: null,
    },
  ],
  violations: [
    {
      id: "V-1234",
      date: "2023-05-20",
      type: "Warning",
      reason: "Inappropriate language",
      action: "Warning issued",
    },
    {
      id: "V-2345",
      date: "2023-06-15",
      type: "Temporary Mute",
      reason: "Argument with moderator",
      action: "24-hour mute",
    },
    {
      id: "V-3456",
      date: "2023-07-01",
      type: "Warning",
      reason: "Harassment (first incident)",
      action: "Final warning issued",
    },
    {
      id: "V-4567",
      date: "2023-07-08",
      type: "Ban",
      reason: "Harassment (continued)",
      action: "90-day ban",
    },
  ],
  activityStats: {
    postsBeforeBan: 342,
    commentsBeforeBan: 1205,
    reportsAgainstUser: 17,
    warningsReceived: 5,
    previousBans: 0,
  },
}

export default function DashViewUserInfo() {
  const { id } = useParams<{ id: string }>();
  const [activeAppeal, setActiveAppeal] = useState(userData.appeals[2])
  const [appealStatus, setAppealStatus] = useState(activeAppeal.status)
  const today = new Date()
  const expiryDate = new Date(userData.banInfo.expiryDate)
  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  const banProgress = 90 - daysRemaining // Assuming 90-day ban
  const progressPercentage = (banProgress / 90) * 100
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
      const { onlineUsers = [] } = useSocket(); // Ensure default empty array
      const [banData, setBanData] = useState([])
      const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    // Fetch both current and previous bans
    Promise.all([
      axiosInstance.get(`/user/ban-info/${id}`).catch(() => null),
      axiosInstance.get(`/user/previous-bans/${id}`).catch(() => null),
    ])
      .then(([currentBanRes, previousBansRes]) => {
        const currentBan = currentBanRes?.data ? [{ ...currentBanRes.data, status: "active" }] : []
        const previousBans = previousBansRes?.data || []

        // Sort bans by banDate (newest first)
        const sortedBans = [...currentBan, ...previousBans].sort((a, b) => new Date(b.banDate) - new Date(a.banDate))

        setBanData(sortedBans)
      })
      .catch((err) => console.error("Error fetching bans:", err))
      .finally(() => setIsLoading(false))
  }, [user])
  const formatDate = (dateString) => {
    if (!dateString) return "Permanent"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }
  const getRemainingTime = (expiryDate) => {
    if (!expiryDate) return "Permanent"

    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffMs = expiry - now // Get the difference in milliseconds

    if (diffMs <= 0) return "Expired"

    // Convert milliseconds to hours and round up to ensure we don't show 0 hours when time is remaining
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) {
      return "Less than 1 hour"
    }

    const diffDays = Math.floor(diffHours / 24)
    const remainingHours = diffHours % 24

    return diffDays > 0
      ? `${diffDays} day${diffDays !== 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`
      : `${diffHours} hour${diffHours !== 1 ? "s" : ""}`
  }

  // Replace the getStatusText function with this improved version
  const getStatusText = (ban) => {
    if (!ban.expiryDate) return "Permanent" // Handle permanent bans

    const now = new Date()
    const expiry = new Date(ban.expiryDate)

    // Add a small buffer (1 minute) to prevent edge cases
    if (expiry <= new Date(now.getTime() - 60000)) {
      return "Expired"
    }

    // Get the remaining time
    const timeRemaining = getRemainingTime(ban.expiryDate)

    // If getRemainingTime returns "Expired", just return "Expired" without the "Active -" prefix
    if (timeRemaining === "Expired") {
      return "Expired"
    }

    return `Active - ${timeRemaining} remaining`
  }


  const fetchUserInfoById = async () => {
    try {
      const response = await axiosInstance.get(`/dash/fetch-userbyid/${id}`);
      setUser(response.data); // Data is already sorted (latest first)
      console.log(response.data)
      setLoading(false);
    } catch (err) {
      setError("An error occurred while fetching user information...");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfoById();
  }, []);
  const onlineUser = onlineUsers.find((u) => u.userId === user?._id);
                
  // Determine status (default to "offline" if not found)
  const status = onlineUser?.status || "offline";
  const statusStyles = {
    online: "bg-green-500/20 font-normal capitalize text-[11px] text-green-400 border-green-500/30",
    away: "bg-yellow-500/20 font-normal capitalize text-[11px] text-yellow-400 border-yellow-500/30",
    offline: "bg-slate-500/20 font-normal capitalize text-[11px] text-slate-400 border-slate-500/30",
  };
  
  // Use it like this
  const getStatusStyle = (status) => statusStyles[status] || "";
  return (
      <div className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <div className="mb-6">
            <CustomLink
              href="/dashboard"
              className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </CustomLink>
          </div>
          {/* User profile header */}
          <div className="relative mb-8 overflow-hidden rounded-xl border border-gray-800/50 bg-gray-950/50 backdrop-blur-md p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5757]/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff5757]/5 blur-3xl rounded-full -ml-32 -mb-32 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-[#ff5757] opacity-100"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[#ff5757] opacity-100 animate-pulse"></div>
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} alt={user?.firstName} />
                  <AvatarFallback className="text-2xl bg-gray-800"></AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl">{user?.firstName} {user?.lastName}</h1>
                  <Badge className={getStatusStyle(status)}>
                  {status}
                  </Badge>
                  {user?.isBanned && 
                  <Badge variant="destructive" className="bg-[#ff5757]/20 text-[#ff5757] border-[#ff5757]/50 px-2 font-normal">
                    Banned
                  </Badge>
                  }
                </div>
                <p className="text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1  text-xs"><Biohazard className="h-3.5 w-3.5 text-red-400"/> {user?.bio || "No Bio Provided"}</span>
                </p>
              </div>              
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div>
              <Card className="bg-gray-950/50 backdrop-blur-md border-gray-800/50 overflow-hidden sticky relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757]/5 via-transparent to-transparent opacity-50"></div>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2 font-normal">Informations</span>
                    <div className="h-2 w-2 rounded-full bg-[#ff5757] animate-pulse shadow-[0_0_8px_rgba(255,87,87,0.8)]"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                  <div>
                  <div className="grid gap-3">
             <div className="flex items-center gap-1 text-sm"><IdCardIcon className="h-4 w-4 text-[#ff5757]" /> {user?._id}</div>
             <div className="flex items-center gap-1 text-sm lowercase"><AtSign className="h-4 w-4 text-[#ff5757]" /> {user?.username}</div>
             <div className="flex items-center gap-1 text-sm"><Globe className="h-4 w-4 text-[#ff5757]" /> {user?.country || "Unknown"}, {user?.city || "Unknown"}</div>
             <div className="flex items-center gap-1 text-sm"><Mail className="h-4 w-4 text-[#ff5757]" /> {user?.emailAddress || "Unknown Email"}</div>
             <div className="flex items-center gap-1 text-sm"><Phone className="h-4 w-4 text-[#ff5757]" /> {user?.phoneNumber || "No Phone Provided"}</div>
             <div className="flex items-center gap-1 text-sm"><Calendar className="h-4 w-4 text-[#ff5757]" />Joined: {user?.createdAt ? format(new Date(user.createdAt), "PPpp") : "N/A"}</div>
            </div>
            <Separator className="my-4 bg-gray-800/50" />
            <div className="grid gap-3">
             <div className="flex items-center gap-1 text-sm capitalize">                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-gender-ambiguous text-[#ff5757]"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.5 1a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-3.45 3.45A4 4 0 0 1 8.5 10.97V13H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V14H6a.5.5 0 0 1 0-1h1.5v-2.03a4 4 0 1 1 3.471-6.648L14.293 1zm-.997 4.346a3 3 0 1 0-5.006 3.309 3 3 0 0 0 5.006-3.31z"
                  />
                </svg> {user?.gender}</div>
             <div className="flex items-center gap-1 text-sm"><CalendarArrowDown className="h-4 w-4 text-[#ff5757]" />Born On : {user?.userBirthDate}</div>
             <div className="flex items-center gap-1 text-sm"><CalendarCheck className="h-4 w-4 text-[#ff5757]" />Age :  {user?.userAge || "Unknown"}</div>
            </div>
            <Separator className="my-4 bg-gray-800/50" />
            <div className="grid gap-3">
            {user?.verifiedEmail ?  <div className="flex items-center gap-1 text-[13px] text-[#3d8c39] "><CircleCheck className="h-4 w-4" />Verified Email</div> : <div className="flex items-center gap-1 text-[#ff5757] text-[13px]"><ShieldBan className="h-4 w-4" />Unverified Email</div>}
            {user?.isAdmin ?  <div className="flex items-center gap-1 text-[13px] text-[#3d8c39] "><CircleCheck className="h-4 w-4" />Admin Access Granted</div> : <div className="flex items-center gap-1 text-[#ff5757] text-[13px]"><ShieldBan className="h-4 w-4" />Admin Access Denied</div>}
            {user?.twoFactorEnabled ?  <div className="flex items-center gap-1 text-[13px] text-[#3d8c39] "><CircleCheck className="h-4 w-4" />2FA Enabled</div> : <div className="flex items-center gap-1 text-[#ff5757] text-[13px]"><ShieldBan className="h-4 w-4" />2FA Disabled</div>}
            </div>
            <Separator className="my-4 bg-gray-800/50" />
            <div className="grid gap-3">
             <div className="flex items-center gap-1 text-[13px] uppercase">IP : {user?.ip || "Unknown IP"}</div>
             <div className="flex items-center gap-1 text-[13px] uppercase">ORGANIZATION : {user?.org || "Unknown ORGANIZATION"}</div>
             <div className="flex items-center gap-1 text-[13px] uppercase">POSTAL : {user?.postal || "Unknown POSTAL"}</div>
             <div className="flex items-center gap-1 text-[13px] uppercase">version : {user?.version || "Unknown version"}</div>
             <div className="flex items-center gap-1 text-[13px] uppercase">network : {user?.network || "Unknown network"}</div>
             <div className="flex items-center gap-1 text-[13px] uppercase">capital : {user?.country_capital || "Unknown capital"}</div>
            </div>
                  </div>

                    <Separator className="my-4 bg-gray-800/50" />

                    <div>
                      <h3 className="text-sm text-gray-400">Admin Actions</h3>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        <Button
                          variant="outline"
                          className="justify-start border-gray-800 bg-gray-900/70 hover:bg-gray-800 transition-all duration-300 font-normal"
                        >
                          <FileText className="mr-2 h-4 w-4 text-[#ff5757]" />
                          View User Log's
                        </Button>
                        <Sheet>
  <SheetTrigger>                        <Button
                          variant="outline"
                          className="justify-start border-gray-800 bg-gray-900/70 hover:bg-gray-800 transition-all duration-300 font-normal w-full"
                        >
                          <Edit className="mr-2 h-4 w-4 text-[#ff5757]" />
                          Edit User
                        </Button></SheetTrigger>
  <SheetContent className="overflow-y-auto bg-gradient-to-br from-[#ff5757]/5 via-transparent to-transparent bg-[#000000] text-white border-none">
    <SheetHeader>
      <SheetTitle className="font-normal">Editing {user?.firstName}'s Informations</SheetTitle>
      <ViewProfile
                                   name={user?.firstName} 
                                   email={user?.emailAddress} 
                                   status={status} 
                                   scName={user?.lastName} 
                                   avatar={user?.avatar} 
                                   region={user?.country} 
                                   _id={user?._id}
                                   joined={user?.createdAt}
                                   username={user?.username}
                                   userAge={user?.userAge}
                                   userBirthDate={user?.userBirthDate}
                                   gender={user?.gender}
                                   phoneNumber={user?.phoneNumber}
                                   bio={user?.bio}
                                   verifiedEmail={user?.verifiedEmail}
                                   isAdmin={user?.isAdmin}
                                   twoFactorEnabled={user?.twoFactorEnabled}
                                   ip={user?.ip}
                                   org={user?.org}
                                   postal={user?.postal}
                                   isBanned={user?.isBanned}
                                   version={user?.version}
                                   country_name={user?.country_name}
                                   onRefresh={fetchUserInfoById}
                                   network={user?.network}
                                   country_capital={user?.country_capital}
                                   city={user?.city}
                                    />

    </SheetHeader>
  </SheetContent>
</Sheet>

                      <BanUser _id={user?._id} isBanned={user?.isBanned} name={user?.firstName} onRefresh={fetchUserInfoById}/>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
            {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-2 border-4 border-t-[#ff5757] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-[#ff5757] border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-[#ff5757] border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-[#ff5757] border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-[#ff5757] font-mono text-sm tracking-wider">LOADING BAN DATA</div>
          </div>
        ) : banData.length === 0 ? (
          <Card className="mb-6 border-[#57ff73]/20 bg-[#57ff73]/10 text-white">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="mt-0.5 shrink-0">
                <CircleCheck className="h-5 w-5 text-[#43b946]" />
              </div>
              <div>
                <h3 className="mb-1">{user?.firstName} Doesn't have any previous or current bans</h3>
                <p className="text-xs text-zinc-300">
                  All features are fully available for {user?.firstName}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {user?.isBanned && (
              <Card className="mb-6 border-[#ff5757]/20 bg-[#ff5757]/10 text-white">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="mt-0.5 shrink-0">
                    <AlertCircle className="h-5 w-5 text-[#ff5757]" />
                  </div>
                  <div>
                    <h3 className="mb-1">{user?.firstName} currently has active restrictions</h3>
                    <p className="text-xs text-zinc-300">
                      Some features may be limited until these restrictions expire for {user?.firstName}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <h1 className="flex items-center gap-2">Previous & Active Restrictions  <div className="h-2 w-2 rounded-full bg-[#ff5757] animate-pulse shadow-[0_0_8px_rgba(255,87,87,0.8)]"></div></h1>
              {banData.length > 0 ? (
                banData.map((ban) => (
                  <Card key={ban.caseId} className="bg-gray-950/90 backdrop-blur-md border-gray-800/50 overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757]/5 via-transparent to-transparent opacity-50 -z-1"></div>
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <CardDescription className="text-zinc-400 mt-1">
                            Account Restricted • Issued on {formatDate(ban.banDate)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h3 className="mb-1 text-sm text-zinc-400">Reason</h3>
                          <p className="text-sm text-gray-200">{ban.reason}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <h3 className="mb-1 text-sm text-zinc-400">Status</h3>
                            <div className="flex items-center gap-2">
                              {new Date(ban.expiryDate) > new Date() ? (
                                <Clock className="h-4 w-4 text-[#ff5757]" />
                              ) : (
                                <Calendar className="h-4 w-4 text-zinc-400" />
                              )}
                              <p className={`text-sm ${new Date(ban.expiryDate) > new Date() ? "text-[#ff5757]" : ""}`}>
                                {getStatusText(ban)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h3 className="mb-1 text-sm text-zinc-400">Appeal Status</h3>
                            <div className="text-sm flex items-center gap-1">
                              {ban.appealStatus && (
                                <span
                                  className={`flex items-center gap-1 ${
                                    ban.appealStatus === "approved"
                                      ? "text-green-400"
                                      : ban.appealStatus === "pending"
                                        ? "text-yellow-400"
                                        : ban.appealStatus === "rejected"
                                          ? "text-red-400"
                                          : "text-gray-400"
                                  }`}
                                >
                                  {ban.appealStatus === "approved" && <CheckCircle className="h-4 w-4" />}
                                  {ban.appealStatus === "pending" && <Clock className="h-4 w-4" />}
                                  {ban.appealStatus === "rejected" && <XCircle className="h-4 w-4" />}
                                  {ban.appealStatus === "none" && <Info className="h-4 w-4" />}
                                  {ban.appealStatus.charAt(0).toUpperCase() + ban.appealStatus.slice(1)}
                                </span>
                              )}
                            </div>
                            
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm text-zinc-400">Issued By</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm">
                              {ban.bannedByWho.firstName || "Unknown"}{" "}
                              {ban.bannedByWho.lastName ? ban.bannedByWho.lastName.charAt(0) + "." : ""}
                            </p>
                            
                          </div>
{ban.appealExplanation && 
                          <Dialog>
                          <DialogTrigger>
                            <p
                              className=" text-[#ff5757] text-xs cursor-pointer hover:underline"
                            >
                             Appeal Explanation
                            </p>
                          </DialogTrigger>
                          <DialogContent className="bg-[#141313] text-gray-200 border-none">
                            <DialogHeader>
                              <DialogTitle className="font-normal text-red-400">Appeal Explanation</DialogTitle>
                              <DialogDescription className="text-xs text-gray-300">
                                This is the explanation you provided for your un-ban request.
                              </DialogDescription>
                              <DialogDescription className="border-t border-[#ff5757]">
                                <div className="mt-2">{ban.appealExplanation}</div>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-800 bg-zinc-950 px-6 py-3 flex justify-between">
                      <div className="text-xs text-zinc-500">CASE ID : {ban.caseId}</div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="border-zinc-800 bg-zinc-900 text-white">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Shield className="mb-4 h-12 w-12 text-green-400" />
                    <h3 className="mb-2 text-xl">Your account is in good standing</h3>
                    <p className="text-center text-zinc-400 max-w-md">
                      You have no current or past account restrictions. Keep following our community guidelines to
                      maintain your good standing.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

                  {/* <Card className="bg-gray-950/50 backdrop-blur-md border-gray-800/50 overflow-hidden relative mt-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757]/5 via-transparent to-transparent opacity-50"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="mr-2">Appeal History</span>
                        <div className="h-2 w-2 rounded-full bg-[#ff5757] animate-pulse shadow-[0_0_8px_rgba(255,87,87,0.8)]"></div>
                      </CardTitle>
                      <CardDescription>All appeals submitted by the user</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="grid gap-6">
                        {userData.appeals.map((appeal) => (
                          <div
                            key={appeal.id}
                            className={`rounded-lg border p-4 transition-all duration-300 ${
                              appeal.id === activeAppeal.id
                                ? "border-[#ff5757]/50 bg-[#ff5757]/5"
                                : "border-gray-800/50 bg-gray-900/50 hover:border-gray-700"
                            }`}
                            onClick={() => setActiveAppeal(appeal)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{appeal.id}</h3>
                                  <Badge
                                    variant={
                                      appeal.status === "pending"
                                        ? "outline"
                                        : appeal.status === "approved"
                                          ? "success"
                                          : "destructive"
                                    }
                                    className={
                                      appeal.status === "pending"
                                        ? "border-yellow-500 text-yellow-500 bg-yellow-500/10"
                                        : appeal.status === "approved"
                                          ? "bg-green-500/20 text-green-500 border-green-500/50"
                                          : "bg-red-500/20 text-red-500 border-red-500/50"
                                    }
                                  >
                                    {appeal.status.charAt(0).toUpperCase() + appeal.status.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  Submitted on {new Date(appeal.date).toLocaleDateString()}
                                </p>
                                <p className="mt-2 text-sm line-clamp-2">{appeal.reason}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white"
                                onClick={() => setActiveAppeal(appeal)}
                              >
                                {appeal.id === activeAppeal.id ? "Active" : "View"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-950/50 backdrop-blur-md border-gray-800/50 overflow-hidden relative mt-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757]/5 via-transparent to-transparent opacity-50"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="mr-2">Violation History</span>
                        <div className="h-2 w-2 rounded-full bg-[#ff5757] animate-pulse shadow-[0_0_8px_rgba(255,87,87,0.8)]"></div>
                      </CardTitle>
                      <CardDescription>Record of all violations and actions taken</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="relative pl-6 border-l border-gray-800">
                        {userData.violations.map((violation, index) => (
                          <div key={violation.id} className="mb-6 last:mb-0">
                            <div className="absolute left-0 w-3 h-3 -translate-x-1.5 mt-1.5 rounded-full bg-[#ff5757] shadow-[0_0_8px_rgba(255,87,87,0.8)]"></div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h3 className="font-medium">{violation.reason}</h3>
                                <p className="text-xs text-gray-400">{new Date(violation.date).toLocaleDateString()}</p>
                              </div>
                              <Badge
                                className={
                                  violation.type === "Warning"
                                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                                    : violation.type === "Temporary Mute"
                                      ? "bg-blue-500/20 text-blue-500 border-blue-500/50"
                                      : "bg-red-500/20 text-red-500 border-red-500/50"
                                }
                              >
                                {violation.type}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm">{violation.action}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card> */}
            </div>

            {/* Right column */}
          </div>
        </div>
      </div>
  )
}

