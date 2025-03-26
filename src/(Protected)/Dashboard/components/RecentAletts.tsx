import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Check, RefreshCw } from 'lucide-react'
import React from 'react'

export default function RecentAletts() {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-slate-100 flex items-center text-sm font-normal">
        <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
        Recent Alerts
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 pt-2">
        <AlertItem
          title="High Report Volume"
          time="14:32:12"
          description="Unusual number of reports in US East region"
          type="warning"
        />
        <AlertItem
          title="User Banned"
          time="13:45:06"
          description="User ID 45892 banned for policy violation"
          type="error"
        />
        <AlertItem
          title="System Update Scheduled"
          time="09:12:45"
          description="Maintenance window at 02:00 UTC"
          type="update"
        />
        <AlertItem
          title="New Moderator Added"
          time="04:30:00"
          description="Sarah Miller added to moderation team"
          type="success"
        />
      </div>
    </CardContent>
  </Card>
  )
}
// Alert item component
function AlertItem({
    title,
    time,
    description,
    type,
  }: {
    title: string
    time: string
    description: string
    type: "info" | "warning" | "error" | "success" | "update"
  }) {
    const getTypeStyles = () => {
      switch (type) {
        case "info":
          return { icon: Info, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
        case "warning":
          return { icon: AlertCircle, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" }
        case "error":
          return { icon: AlertCircle, color: "text-red-500 bg-red-500/10 border-red-500/30" }
        case "success":
          return { icon: Check, color: "text-green-500 bg-green-500/10 border-green-500/30" }
        case "update":
          return { icon: RefreshCw, color: "text-[#ff5757] bg-[#ff5757]/10 border-[#ff5757]/30" }
        default:
          return { icon: Info, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
      }
    }
  
    const { icon: Icon, color } = getTypeStyles()
  
    return (
      <div className="flex items-start space-x-3">
        <div className={`mt-0.5 p-1 rounded-full ${color.split(" ")[1]} ${color.split(" ")[2]}`}>
          <Icon className={`h-3 w-3 ${color.split(" ")[0]}`} />
        </div>
        <div>
          <div className="flex items-center">
            <div className="text-sm font-normal text-slate-300">{title}</div>
            <div className="ml-2 text-xs text-slate-500">{time}</div>
          </div>
          <div className="text-xs text-slate-400">{description}</div>
        </div>
      </div>
    )
  }

  function Info(props) {
    return <AlertCircle {...props} />
  }
  