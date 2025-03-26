import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, MessageSquare, Ticket } from 'lucide-react'
import React from 'react'

export default function RecentTickets() {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-slate-100 flex items-center text-sm font-normal">
        <Ticket className="mr-2 h-4 w-4 text-[#ff5757]" />
        Recent Tickets
      </CardTitle>
      <Badge variant="outline" className="bg-slate-800/50 text-[#ff5757] border-[#ff5757]/50">
        3 New Messages
      </Badge>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <CommunicationItem
          sender="System"
          time="15:42:12"
          message="User James Wilson has been automatically flagged for potential policy violation."
          avatar="/placeholder.svg?height=40&width=40"
          unread
        />
        <CommunicationItem
          sender="Moderator Sarah"
          time="14:30:45"
          message="I've reviewed the report for user Michael Brown. This appears to be a false positive."
          avatar="/placeholder.svg?height=40&width=40"
          unread
        />
        <CommunicationItem
          sender="Admin Alex"
          time="12:15:33"
          message="We need to update our content filtering rules. Too many false positives today."
          avatar="/placeholder.svg?height=40&width=40"
          unread
        />
        <CommunicationItem
          sender="System"
          time="09:05:18"
          message="Daily moderation report generated. 24 reports processed, 8 actions taken."
          avatar="/placeholder.svg?height=40&width=40"
        />
      </div>
    </CardContent>
    <CardFooter className="border-t border-slate-700/50 pt-4">
      <div className="flex items-center w-full space-x-2">
        <input
          type="text"
          placeholder="Type a message to moderators..."
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff5757]"
        />
        <Button size="icon" className="bg-[#ff5757] hover:bg-[#ff8a8a]">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  </Card>
  )
}
function CommunicationItem({
    sender,
    time,
    message,
    avatar,
    unread,
  }: {
    sender: string
    time: string
    message: string
    avatar: string
    unread?: boolean
  }) {
    return (
      <div className={`flex space-x-3 p-2 rounded-md ${unread ? "bg-slate-800/50 border border-slate-700/50" : ""}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar} alt={sender} />
          <AvatarFallback className="bg-slate-700 text-[#ff5757]">{sender.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-200">{sender}</div>
            <div className="text-xs text-slate-500">{time}</div>
          </div>
          <div className="text-xs text-slate-400 mt-1">{message}</div>
        </div>
        {unread && (
          <div className="flex-shrink-0 self-center">
            <div className="h-2 w-2 rounded-full bg-[#ff5757]"></div>
          </div>
        )}
      </div>
    )
  }