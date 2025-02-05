"use client"

import { Home, Users, User, Bell, Video, Calendar1, Store, Radio, ChartColumnBig, Cctv, LoaderPinwheel } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "react-router-dom"
import { useContext, useEffect } from "react"
import { AuthContext } from "@/contexts/AuthContext"
import CustomLink from "@/hooks/useLink"
import { motion } from "framer-motion"
import { useSocket } from "@/contexts/SocketContext"
import axiosInstance from "@/lib/axiosInstance"
interface Notification {
  _id: string;
  userId: string;
  senderId: string;
  type: "mention" | "like" | "comment" | "follow";
  title: string;
  description: string;
  userAvatar: string;
  read: boolean;
  createdAt: string;
}
export default function LeftSidebar() {
      const { user } = useContext(AuthContext) || {};
      const { notifications, setNotifications } = useSocket();
      const userId = user?._id;
      useEffect(() => {
        if (!userId) return;
    
        const fetchNotifications = async () => {
          try {
            const { data } = await axiosInstance.get<Notification[]>(`/notifications/${userId}`);
            setNotifications(data);
          } catch (error) {
            console.error("❌ Error fetching notifications:", error);
          }
        };
    
        fetchNotifications();
      }, [userId, setNotifications]);
      const unreadNotifications = notifications.filter((n) => !n.read);
      const unreadCount = unreadNotifications.length;
  return (
    <div className="w-72 p-4 hidden xl:block h-full pl-4 bg-[#edeef0] flex-shrink-0">
      <motion.nav className="space-y-1 bg-[#fff] p-1 py-2 rounded-xl" initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  viewport={{ once: true, amount: 0.2 }}>
        <CustomLink href="/feed" className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-[#ff5757] hover:bg-[#f5f6f8] transition-all duration-150">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </CustomLink>
        <CustomLink
          href="/notifications#full-v"
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <Bell className="h-4 w-4" />
          <span className="flex items-center justify-between w-full">Notifications
            
          {unreadCount > 0 && (
            <div className="h-[18px] w-[18px] bg-gradient-to-tr from-[#ff078e] to-[#ff2941] rounded-full flex items-center justify-center">
          <span className="text-xs text-[#f3f3f3]">{unreadCount}</span></div>
          )}
             </span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <Users className="h-4 w-4" />
          <span>Manage Requests</span>
        </CustomLink>
        <CustomLink
          href="/security-center"
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <LoaderPinwheel className="h-4 w-4" />
          <span>Daily Roulette</span>
        </CustomLink>
        <CustomLink
          href="/activity"
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <ChartColumnBig className="h-4 w-4" />
          <span>Activity</span>
        </CustomLink>
        <CustomLink
          href="/security-center"
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <Cctv className="h-4 w-4" />
          <span>Security Center</span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <Calendar1 className="h-4 w-4" />
          <span>Events</span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <Video className="h-4 w-4" />
          <span>Videos</span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <Store className="h-4 w-4" />
          <span>Shop</span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8]"
        >
          <Radio className="h-4 w-4" />
          <span>Live Streams</span>
        </CustomLink>
        <CustomLink href="/feed" className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#f5f6f8] transition-all duration-150">
          <Radio className="h-4 w-4" />
          <span className="flex items-center justify-between w-full">Omegalo <div className="h-[18px] px-1.5 bg-gradient-to-tr from-[#ff078e] to-[#ff2941] rounded-full flex items-center justify-center">
          <span className="text-xs text-[#f3f3f3]">New</span></div></span>
        </CustomLink>
      </motion.nav>

      <motion.div className="mt-4 bg-[#fff] p-1 py-3 rounded-xl"  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  viewport={{ once: true, amount: 0.2 }}>
        <h3 className="mb-2 flex items-center justify-between px-3 text-sm text-gray-600">
          My Channels
          <span className="text-sm text-gray-500">2</span>
        </h3>
        <div className="space-y-2">
          {communities.map((community) => (
            <Link
              key={community.name}
              to="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#f5f6f8]"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={community.image} />
                <AvatarFallback>{community.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <p className="text-sm text-gray-700">{community.name}</p>
                <p className="text-xs text-gray-400 capitalize">{community.members}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
      <motion.div className="flex items-center w-full flex-wrap gap-1.5 mt-2 px-2" 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1}}
      transition={{ duration: 1.7, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}>
        <Link className="text-gray-400 text-xs hover:underline" to='/'>Help Center</Link>
          <div className="bg-gray-400 h-1 w-1 rounded-full"></div>
          <Link className="text-gray-400 text-xs hover:underline" to='/'>About</Link>
          <div className="bg-gray-400 h-1 w-1 rounded-full"></div>
          <Link className="text-gray-400 text-xs hover:underline" to='/'>Report a Bug</Link>
          {/* <div className="bg-gray-500 h-1 w-1 rounded-full"></div> */}
          <Link className="text-gray-400 text-xs hover:underline" to='/'>Language</Link>
      </motion.div>
    </div>
  )
}

const communities = [
  {
    name: "FunTalk",
    members: "3 members",
    image: "/avatars/community-1.png",
  },
  {
    name: "English Prof",
    members: "128 members",
    image: "/avatars/community-2.png",
  },
  // Add more communities as needed
]

