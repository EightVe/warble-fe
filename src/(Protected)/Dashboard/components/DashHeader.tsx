import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bell, Search } from 'lucide-react'
import React from 'react'
import Logo from "@/assets/img/mainLogo.png"
export default function DashHeader() {
  return (
    <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
    <div className="flex items-center space-x-2">
      <img src={Logo} alt="" className="h-8 w-8" />
      <span className="text-sm bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] bg-clip-text text-transparent">
        Warble Dashboard
      </span>
    </div>

    <div className="flex items-center space-x-6">
      <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search users..."
          className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
        />
      </div>

      <div className="flex items-center space-x-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#ff5757] rounded-full animate-pulse"></span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
          <AvatarFallback className="bg-slate-700 text-[#ff5757]">AD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  </header>
  )
}
