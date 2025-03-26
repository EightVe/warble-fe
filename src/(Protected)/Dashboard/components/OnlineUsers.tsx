import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import React from 'react'

export default function OnlineUsers() {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-slate-100 text-sm flex items-center font-normal">
        <Users className="mr-2 h-4 w-4 text-[#ff5757]" />
        Online Users
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-3">
        <OnlineUserItem
          name="Alex Johnson"
          status="In call"
          time="45 min"
          avatar="/placeholder.svg?height=32&width=32"
        />
        <OnlineUserItem
          name="Sarah Miller"
          status="Browsing"
          time="12 min"
          avatar="/placeholder.svg?height=32&width=32"
        />
        <OnlineUserItem
          name="James Wilson"
          status="In call"
          time="28 min"
          avatar="/placeholder.svg?height=32&width=32"
        />
        <OnlineUserItem
          name="Emma Davis"
          status="Browsing"
          time="5 min"
          avatar="/placeholder.svg?height=32&width=32"
        />
        <OnlineUserItem
          name="Michael Brown"
          status="Idle"
          time="2 min"
          avatar="/placeholder.svg?height=32&width=32"
        />
      </div>
      <Button
        variant="outline"
        className="w-full mt-3 text-xs text-[#ff5757ba] border-[#ff5757]/30 hover:bg-[#ff5757]/10"
      >
        View All Users
      </Button>
    </CardContent>
  </Card>
  )
}

function OnlineUserItem({
    name,
    status,
    time,
    avatar,
  }: {
    name: string
    status: string
    time: string
    avatar: string
  }) {
    const getStatusColor = () => {
      switch (status) {
        case "In call":
          return "bg-green-500"
        case "Browsing":
          return "bg-blue-500"
        case "Idle":
          return "bg-amber-500"
        default:
          return "bg-slate-500"
      }
    }
  
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-slate-700 text-[#ff5757]">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${getStatusColor()} border-2 border-slate-900`}
            ></div>
          </div>
          <div>
            <div className="text-sm text-slate-300">{name}</div>
            <div className="text-xs text-slate-500">{status}</div>
          </div>
        </div>
        <div className="text-xs text-[#ff5757]">{time}</div>
      </div>
    )
  }
