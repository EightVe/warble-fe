import { Link } from "react-router-dom"
import { ChevronRight, Users, Shield, Zap, Globe, MessageSquare } from "lucide-react"
import DefaultNavigation from "@/StaticComponents/NavigationBar/DefaultNavigation.js"
import DefaultFooter from "@/StaticComponents/FooterSection/DefaultFooter.js"
import React, { useContext, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import {ArrowUpRight, Loader2, Mic, VideoIcon } from "lucide-react"
import IMG1 from "@/assets/img/peer/couple1.jpg";
import IMG2 from "@/assets/img/peer/girl1.jpg";
import IMG3 from "@/assets/img/peer/guy1.jpg";
import { ArrowLeft } from 'lucide-react'
import AuthBG from "@/assets/img/mainLogo.png";
import io from 'socket.io-client';
import { useSocket } from '@/contexts/SocketContext.js'
import { AuthContext } from '@/contexts/AuthContext.js'
import VideoChatPeering from './Peering/VideoChatPeering'
import NotLoggedFlagged from '@/lib/NotLoggedFlagged.js'
import CustomLink from "@/hooks/useLink"


const socket = io("http://localhost:3000");

interface User {
  _id: any;
  firstName: any;
  avatar: any;
  socketId?: string;
}


export default function PeerPage() {
  const {user} =useContext(AuthContext) || {};
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  
  const roomId = 'video-room';

  const currentUser: User = {
    _id: user?._id,
    firstName: user?.firstName,
    avatar: user?.avatar,
  };

  useEffect(() => {
    // Join room on mount
    socket.emit('JoinPeeringVideo', { roomId, user: currentUser });

    // Listen for room updates
    socket.on('RoomUpdate', (data: { users: User[]; count: number }) => {
      setUsers(data.users);
      setCount(data.count);
    });

    // Leave room on unmount
    return () => {
      socket.emit('LeavePeeringVideo', { roomId, userId: currentUser._id });
    };
  }, []);
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <DefaultNavigation />

      <section className="relative md:h-screen flex items-center justify-center overflow-hidden bg-[#835959] pt-22">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/80"></div>
        <div className="container px-4 md:px-6 relative z-10 py-10 md:py-0">
        <div className="grid gap-12 md:grid-cols-2 ">
          {/* Left Column */}
          <div className="space-y-8 z-50">
            <h1 className="text-5xl md:text-6xl text-gray-100 leading-tight">Talk to the World, Instantly with Warble.</h1>
            <p className="text-sm text-gray-300">
  Random video and text chat that brings people together. Meet new faces, start conversations, and enjoy spontaneous connections.  
  Connect through feeds, send friend requests, chat in DMs, and explore new conversations effortlessly.
</p>

            <div className="flex gap-2 flex-col w-fit">
              
            {!user ? (
  <NotLoggedFlagged 
    triggerElement={  
      <button className="flex items-center gap-2 rounded-full cursor-pointer transition-colors bg-[#ff5757d7] px-6 py-3 text-white hover:bg-[#ff5757af]">
        Start Matching
        <ArrowUpRight className="h-5 w-5" /> 
      </button>
    }
  />
) : (
  <CustomLink href="/wrb/ft/video-match" >
    <button 
    className="flex items-center gap-2 rounded-full cursor-pointer transition-colors bg-[#ff5757d7] px-6 py-3 text-white hover:bg-[#ff5757af]"
  >
    Start Matching
      <ArrowUpRight className="h-5 w-5" />
  </button>
  </CustomLink>

)}

              <div className="flex items-center gap-1.5">
<div className="bg-green-500 relative h-2 w-2 rounded-full">
              <div className="bg-green-400 absolute h-2 w-2 rounded-full animate-ping"></div>
             </div>
             <p className="text-xs text-gray-300">{count} users are matching. </p>
</div>
            </div>
            <div>
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
              <VideoIcon className="h-6 w-6 text-[#ff5757]" />
            </motion.div>
          </div>
        </div>

        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff5757]/50 to-transparent"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">
              Advanced <span className="text-[#ff5757]">Features</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
              Our platform offers cutting-edge technology to make your random chat experience seamless and exciting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8 text-[#ff5757] stroke-1" />,
                title: "Smart Matching",
                description:
                  "Our AI-powered algorithm connects you with people who share your interests and preferences.",
              },
              {
                icon: <Shield className="h-8 w-8 text-[#ff5757] stroke-1" />,
                title: "Enhanced Privacy",
                description: "Advanced encryption and privacy controls keep your conversations secure and anonymous.",
              },
              {
                icon: <Zap className="h-8 w-8 text-[#ff5757] stroke-1" />,
                title: "Ultra-Fast Connection",
                description: "Experience lightning-fast connections with minimal latency for smooth video chats.",
              },
              {
                icon: <Globe className="h-8 w-8 text-[#ff5757] stroke-1" />,
                title: "Global Reach",
                description: "Connect with people from over 190 countries around the world in real-time.",
              },

              {
                icon: <Shield className="h-8 w-8 text-[#ff5757] stroke-1" />,
                title: "Content Moderation",
                description: "AI-powered moderation ensures a safe and respectful environment for all users.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="relative group p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-[#ff5757]/50 hover:bg-zinc-900/80"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ff5757]/0 to-[#ff5757]/0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="mb-2">{feature.icon}</div>
                <h3 className="text-base mb-1">{feature.title}</h3>
                <p className="text-zinc-400 text-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">
              How It <span className="text-[#ff5757]">Works</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
              Get started in just a few simple steps and begin connecting with people worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Sign up and customize your profile with your interests and preferences.",
              },
              {
                step: "02",
                title: "Set Your Preferences",
                description: "Choose your matching preferences including language, region, and topics.",
              },
              {
                step: "03",
                title: "Start Chatting",
                description: "Click the 'Start' button and get instantly connected with someone new.",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-4 -top-4 text-6xl font-bold text-[#ff5757]/10">{step.step}</div>
                <div className="p-6 rounded-xl border border-zinc-800 bg-black/50 backdrop-blur-sm relative z-10">
                  <h3 className="text-base mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-xs">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-full">
                    <ChevronRight className="h-8 w-8 text-[#ff5757]/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6">
                About <span className="text-[#ff5757]">Warble</span>
              </h2>
              <p className="text-zinc-400 mb-6 text-sm">
                Founded in 2024, our platform was built with a vision to revolutionize how people connect online. We
                believe in creating meaningful connections in a safe, secure, and exciting environment.
              </p>
              <p className="text-zinc-400 mb-6 text-sm">
                Our team of engineers and designers work tirelessly to create the most advanced random video chat
                platform with cutting-edge technology and a user-centric approach.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#ff5757]"></div>
                  <span className="text-zinc-400 text-xs">{count} Online Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#ff5757]"></div>
                  <span className="text-zinc-400 text-xs">150+ Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#ff5757]"></div>
                  <span className="text-zinc-400 text-xs">99.9% Uptime</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff5757]/20 to-transparent rounded-2xl blur-3xl opacity-30"></div>
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
                <img
                  src={IMG1}
                  width={800}
                  height={600}
                  alt="About our platform"
                  className="w-full h-auto opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section id="get-started" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff5757]/5 to-transparent"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl mb-6">Ready to Connect With the World?</h2>
            <p className="text-zinc-400 mb-8 text-sm max-w-2xl mx-auto">
              Join millions of users already experiencing the future of random video chatting. Sign up now and start
              connecting with people from around the globe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/signup"
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#ff5757] px-8 text-white font-medium shadow-lg shadow-[#ff5757]/25 transition-all hover:bg-[#ff5757]/90 hover:shadow-xl hover:shadow-[#ff5757]/20 focus:outline-none focus:ring-2 focus:ring-[#ff5757] focus:ring-offset-2 focus:ring-offset-black"
              >
                Sign Up for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DefaultFooter />
    </div>
  )
}

