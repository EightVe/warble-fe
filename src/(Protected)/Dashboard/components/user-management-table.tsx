import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ban, Check, Eye, Filter, Loader2, MoreHorizontal, Search, ShieldBan, Users } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSocket } from '@/contexts/SocketContext'
import { formatDistanceToNow } from "date-fns"
import axiosInstance from '@/lib/axiosInstance'

export default function UserManagementTable({ }) {
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

  // State for filtering and searching
  const [filterType, setFilterType] = useState("all");
  const [searchType, setSearchType] = useState("email");
  const [searchQuery, setSearchQuery] = useState("");
  // Filter logic
  const filteredUsers = users.filter(user => {
      // Status checking
      const onlineUser = onlineUsers.find((u) => u.userId === user._id);
      const status = onlineUser?.status || "offline";

    if (filterType === "admins" && !user.isAdmin) return false;
    if (filterType === "banned" && !user.isBanned) return false;
    if (filterType === "online" && status !== "online") return false;
    if (filterType === "offline" && status !== "offline") return false;
    if (filterType === "away" && status !== "away") return false;

    // Search filtering
    const query = searchQuery.toLowerCase();
    if (searchType === "email" && !user.emailAddress.toLowerCase().includes(query)) return false;
    if (searchType === "username" && !user.username?.toLowerCase().includes(query)) return false;
    if (searchType === "id" && !user._id.includes(query)) return false;

    return true;
  });

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4 gap-2">
        {/* Search Input */}
        <div className="flex gap-2 items-center w-full ">
          <Input
            type="text"
            placeholder={`Search by ${searchType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/40 text-white border-none outline-none outline-0 ring-0 focus:ring-0 focus:border-none"
          />
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-[120px] bg-slate-800/40 text-white border border-slate-700/50">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent className='bg-slate-800/40 border border-slate-700/50 text-white font-normal0 outline-none focus:ring-0' >
              <SelectItem value="email" className='flex items-center gap-1 font-normal'>Email</SelectItem>
              <SelectItem value="username" className='flex items-center gap-1 font-normal'>Username</SelectItem>
              <SelectItem value="id" className='flex items-center gap-1 font-normal'>ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-slate-800/40 border border-slate-700/50 text-white font-normal">
              <Filter /> {filterType === "all" ? "All Users" : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border border-slate-700/50 text-white">
            <DropdownMenuItem onClick={() => setFilterType("all")}>All Users</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("admins")}>Admins</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("banned")}>Banned</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("online")}>Online</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("away")}>Away</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("offline")}>Offline</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
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
                <TableCell colSpan={5} className="text-center text-slate-400 text-sm p-3 h-32">
                  <Loader2 className="animate-spin mx-auto h-6 w-6 text-white" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-400 text-sm font-normal p-3 h-32">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserRow 
                key={user._id} user={user} onlineUsers={onlineUsers} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 text-sm">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


function UserRow({ user, onlineUsers }) {
    // Get the user's online status
    const onlineUser = onlineUsers.find((u) => u.userId === user._id);
    const status = onlineUser?.status || "offline";
  
    // Assign colors based on status
    const statusStyles = {
      online: "bg-green-500/20 font-normal capitalize text-[11px] text-green-400 border-green-500/30",
      away: "bg-yellow-500/20 font-normal capitalize text-[11px] text-yellow-400 border-yellow-500/30",
      offline: "bg-slate-500/20 font-normal capitalize text-[11px] text-slate-400 border-slate-500/30",
    };
  
    // Format the joined date
    const formattedJoinedDate = user.createdAt
      ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
      : "Unknown";
  
    return (
      <TableRow className="hover:bg-slate-800/50">
        <TableCell className="">
          <div className="flex items-center space-x-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatar} alt={user.firstName} />
              <AvatarFallback className="bg-slate-700 text-[#ff5757]"></AvatarFallback>
            </Avatar>
            <div>
              <div className="font-normal text-slate-200">
                {user.firstName} {user.lastName}{" "}
                {user.isAdmin && <span className='text-slate-200 bg-red-400/20 text-[10px] px-1 rounded-full'>Admin</span>}
              </div>
              <div className="text-xs text-slate-500">{user.emailAddress}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge className={statusStyles[status] || statusStyles["offline"]}>
            {status}
          </Badge>
        </TableCell>
        <TableCell className="text-slate-400 text-xs">{user.country || "Unknown"}</TableCell>
        <TableCell className="text-slate-500 text-xs">{formattedJoinedDate}</TableCell>
        <TableCell className="text-right">
          <a href={`/dashboard/user-management/${user._id}/view-details`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </a>
        </TableCell>
      </TableRow>
    );
  }