"use client"

import { Globe, Plus, Search, Tv, Users } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Link, useLocation } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "@/contexts/AuthContext"
import Logo from "@/assets/img/mainLogo.png"
import CustomLink from "@/hooks/useLink"
import { HeaderNotifications } from "@/(Protected)/Notifications/HeaderNotifications"
import coinLogo from '@/assets/img/coin_logo.png'
export default function Header() {
  const { user } = useContext(AuthContext) || {};
  const location = useLocation();

  const getLinkClass = (path: string) => {
    return location.pathname === path ? "text-[#ff5757]" : "text-gray-600";
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-300 bg-[#fcfcfc] px-4">
      <div className="flex items-center gap-4 md:gap-8">
        <Link to="/feed" className="flex items-center gap-2">
          <img src={Logo} alt="Warble" width={32} height={32} />
          <span className="text-lg tracking-tight text-[#ff5757] hidden md:inline">Warble.chat</span>
        </Link>
        <div className="relative xl:hidden">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Explore..."
            className="w-full rounded-lg border bg-[#ececec] border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none text-gray-600" 
          />
        </div>
      </div>
      <nav className="hidden xl:flex items-center gap-6">
        <CustomLink href="/feed" className={`font-normal flex items-center gap-1 text-sm  transition-all duration-200 ${getLinkClass('/feed')}`}>
          <div className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-200 ${location.pathname === '/feed' ? 'bg-[#ff5757] transition-all duration-200' : ''}`}>
            <Globe className={`h-4 w-4 ${location.pathname === '/feed' ? 'text-white' : 'text-gray-600'}`} />
          </div> Global
        </CustomLink>
        <CustomLink href="/feed/ft/friends" className={`font-normal flex items-center gap-1 text-sm transition-all duration-200  ${getLinkClass('/feed/ft/friends')}`}>
        <div className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-200 ${location.pathname === '/feed/ft/friends' ? 'bg-[#ff5757] transition-all duration-200' : ''}`}>
            <Users className={`h-4 w-4 ${location.pathname === '/feed/ft/friends' ? 'text-white' : 'text-gray-600'}`} />
          </div>  Friends
        </CustomLink>
        <CustomLink href="/feed/ft/channels" className={`font-normal flex items-center gap-1 text-sm transition-all duration-200  ${getLinkClass('/feed/ft/channels')}`}>
        <div className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-200 ${location.pathname === '/feed/ft/channels' ? 'bg-[#ff5757] transition-all duration-200' : ''}`}>
            <Tv className={`h-4 w-4 ${location.pathname === '/feed/ft/channels' ? 'text-white' : 'text-gray-600'}`} />
          </div> Channels
        </CustomLink>
      </nav>
      <div className="flex items-center gap-4">
        <button className="hidden rounded-full p-2 hover:bg-gray-100">
          <Search className="h-5 w-5 text-gray-600" />
        </button>
        <p className="hidden md:flex rounded-full items-center text-gray-500 text-sm">
          <img src={coinLogo} width={35} height={35}/>
          0
        </p>
        <HeaderNotifications />
        <Avatar>
          <AvatarImage src={user?.avatar} alt="User" />
        </Avatar>
      </div>
    </header>
  )
}
