"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight, Mic, Video } from "lucide-react"
import { Link } from "react-router-dom"
import AuthBG from "@/assets/img/mainLogo.png";
import IMG1 from "@/assets/img/peer/couple1.jpg";
import IMG2 from "@/assets/img/peer/girl1.jpg";
import IMG3 from "@/assets/img/peer/guy1.jpg";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { Button } from "@/components/ui/button";
import VideoChat from "./VideoChat";
export default function LandingPage() {

    const [startMatching, setStartMatching] = useState(false);



  return (
    <>
    {!startMatching && 
    <div className="min-h-screen bg-white overflow-hidden md:overflow">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 md:p-6 absolute w-full top-0 z-50 backdrop-blur-md md:backdrop-blur-none">
        <img 
          src={AuthBG} 
          alt="logo" 
          className="object-cover opacity-65 bg-[#ffffffad] rounded-full" height={50} width={50}
        />
      <div className="flex gap-4">
              <button className="flex items-center gap-2 rounded-full cursor-pointer transition-colors text-sm bg-black px-3 py-2 text-gray-100">
                Go Back
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
      </nav>

      {/* Hero Section */}
      <div className="relative mx-auto max-w-7xl px-10 py-20 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 ">
          {/* Left Column */}
          <div className="space-y-8 z-50">
            <h1 className="text-5xl md:text-6xl font-medium text-gray-900 leading-tight">Talk to the World, Instantly with Warble.</h1>
            <p className="text-base text-gray-500">
            Random video and text chat that brings people together. Meet new faces, start conversations, and enjoy spontaneous connections.
            </p>
            <div className="flex gap-4">
              <button onClick={()=>setStartMatching(true)} className="flex items-center gap-2 rounded-full cursor-pointer transition-colors bg-[#ff5757d7] px-6 py-3 text-white hover:bg-[#ff5757af]">
                Start Matching
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
            <div>
            <div className="flex gap-4 pt-1">
              <span className="rounded-full bg-gray-100 px-4 py-2 text-gray-700">Gender</span>
              <span className="rounded-full bg-gray-100 px-4 py-2 text-gray-700">Country</span>
              <span className="rounded-full bg-gray-100 px-4 py-2 text-gray-700">Age</span>
            </div>
            </div>
            <div className="mt-4 flex text-xs items-center gap-2 text-gray-500">
          <span>We use cookies to ensure the best experience for everyone, you may report anyone in the chatting room and also following them!</span>
        </div>
          </div>

          <motion.div
              className="absolute right-0 top-0 h-full w-full md:hidden"
            >
              <img
                src={IMG2}
                alt="Chat interface"
                width={1912}
                height={1080}
                className="rounded-2xl shadow-lg opacity-30 min-h-screen object-cover"
              />
            </motion.div>
          <div className="md:relative md:h-[600px] hidden md:block">
            {/* Top Chat Window */}
            <motion.div
              className="absolute right-0 top-0 w-72 "
              animate={{
                y: [0, -20, 0],
                rotate: [-1, 1, -1],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <img
                src={IMG3}
                alt="Chat interface"
                width={300}
                height={400}
                className="rounded-2xl shadow-lg opacity-10 md:opacity-100"
              />
            </motion.div>

            {/* Middle Chat Window */}
            <motion.div
              className="absolute right-20 top-40 w-72"
              animate={{
                y: [0, 20, 0],
                rotate: [1, -1, 1],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <img
                src={IMG1}
                alt="Chat interface"
                width={300}
                height={400}
                className="rounded-2xl shadow-lg opacity-10 md:opacity-100"
              />
            </motion.div>

            {/* Bottom Chat Window */}
            <motion.div
              className="absolute right-0 top-80 w-72"
              animate={{
                y: [0, -15, 0],
                rotate: [-1, 1, -1],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <img
                src={IMG2}
                alt="Chat interface"
                width={300}
                height={400}
                className="rounded-2xl shadow-lg opacity-10 md:opacity-100"
              />
            </motion.div>

            {/* Floating Action Buttons */}
            <motion.div
              className="absolute left-20 top-40 rounded-full bg-red-100 p-4 hidden md:flex"
              animate={{
                y: [0, -15, 0],
                x: [0, 10, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Mic className="h-6 w-6 text-[#ff5757]" />
            </motion.div>
            <motion.div
              className="absolute left-25 top-60 rounded-full bg-red-100 p-4 hidden md:flex"
              animate={{
                y: [0, -4, 0],
                x: [0, 15, 0],
                rotate: [0, 7, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Video className="h-6 w-6 text-[#ff5757]" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>}
    {startMatching && 
        <VideoChat />
      }
      </>
  )
}

