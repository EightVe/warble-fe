"use client"

import { Home, Users, PlusCircle, Bell, Menu } from "lucide-react"
import { Link } from "react-router-dom"


export default function MobileNavigation() {
  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-[#ececec] border-t border-gray-300 flex justify-around items-center h-16 px-4 z-50">
      <Link to="/" className="flex flex-col items-center text-[#ff5757]">
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/community" className="flex flex-col items-center text-gray-600">
        <Users className="h-5 w-5" />
        <span className="text-xs mt-1">Community</span>
      </Link>
      <Link to="/new-post" className="flex flex-col items-center text-gray-600">
        <PlusCircle className="h-5 w-5" />
        <span className="text-xs mt-1">New Post</span>
      </Link>
      <Link to="/notifications" className="flex flex-col items-center text-gray-600">
        <Bell className="h-5 w-5" />
        <span className="text-xs mt-1">Notifications</span>
      </Link>
      <button className="flex flex-col items-center text-gray-600">
        <Menu className="h-5 w-5" />
        <span className="text-xs mt-1">Menu</span>
      </button>
    </nav>
  )
}

