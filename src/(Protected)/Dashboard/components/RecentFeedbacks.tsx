import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Sticker } from 'lucide-react'
import React from 'react'

export default function RecentFeedbacks() {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-slate-100 text-sm font-normal">Recent Feedbacks</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sticker className="text-[#ff5757] mr-2 h-3.5 w-3.5" />
            <Label className="text-xs text-slate-400 font-normal">Really good application...</Label>
          </div>
          <span className="text-xs text-red-400">2 mins ago</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sticker className="text-[#ff5757] mr-2 h-3.5 w-3.5" />
            <Label className="text-xs text-slate-400 font-normal">Really good application...</Label>
          </div>
          <span className="text-xs text-red-400">16 mins ago</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sticker className="text-[#ff5757] mr-2 h-3.5 w-3.5" />
            <Label className="text-xs text-slate-400 font-normal">Really good application...</Label>
          </div>
          <span className="text-xs text-red-400">2 h ago</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sticker className="text-[#ff5757] mr-2 h-3.5 w-3.5" />
            <Label className="text-xs text-slate-400 font-normal">Really good application...</Label>
          </div>
          <span className="text-xs text-red-400">2 days ago</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sticker className="text-[#ff5757] mr-2 h-3.5 w-3.5" />
            <Label className="text-xs text-slate-400 font-normal">Really good application...</Label>
          </div>
          <span className="text-xs text-red-400">4 days ago</span>
        </div>

      </div>
    </CardContent>
  </Card>
  )
}
