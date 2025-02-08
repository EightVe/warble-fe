"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Video, MoreVertical, MonitorUp } from "lucide-react"

export default function AzarVideoChat() {
  const [isLive, setIsLive] = useState(true)
  const [timer, setTimer] = useState("1:23")

  return (
    <div className="relative h-screen w-screen bg-[#0F0B1E] overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0 bg-black" />

      {/* Pro badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className="bg-purple-600/80 text-white px-3 py-1">
          Pro
        </Badge>
      </div>

      {/* Main content */}
      <div className="relative h-full w-full p-4 flex flex-col">
        {/* Video grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
          {/* Left video */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100">
           ewqeq
            {/* User info overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-800">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-08%20211055-y5ZIs7nLdVbkLJwDMrbRhBFUiqJ92V.png"
                  alt="Maria Joseph"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <span className="text-white text-sm">Maria Joseph</span>
            </div>
          </div>

          {/* Right video */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-900">
            ewqeqw
            {/* User info overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-800">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-08%20211055-y5ZIs7nLdVbkLJwDMrbRhBFUiqJ92V.png"
                  alt="James"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <span className="text-white text-sm">James</span>
            </div>
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-4">
            {/* Live indicator and timer */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-sm font-medium">LIVE</span>
              <span className="text-white/60 text-sm">{timer}</span>
            </div>

            {/* End call button */}
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              End
            </Button>

            {/* Mic button */}
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
              <Mic className="h-5 w-5" />
            </Button>

            {/* More options */}
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
              <MoreVertical className="h-5 w-5" />
            </Button>

            {/* Camera button */}
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
              <Video className="h-5 w-5" />
            </Button>

            {/* More options */}
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Share button */}
            <Button variant="destructive" size="sm" className="rounded-full px-4 bg-red-500 hover:bg-red-600">
              <MonitorUp className="h-4 w-4 mr-2" />
              Share
            </Button>

            {/* Switch user button */}
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full px-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Switch User
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

