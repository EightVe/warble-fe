"use client"

import { useState } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, Mic, Phone, Video, Volume2 } from "lucide-react"

export default function SmallVersion() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)

  return (
    <div className="flex flex-col h-screen bg-black text-white lg:hidden">
      <div className="flex items-center p-4 gap-4">
        <button className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-medium">Jessica, Age,Gender</h1>
          <p className="text-xs text-gray-400">CountryLogo, CountryName</p>
        </div>
        <div className="flex gap-4">
          <button className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button className="text-white">
            Report
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        {/* Remote video (small) */}
        <div className="absolute top-4 right-4 z-10 rounded-lg overflow-hidden shadow-lg">
          <img
            src="/placeholder.svg?height=120&width=90"
            alt="Remote video"
            width={90}
            height={120}
            className="object-cover"
          />
        </div>

        {/* Local video (main) */}
        <div className="flex items-center justify-center h-full">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-800 shadow-lg">
            <img
              src="/placeholder.svg?height=160&width=160"
              alt="Local video"
              width={160}
              height={160}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="p-4 flex justify-center items-center bg-gray-900 rounded-t-3xl gap-2">
        <button
          className={`p-4 rounded-full ${isVideoOn ? "bg-gray-700" : "bg-gray-800"}`}
          onClick={() => setIsVideoOn(!isVideoOn)}
        >
          <Video className="h-6 w-6" />
        </button>
        <button
          className={`p-4 rounded-full ${isMuted ? "bg-gray-800" : "bg-gray-700"}`}
          onClick={() => setIsMuted(!isMuted)}
        >
          <Mic className="h-6 w-6" />
        </button>
        <button className="p-4 rounded-full bg-red-500">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

