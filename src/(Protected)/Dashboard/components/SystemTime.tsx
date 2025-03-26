import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
export default function SystemTime() {
      const [currentTime, setCurrentTime] = useState(new Date())
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      }
    
      // Format date
      const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
        useEffect(() => {
          const interval = setInterval(() => {
            setCurrentTime(new Date())
          }, 1000)
      
          return () => clearInterval(interval)
        }, [])
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
    <CardContent className="p-0">
    <div className="bg-gradient-to-br from-[#ff5757]/5 via-transparent to-transparent opacity-100 p-6">
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-1 font-mono">SYSTEM TIME</div>
          <div className="text-3xl font-mono text-[#ff5757] mb-1">{formatTime(currentTime)}</div>
          <div className="text-sm text-slate-400">{formatDate(currentTime)}</div>
        </div>
      </div>
    </CardContent>
  </Card>
  )
}
