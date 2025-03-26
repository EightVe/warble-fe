import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ban, Check, CircleOff, Edit, Eye, Loader2, MoreHorizontal, Trash2, Video } from 'lucide-react'
import axiosInstance from '@/lib/axiosInstance'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSocket } from '@/contexts/SocketContext'
export default function OverviewTables() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { onlineUsers = [] } = useSocket(); // Ensure default empty array
  const fetchRecentUsers = async () => {
    try {
      const response = await axiosInstance.get("/dash/recent-five-users");
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
  return (
    <div className="mt-8">
    <Tabs defaultValue="users" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="bg-slate-800/50 p-1 rounded-full">
          <TabsTrigger
            value="users"
            className="font-normal rounded-full cursor-pointer data-[state=active]:bg-slate-700/50 data-[state=active]:text-[#ff5757]"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="font-normal rounded-full cursor-pointer data-[state=active]:bg-slate-700/50 data-[state=active]:text-[#ff5757]"
          >
            Sessions
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="font-normal rounded-full cursor-pointer data-[state=active]:bg-slate-700/50 data-[state=active]:text-[#ff5757]"
          >
            Reports
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <div className="flex items-center text-[11px]">
            <div className="h-2 w-2 rounded-full bg-[#ff5757] mr-1 text-xs"></div>
            Users
          </div>
          <div className="flex items-center text-[11px]">
            <div className="h-2 w-2 rounded-full bg-[#afff8a] mr-1 text-xs"></div>
            Sessions
          </div>
          <div className="flex items-center text-[11px]">
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-1 text-xs"></div>
            Reports
          </div>
        </div>
      </div>
      <TabsContent value="users" className="mt-0">
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-800/50">
            <TableRow>
              <TableHead className="text-slate-400 text-xs font-normal">User</TableHead>
              <TableHead className="text-slate-400 text-xs font-normal">Status</TableHead>
              <TableHead className="text-slate-400 text-xs font-normal">Country</TableHead>
              <TableHead className="text-slate-400 text-xs font-normal">Joined</TableHead>
              <TableHead className="text-slate-400 text-right text-xs font-normal">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableHead colSpan={5} className="text-center text-slate-400 text-sm p-3 h-32">
<div className='flex flex-col gap-3'>
<div className='rounded-xl w-full animate-pulse'>
</div>
<div className='rounded-xl w-full animate-pulse flex items-center justify-center'>
  <Loader2 className=' animate-spin'/>
</div>
<div className='rounded-xl w-full animate-pulse'>
</div>
</div>
                </TableHead>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableHead colSpan={5} className="text-center text-red-400 text-sm font-normal p-3 h-32">
                  {error}
                </TableHead>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => {
                // Find user in onlineUsers array
                const onlineUser = onlineUsers.find((u) => u.userId === user._id);
                
                // Determine status (default to "offline" if not found)
                const status = onlineUser?.status || "offline";

                return (
                  <UserRow
                    key={user?._id}
                    name={user?.firstName}
                    scName={user?.lastName}
                    avatar={user?.avatar}
                    email={user?.emailAddress}
                    status={status} // Pass correct status
                    region={user?.country || "Unknown"}
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
                    version={user?.version}
                    country_name={user?.country_name}
                    network={user?.network}
                    country_capital={user?.country_capital}
                    city={user?.city}
                    _id={user?._id}
                    isBanned={user?.isBanned}
                    onRefresh={fetchRecentUsers}
                  />
                );
              })
            ) : (
              <TableRow>
                <TableHead colSpan={5} className="text-center text-slate-400 text-sm">
                  No recent users found.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TabsContent>

      <TabsContent value="sessions" className="mt-0">
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-800/50">
              <TableRow>
                <TableHead className="text-slate-400 text-xs font-normal">Session ID</TableHead>
                <TableHead className="text-slate-400 text-xs font-normal">Users</TableHead>
                <TableHead className="text-slate-400 text-xs font-normal">Duration</TableHead>
                <TableHead className="text-slate-400 text-xs font-normal">Quality</TableHead>
                <TableHead className="text-slate-400 text-right text-xs font-normal">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SessionRow
                id="VID-8294"
                users="Alex J. & Sarah M."
                duration="12:45"
                quality="Excellent"
              />
              <SessionRow id="VID-8293" users="James W. & Emma D." duration="08:32" quality="Good" />
              <SessionRow id="VID-8290" users="Michael B. & Lisa T." duration="24:18" quality="Fair" />
              <SessionRow id="VID-8289" users="David R. & Anna K." duration="05:47" quality="Poor" />
              <SessionRow id="VID-8287" users="Robert L. & Maria S." duration="16:03" quality="Good" />
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="reports" className="mt-0">
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-800/50">
              <TableRow>
                <TableHead className="text-slate-400 text-xs font-normal">Report ID</TableHead>
                <TableHead className="text-slate-400 text-xs font-normal">Reported User</TableHead>
                <TableHead className="text-slate-400 text-xs font-normal">Reason</TableHead>
                <TableHead className="text-slate-400 text-xs font-normal">Time</TableHead>
                <TableHead className="text-slate-400 text-right text-xs font-normal">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <ReportRow
                id="REP-4215"
                user="James Wilson"
                reason="Inappropriate behavior"
                time="35 min ago"
                severity="high"
              />
              <ReportRow
                id="REP-4214"
                user="Michael Brown"
                reason="Offensive language"
                time="1 hour ago"
                severity="medium"
              />
              <ReportRow
                id="REP-4212"
                user="David Roberts"
                reason="Spam content"
                time="3 hours ago"
                severity="low"
              />
              <ReportRow
                id="REP-4210"
                user="Lisa Thompson"
                reason="Inappropriate behavior"
                time="5 hours ago"
                severity="high"
              />
              <ReportRow
                id="REP-4208"
                user="Anna King"
                reason="Harassment"
                time="8 hours ago"
                severity="high"
              />
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  </div>
  )
}

import { formatDistanceToNow } from "date-fns";
import ViewProfile from './inside-actions/view-profile'
import CustomLink from '@/hooks/useLink'

function UserRow({ _id,onRefresh, isBanned, name, email, status, scName, avatar, region, joined,username,userAge,userBirthDate,gender,phoneNumber,bio,verifiedEmail,isAdmin,twoFactorEnabled,ip,org,postal,version,country_name,network,country_capital,city }) {
  // Assign colors based on status
  const statusStyles = {
    online: "bg-green-500/20 font-normal capitalize text-[11px] text-green-400 border-green-500/30",
    away: "bg-yellow-500/20 font-normal capitalize text-[11px] text-yellow-400 border-yellow-500/30",
    offline: "bg-slate-500/20 font-normal capitalize text-[11px] text-slate-400 border-slate-500/30",
  };

  // Format the joined date as "2 hours ago"
  const formattedJoinedDate = formatDistanceToNow(new Date(joined), { addSuffix: true });

  return (
    <TableRow className="hover:bg-slate-800/50">
      <TableCell className="">
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-slate-700 text-[#ff5757]"></AvatarFallback>
          </Avatar>
          <div>
            <div className="font-normal text-slate-200 flex items-center justify-start gap-1">{name} {scName} {isAdmin ? <span className='text-slate-200 bg-red-400/20 text-[10px] px-1 rounded-full'>Admin</span> : null}</div>
            <div className="text-xs text-slate-500">{email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={statusStyles[status] || statusStyles["offline"]}>
          {status}
        </Badge>
      </TableCell>
      <TableCell className="text-slate-400 text-xs">{region}</TableCell>
      <TableCell className="text-slate-500 text-xs">{formattedJoinedDate}</TableCell>
      <TableCell className="text-right">
      <a href={`/dashboard/user-management/${_id}/view-details`}>
      <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            </a>
      </TableCell>
    </TableRow>
  );
}


  
  // Session row component
  function SessionRow({
    id,
    users,
    duration,
    quality,
  }: {
    id: string
    users: string
    duration: string
    quality: "Excellent" | "Good" | "Fair" | "Poor"
  }) {
    const getQualityBadge = () => {
      switch (quality) {
        case "Excellent":
          return "bg-green-500/20 text-green-400 border-green-500/30"
        case "Good":
          return "bg-blue-500/20 text-blue-400 border-blue-500/30"
        case "Fair":
          return "bg-amber-500/20 text-amber-400 border-amber-500/30"
        case "Poor":
          return "bg-red-500/20 text-red-400 border-red-500/30"
        default:
          return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      }
    }
  
    return (
      <TableRow className="hover:bg-slate-800/50">
        <TableCell className="font-mono text-slate-400">{id}</TableCell>
        <TableCell className="text-slate-300">{users}</TableCell>
        <TableCell className="text-slate-400">{duration}</TableCell>
        <TableCell>
          <Badge className={getQualityBadge()}>{quality}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Video className="mr-2 h-4 w-4" />
                Join Session
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-500">
                <CircleOff className="mr-2 h-4 w-4" />
                End Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }
  
  // Report row component
  function ReportRow({
    id,
    user,
    reason,
    time,
    severity,
  }: {
    id: string
    user: string
    reason: string
    time: string
    severity: "high" | "medium" | "low"
  }) {
    const getSeverityBadge = () => {
      switch (severity) {
        case "high":
          return "bg-red-500/20 text-red-400 border-red-500/30"
        case "medium":
          return "bg-amber-500/20 text-amber-400 border-amber-500/30"
        case "low":
          return "bg-blue-500/20 text-blue-400 border-blue-500/30"
        default:
          return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      }
    }
  
    return (
      <TableRow className="hover:bg-slate-800/50">
        <TableCell className="font-mono text-slate-400">{id}</TableCell>
        <TableCell className="text-slate-300">{user}</TableCell>
        <TableCell>
          <div className="flex items-center">
            <span className="text-slate-400 mr-2">{reason}</span>
            <Badge className={getSeverityBadge()}>{severity}</Badge>
          </div>
        </TableCell>
        <TableCell className="text-slate-500">{time}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Review
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-green-500">
                <Check className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-500">
                <Ban className="mr-2 h-4 w-4" />
                Ban User
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-slate-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Dismiss
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }