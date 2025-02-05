"use client"

import { Home, Users, ShoppingBag, Calendar, Newspaper, Search, User, Bell, Video, Calendar1 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "@/contexts/AuthContext"
import CustomLink from "@/hooks/useLink"
import { Button } from "react-day-picker"

export default function RightSidebar() {
    const {user} = useContext(AuthContext) || {};
  return (
    <div className="w-72 p-4 hidden xl:block h-full bg-[#edeef0] flex-shrink-0">
      <nav className="space-y-1 bg-[#f6f6f6] p-1 py-2 rounded-xl">
        <p>Quick Message</p>
        <CustomLink href="/feed" className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-[#ff5757] hover:bg-[#ececec] transition-all duration-150">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </CustomLink>
        <CustomLink
          href="/notifications#full-v"
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#ececec]"
        >
          <Bell className="h-4 w-4" />
          <span className="flex items-center justify-between w-full">Notifications <div className="h-[18px] w-[18px] bg-gradient-to-tr from-[#ff078e] to-[#ff2941] rounded-full flex items-center justify-center">
          <span className="text-xs text-[#f3f3f3]">2</span></div></span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#ececec]"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#ececec]"
        >
          <Users className="h-4 w-4" />
          <span>Manage Requests</span>
        </CustomLink>
        <CustomLink
          href={`/p/${user?.username}`}
          className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#ececec]"
        >
          <Calendar1 className="h-4 w-4" />
          <span>Events</span>
        </CustomLink>
        <CustomLink href="/feed" className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 text-gray-600 hover:bg-[#ececec] transition-all duration-150">
          <Video className="h-4 w-4" />
          <span className="flex items-center justify-between w-full">Omegalo <div className="h-[18px] px-1.5 bg-gradient-to-tr from-[#ff078e] to-[#ff2941] rounded-full flex items-center justify-center">
          <span className="text-xs text-[#f3f3f3]">New</span></div></span>
        </CustomLink>
      </nav>

      <div className="mt-4 bg-[#f6f6f6] p-1 py-3 rounded-xl">
        <h3 className="mb-2 flex items-center justify-between px-3 text-sm text-gray-600">
          My Channels
          <span className="text-sm text-gray-500">2</span>
        </h3>
        <div className="space-y-2">
          {communities.map((community) => (
            <Link
              key={community.name}
              to="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
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
      </div>
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

