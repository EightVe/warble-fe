"use client"

import type React from "react"

import { useContext, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  SkipForward,
  Loader2,
  Wifi,
  Send,
  MessageSquareIcon,
  Flag,
  X,
  MessageSquare,
  ArrowUpRight,
  SearchX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthContext } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import countryToCode from "./country-flags"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import ReportVideoSession from "./report-video-session"
import AnimatedWLogo from "./AnimatedWaiting"
import DefaultNavigation from "@/StaticComponents/NavigationBar/DefaultNavigation"
import { Helmet } from "react-helmet"
import SmallVersion from "./small-version"

const getFlagImage = (countryName: string) => {
  const countryCode = countryToCode[countryName]
  if (!countryCode) return null

  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
}

// Types
interface User {
  socketId: string
  firstName: string
  _id?: string
  avatar?: string
  country?: string
  userAge?: number
  gender?: string
  deviceType?: string // Add device type for cross-platform matching
}

interface ConnectionState {
  status: "idle" | "searching" | "connecting" | "connected" | "disconnected"
  message: string
}

interface RTCStatus {
  status: "disconnected" | "connecting" | "connected" | "reconnecting" | "failed"
  message: string
}

interface FilterOptions {
  gender: string | null
  country: string | null
  ageRange: [number, number]
  // Removed device type filter to allow cross-platform matching
}

export default function VideoChat() {
  const { user, setUser } = useContext(AuthContext) || {}
  const [messages, setMessages] = useState<{ sender: string; message: string }[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTabActive, setIsTabActive] = useState(true)
  const messageSound = useRef(typeof Audio !== "undefined" ? new Audio("/sound7.mp3") : null)

  // WebRTC and Socket states
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: "idle",
    message: "Click 'Find Match' to start",
  })
  const [rtcStatus, setRtcStatus] = useState<RTCStatus>({
    status: "disconnected",
    message: "Not connected",
  })
  const [partner, setPartner] = useState<User | null>(null)

  // Media states
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isPartnerMicOn, setIsPartnerMicOn] = useState(true)
  const [isPartnerCameraOn, setIsPartnerCameraOn] = useState(true)
  const [search, setSearch] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPartnerSpeaking, setIsPartnerSpeaking] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    gender: null,
    country: user?.country || null,
    ageRange: [18, 35],
  })

  // Filter dialogs state
  const [genderDialogOpen, setGenderDialogOpen] = useState(false)
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const [ageDialogOpen, setAgeDialogOpen] = useState(false)

  // Filter countries based on search input
  const filteredCountries = Object.entries(countryToCode).filter(([country]) =>
    country.toLowerCase().includes(search.toLowerCase()),
  )

  // Refs
  const [isReportOpen, setIsReportOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const audioDataRef = useRef<Uint8Array | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Detect device type
  const [deviceType, setDeviceType] = useState<string>("unknown")

  useEffect(() => {
    // Simple device detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setDeviceType(isMobile ? "mobile" : "desktop")
  }, [])

  // ICE Servers configuration
  const ICE_SERVERS = [
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "efB8JHE3OHOUP53ZYK",
      credential: "6xZsT2NpzMiZq5ts",
    },
  ]

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("https://vd.api.warble.chat")
    setSocket(newSocket)

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
      cleanupWebRTC()
    }
  }, [])

  // Close chat when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node) && isChatOpen) {
        setIsChatOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isChatOpen])

  // Audio level detection for speaking indicator
  useEffect(() => {
    if (!localStreamRef.current) return

    const setupAudioAnalyser = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const audioSource = audioContext.createMediaStreamSource(localStreamRef.current!)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        audioSource.connect(analyser)

        audioAnalyserRef.current = analyser
        audioDataRef.current = new Uint8Array(analyser.frequencyBinCount)

        const detectSpeaking = () => {
          if (!audioAnalyserRef.current || !audioDataRef.current) return

          audioAnalyserRef.current.getByteFrequencyData(audioDataRef.current)

          // Calculate average volume level
          const average = audioDataRef.current.reduce((sum, value) => sum + value, 0) / audioDataRef.current.length

          // Set speaking state based on threshold
          setIsSpeaking(average > 20) // Adjust threshold as needed

          // Emit speaking status to partner
          if (socket && partner) {
            socket.emit("speaking-status", {
              target: partner.socketId,
              isSpeaking: average > 20,
            })
          }

          animationFrameRef.current = requestAnimationFrame(detectSpeaking)
        }

        detectSpeaking()
      } catch (error) {
        console.error("Error setting up audio analyser:", error)
      }
    }

    setupAudioAnalyser()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [localStreamRef.current, partner, socket])

  const handleAgeRangeChange = (newValues: number[]) => {
    // Ensure min value is at least 18
    const minValue = Math.max(18, newValues[0])

    // Ensure max value doesn't exceed 110
    const maxValue = Math.min(110, newValues[1])

    // Ensure min doesn't exceed max
    if (minValue <= maxValue) {
      setFilters((prev) => ({
        ...prev,
        ageRange: [minValue, maxValue],
      }))
    }
  }

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return

    // Update socket ID when connected
    socket.on("connect", () => {
      setUser((prev) => ({ ...prev, socketId: socket.id }))
    })

    // Handle match found
    socket.on("matchFound", ({ partnerId, partnerUser }) => {
      setConnectionState({
        status: "connecting",
        message: "Establishing connection...",
      })
      setPartner({
        socketId: partnerId,
        firstName: partnerUser.firstName,
        avatar: partnerUser.avatar,
        country: partnerUser.country,
        userAge: partnerUser.userAge,
        gender: partnerUser.gender,
        _id: partnerUser._id,
        deviceType: partnerUser.deviceType,
      })
      setMessages([])
      // Create WebRTC connection
      createPeerConnection(partnerId)
    })

    socket.on("chatMessage", (data) => {
      setMessages((prev) => [...prev, data])

      if (!isTabActive && messageSound.current) {
        messageSound.current.play()
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Message", { body: data.message })
        }
      }
    })

    // Handle speaking status updates
    socket.on("speaking-status", ({ sender, isSpeaking }) => {
      setIsPartnerSpeaking(isSpeaking)
    })

    // Handle WebRTC signaling
    socket.on("offer", async ({ sender, offer }) => {
      if (!peerConnectionRef.current) {
        createPeerConnection(sender)
      }

      try {
        setRtcStatus({
          status: "connecting",
          message: "Receiving offer...",
        })

        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer))

        setRtcStatus({
          status: "connecting",
          message: "Creating answer...",
        })

        const answer = await peerConnectionRef.current?.createAnswer()
        await peerConnectionRef.current?.setLocalDescription(answer)

        setRtcStatus({
          status: "connecting",
          message: "Sending answer...",
        })

        socket.emit("answer", {
          target: sender,
          answer: answer,
        })
      } catch (error) {
        console.error("Error handling offer:", error)
        setRtcStatus({
          status: "failed",
          message: "Failed to process offer",
        })
        // Restart the matching process
        findMatch()
      }
    })

    socket.on("answer", async ({ sender, answer }) => {
      try {
        setRtcStatus({
          status: "connecting",
          message: "Receiving answer...",
        })

        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer))

        setRtcStatus({
          status: "connecting",
          message: "RTC Connecting...",
        })

        setConnectionState({
          status: "connected",
          message: "Connected to partner",
        })
      } catch (error) {
        console.error("Error handling answer:", error)
        setRtcStatus({
          status: "failed",
          message: "Failed to process answer",
        })
        // Restart the matching process
        findMatch()
      }
    })

    socket.on("ice-candidate", async ({ sender, candidate }) => {
      try {
        if (candidate) {
          setRtcStatus({
            status: "connecting",
            message: "Exchanging network info...",
          })

          await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error)
      }
    })

    // Handle partner disconnection
    socket.on("partnerDisconnected", () => {
      setConnectionState({
        status: "disconnected",
        message: "Partner disconnected",
      })
      setPartner(null)
      setMessages([])
      cleanupWebRTC(false)
      // Automatically start searching for a new partner
      findMatch()
    })

    // Handle media toggles
    socket.on("mic-toggle", ({ sender, isMicOpen }) => {
      setIsPartnerMicOn(isMicOpen)
    })

    socket.on("camera-toggle", ({ sender, isCameraOn }) => {
      setIsPartnerCameraOn(isCameraOn)
    })

    // New event listener for connection confirmation
    socket.on("rtc-fully-connected", () => {
      setRtcStatus({
        status: "connected",
        message: "RTC Connected",
      })
    })

    return () => {
      socket.off("connect")
      socket.off("matchFound")
      socket.off("offer")
      socket.off("answer")
      socket.off("ice-candidate")
      socket.off("partnerDisconnected")
      socket.off("mic-toggle")
      socket.off("camera-toggle")
      socket.off("rtc-fully-connected")
      socket.off("speaking-status")
    }
  }, [socket])

  // Initialize local media stream
  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      localStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      return stream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      setConnectionState({
        status: "disconnected",
        message: "Failed to access camera/microphone",
      })
      return null
    }
  }

  // Create and set up WebRTC peer connection
  const createPeerConnection = async (partnerId: string) => {
    try {
      // Initialize local stream if not already done
      if (!localStreamRef.current) {
        const stream = await initLocalStream()
        if (!stream) return
      }

      // Create new RTCPeerConnection
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      peerConnectionRef.current = pc

      setRtcStatus({
        status: "connecting",
        message: "Setting up connection...",
      })

      // Add local tracks to the connection
      localStreamRef.current?.getTracks().forEach((track) => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current)
        }
      })

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice-candidate", {
            target: partnerId,
            candidate: event.candidate,
          })
        }
      }

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        switch (pc.iceConnectionState) {
          case "checking":
            setRtcStatus({
              status: "connecting",
              message: "Checking connection...",
            })
            break
          case "connected":
          case "completed":
            // Instead of setting RTC status here, emit an event to confirm connection
            socket?.emit("rtc-connected", { target: partnerId })
            break
          case "disconnected":
            setRtcStatus({
              status: "reconnecting",
              message: "RTC Reconnecting...",
            })
            break
          case "failed":
            setRtcStatus({
              status: "failed",
              message: "RTC Connection failed",
            })
            // Restart the matching process
            findMatch()
            break
          case "closed":
            setRtcStatus({
              status: "disconnected",
              message: "RTC Idle",
            })
            break
        }
      }

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case "connecting":
            setConnectionState({
              status: "connecting",
              message: "Establishing connection...",
            })
            break
          case "connected":
            setConnectionState({
              status: "connected",
              message: "Connected to partner",
            })
            break
          case "disconnected":
          case "failed":
            setConnectionState({
              status: "disconnected",
              message: "Connection failed",
            })
            // Restart the matching process
            findMatch()
            break
          case "closed":
            setConnectionState({
              status: "disconnected",
              message: "Connection closed",
            })
            break
        }
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      // Create and send offer (if we're the initiator)
      // Use a simple algorithm to prevent glare: only the peer with the "smaller" ID creates the offer
      if (socket?.id < partnerId) {
        setRtcStatus({
          status: "connecting",
          message: "Creating offer...",
        })

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        setRtcStatus({
          status: "connecting",
          message: "Sending offer...",
        })

        socket?.emit("offer", {
          target: partnerId,
          offer: offer,
        })
      }

      return pc
    } catch (error) {
      console.error("Error creating peer connection:", error)
      setConnectionState({
        status: "disconnected",
        message: "Failed to establish connection",
      })
      setRtcStatus({
        status: "failed",
        message: "RTC Setup failed",
      })
      // Restart the matching process
      findMatch()
      return null
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  const sendMessage = () => {
    if (socket && partner && newMessage.trim()) {
      socket.emit("sendChatMessage", { target: partner.socketId, message: newMessage })
      setMessages([...messages, { sender: "me", message: newMessage }])
      setNewMessage("")
    }
  }

  // Handle key press for chat
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Clean up WebRTC connection
  const cleanupWebRTC = (fullCleanup = true) => {
    // Cancel animation frame for audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Stop all tracks in the remote stream
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const stream = remoteVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      remoteVideoRef.current.srcObject = null
    }

    // If full cleanup, also stop local stream
    if (fullCleanup && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
    }

    setRtcStatus({
      status: "disconnected",
      message: "RTC Idle",
    })
  }

  // Find a match
  const findMatch = async () => {
    if (!socket) return

    // Initialize local stream if not already done
    if (!localStreamRef.current) {
      const stream = await initLocalStream()
      if (!stream) return
    }

    setConnectionState({
      status: "searching",
      message: "Looking for a match...",
    })

    socket.emit("startMatching", {
      user: {
        firstName: user.firstName,
        avatar: user.avatar,
        country: filters.country || user.country,
        userAge: user.userAge,
        gender: user.gender,
        _id: user._id,
        deviceType: deviceType, // Include device type but don't filter by it
      },
      filters: {
        gender: filters.gender,
        country: filters.country,
        ageRange: filters.ageRange,
        // No device type filter to allow cross-platform matching
      },
    })
  }

  // Skip current match and find a new one
  const skipMatch = () => {
    if (!socket || !partner) return

    socket.emit("leaveVideoRoom")
    cleanupWebRTC(false)

    setConnectionState({
      status: "searching",
      message: "Looking for a new match...",
    })
    setPartner(null)

    // Immediately start searching for a new partner
    socket.emit("startMatching", {
      user: {
        firstName: user.firstName,
        avatar: user.avatar,
        country: filters.country || user.country,
        userAge: user.userAge,
        gender: user.gender,
        _id: user._id,
        deviceType: deviceType,
      },
      filters: {
        gender: filters.gender,
        country: filters.country,
        ageRange: filters.ageRange,
      },
    })
  }

  // Disconnect from the current match
  const disconnect = () => {
    if (!socket) return

    socket.emit("leaveVideoRoom")
    cleanupWebRTC()

    setConnectionState({
      status: "idle",
      message: "Click 'Find Match' to start",
    })
    setPartner(null)
  }

  // Toggle microphone
  const toggleMic = () => {
    if (!localStreamRef.current) return

    const audioTracks = localStreamRef.current.getAudioTracks()
    if (audioTracks.length === 0) return

    const newState = !isMicOn
    audioTracks.forEach((track) => {
      track.enabled = newState
    })

    setIsMicOn(newState)

    // Notify partner
    if (socket && partner) {
      socket.emit("mic-toggle", {
        target: partner.socketId,
        isMicOpen: newState,
      })
    }
  }

  // Toggle camera
  const toggleCamera = () => {
    if (!localStreamRef.current) return

    const videoTracks = localStreamRef.current.getVideoTracks()
    if (videoTracks.length === 0) return

    const newState = !isCameraOn
    videoTracks.forEach((track) => {
      track.enabled = newState
    })

    setIsCameraOn(newState)

    // Notify partner
    if (socket && partner) {
      socket.emit("camera-toggle", {
        target: partner.socketId,
        isCameraOn: newState,
      })
    }
  }

  // Handle gender selection
  const handleGenderSelect = (gender: string | null) => {
    setFilters((prev) => ({
      ...prev,
      gender,
    }))
    setGenderDialogOpen(false)
  }

  // Handle country selection
  const handleCountrySelect = (country: string | null) => {
    setFilters((prev) => ({
      ...prev,
      country,
    }))
    setCountryDialogOpen(false)
  }

  // Get button label for gender
  const getGenderButtonLabel = () => {
    if (filters.gender) {
      return (
        <span className="flex items-center gap-2">
          {filters.gender === "Male" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-gender-male"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M9.5 2a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V2.707L9.871 6.836a5 5 0 1 1-.707-.707L13.293 2zM6 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-gender-female"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8M3 5a5 5 0 1 1 5.5 4.975V12h2a.5.5 0 0 1 0 1h-2v2.5a.5.5 0 0 1-1 0V13h-2a.5.5 0 0 1 0-1h2V9.975A5 5 0 0 1 3 5"
              />
            </svg>
          )}
          {filters.gender}
        </span>
      )
    }

    return (
      <span className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-gender-ambiguous"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M11.5 1a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-3.45 3.45A4 4 0 0 1 8.5 10.97V13H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V14H6a.5.5 0 0 1 0-1h1.5v-2.03a4 4 0 1 1 3.471-6.648L14.293 1zm-.997 4.346a3 3 0 1 0-5.006 3.309 3 3 0 0 0 5.006-3.31z"
          />
        </svg>
        Gender
      </span>
    )
  }

  // Get button label for country
  const getCountryButtonLabel = () => {
    if (filters.country) {
      return (
        <span className="flex items-center gap-2">
          {getFlagImage(filters.country) ? (
            <img
              src={getFlagImage(filters.country) || "/placeholder.svg"}
              alt="flag"
              className="w-6 h-4 rounded-sm inline-block"
            />
          ) : (
            "🌎"
          )}
          {filters.country.length > 10 ? `${filters.country.substring(0, 10)}...` : filters.country}
        </span>
      )
    }

    return (
      <span className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-globe-europe-africa"
          viewBox="0 0 16 16"
        >
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M3.668 2.501l-.288.646a.847.847 0 0 0 1.479.815l.245-.368a.81.81 0 0 1 1.034-.275.81.81 0 0 0 .724 0l.261-.13a1 1 0 0 1 .775-.05l.984.34q.118.04.243.054c.784.093.855.377.694.801-.155.41-.616.617-1.035.487l-.01-.003C8.274 4.663 7.748 4.5 6 4.5 4.8 4.5 3.5 5.62 3.5 7c0 1.96.826 2.166 1.696 2.382.46.115.935.233 1.304.618.449.467.393 1.181.339 1.877C6.755 12.96 6.674 14 8.5 14c1.75 0 3-3.5 3-4.5 0-.262.208-.468.444-.7.396-.392.87-.86.556-1.8-.097-.291-.396-.568-.641-.756-.174-.133-.207-.396-.052-.551a.33.33 0 0 1 .42-.042l1.085.724c.11.072.255.058.348-.035.15-.15.415-.083.489.117.16.43.445 1.05.849 1.357L15 8A7 7 0 1 1 3.668 2.501" />
        </svg>
        Country
      </span>
    )
  }

  // Get button label for age
  const getAgeButtonLabel = () => {
    const [min, max] = filters.ageRange
    if (min !== 18 || max !== 35) {
      return (
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-calendar-range"
            viewBox="0 0 16 16"
          >
            <path d="M9 7a1 1 0 0 1 1-1h5v2h-5a1 1 0 0 1-1-1M1 9h4a1 1 0 0 1 0 2H1z" />
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
          </svg>
          {min}-{max === 110 ? "+" : max}
        </span>
      )
    }

    return (
      <span className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-calendar-range"
          viewBox="0 0 16 16"
        >
          <path d="M9 7a1 1 0 0 1 1-1h5v2h-5a1 1 0 0 1-1-1M1 9h4a1 1 0 0 1 0 2H1z" />
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
        </svg>
        Age
      </span>
    )
  }

  return (
    <>
        <Helmet>
          <title>Warble - Random Video Meeting</title>
          <meta name="description" content="Connect with people worldwide through random video meetings." />
          <meta property="og:title" content="Warble - Random Video Meeting" />
          <meta property="og:description" content="Experience seamless and fun random video meetings with Warble." />
          <meta property="og:site_name" content="Warble Chat" />
          <meta property="og:url" content="https://warble.chat/video-match" />
          <meta property="og:image" content="https://warble.chat/assets/og-image.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Warble - Random Video Meeting" />
          <meta name="twitter:description" content="Join Warble for exciting random video meetings with people worldwide." />
          <meta name="twitter:image" content="https://warble.chat/assets/twitter-image.png" />
          <link rel="canonical" href="https://warble.chat/video-match" />
        </Helmet>
      <div className="min-h-screen bg-opacity-95 flex-col bg-[#110e0e] relative overflow-hidden hidden lg:flex">
        {/* Futuristic background elements */}
        <div className="glowing-div absolute top-32 right-64 opacity-35 lg:opacity-15 h-96 rotate-45 inset-0"></div>
        <div className="glowing-div absolute top-0 h-96 opacity-35 lg:opacity-15 inset-0"></div>
        <div className="glowing-div absolute bottom-0 left-36 opacity-35 lg:opacity-15 h-96 rotate-12 inset-0"></div>

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,87,87,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,87,87,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Header */}
        <DefaultNavigation />

        {/* Main content */}
        <div className="flex-1 flex flex-col p-4 z-10 pt-22">
          {/* Video grid */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Videos container */}
            <div className={`${isChatOpen ? "lg:w-2/3" : "w-full"} flex-1`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[80vh]">
                {/* Local Video */}
                <div className="relative rounded-2xl overflow-hidden w-full h-full border-2 border-[#ff5757]/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  {/* Neon border effect */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[0_0_15px_rgba(255,87,87,0.3),inset_0_0_10px_rgba(255,87,87,0.1)]"></div>

                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover bg-black"
                  />
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                      <VideoOff className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-9 w-9 shadow-[0_0_10px_rgba(255,87,87,0.7)]">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-[#ff5757] text-white">
                            {user?.firstName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-white text-shadow-neon text-sm">
                              {user?.firstName}, {user?.userAge}
                            </span>
                            <span className="text-white">•</span>
                            <span>
                              {user?.gender === "male" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-gender-male text-blue-400 inline"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9.5 2a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V2.707L9.871 6.836a5 5 0 1 1-.707-.707L13.293 2zM6 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-gender-female text-pink-400 inline"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8M3 5a5 5 0 1 1 5.5 4.975V12h2a.5.5 0 0 1 0 1h-2v2.5a.5.5 0 0 1-1 0V13h-2a.5.5 0 0 1 0-1h2V9.975A5 5 0 0 1 3 5"
                                  />
                                </svg>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-zinc-300">
                            <span className="flex items-center gap-1">
                              {getFlagImage(user?.country) ? (
                                <img
                                  src={getFlagImage(user?.country) || "/placeholder.svg"}
                                  alt="flag"
                                  className="w-4 h-3 inline-block"
                                />
                              ) : (
                                "🌎"
                              )}
                              <span>{user?.country}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[#ff5757]/20 border border-[#ff5757]/50 text-[#ff5757] shadow-[0_0_5px_rgba(255,87,87,0.5)]">
                          YOU
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remote Video */}
                <div className="relative rounded-2xl overflow-hidden w-full h-full border-2 border-[#ff5757]/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-black" />
                  {!isPartnerCameraOn && partner && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                      <VideoOff className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  {!partner && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                        {connectionState.status === "idle" && <AnimatedWLogo />}
                        {connectionState.status === "searching" ? (
                          <div className="absolute inset-0 justify-center bg-opacity-70 text-sm bg-black text-white border-none px-3 py-1 flex items-center gap-1 shadow-[0_0_10px_rgba(255,87,87,0.5)]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Searching for a match...
                          </div>
                        ) : (
                          connectionState.status === "idle" && (
                            <Button
                              onClick={findMatch}
                              variant="default"
                              size="sm"
                              className="font-normal text-gray-100 bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] shadow-[0_0_10px_rgba(255,87,87,0.5)] ml-2 lg:hidden"
                              disabled={
                                connectionState.status === "searching" || connectionState.status === "connecting"
                              }
                            >
                              <span className="flex items-center gap-1">
                                Start Matching <ArrowUpRight />
                              </span>
                            </Button>
                          )
                        )}
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    {partner && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-9 w-9 shadow-[0_0_10px_rgba(168,85,247,0.7)]">
                            <AvatarImage src={partner?.avatar} />
                            <AvatarFallback className="bg-purple-500 text-white">
                              {partner?.firstName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className=" text-white text-shadow-neon text-sm">
                                {partner?.firstName}, {partner?.userAge}{" "}
                              </span>
                              <span className="text-white">•</span>
                              <span>
                                {partner?.gender === "male" ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-gender-male text-blue-400 inline"
                                    viewBox="0 0 16 16"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9.5 2a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V2.707L9.871 6.836a5 5 0 1 1-.707-.707L13.293 2zM6 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-gender-female text-pink-400 inline"
                                    viewBox="0 0 16 16"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8M3 5a5 5 0 1 1 5.5 4.975V12h2a.5.5 0 0 1 0 1h-2v2.5a.5.5 0 0 1-1 0V13h-2a.5.5 0 0 1 0-1h2V9.975A5 5 0 0 1 3 5"
                                    />
                                  </svg>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-300">
                              <span className="flex items-center gap-1">
                                {getFlagImage(partner?.country) ? (
                                  <img
                                    src={getFlagImage(partner?.country) || "/placeholder.svg"}
                                    alt="flag"
                                    className="w-4 h-3 inline-block"
                                  />
                                ) : (
                                  "🌎"
                                )}
                                <span>{partner?.country}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            onClick={() => setIsReportOpen(true)}
                            className="border-gray-200/20 border shadow-[0_0_4px_rgba(255,87,87,0.5)] rounded-full p-2 bg-transparent text-white hover:bg-red-600/20 hover:text-red-500 font-normal backdrop-blur-2xl cursor-pointer"
                          >
                            <Flag className="h-4 w-4 text-white" />
                          </div>
                          {!isPartnerMicOn && (
                            <div className="ml-auto bg-[#ff5757] rounded-full p-2 shadow-[0_0_10px_rgba(255,87,87,0.5)]">
                              <MicOff className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Status indicators */}
                  <div className="flex justify-center gap-4 absolute top-0 right-0 p-2">
                    <div
                      className={`text-[#f4eeee] flex items-center gap-1 text-xs bg-black/50 px-2 py-1 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)] ${
                        rtcStatus.status === "connecting"
                          ? "text-yellow-500"
                          : rtcStatus.status === "connected"
                            ? "text-green-500"
                            : rtcStatus.status === "reconnecting"
                              ? "text-orange-500"
                              : rtcStatus.status === "failed"
                                ? "text-red-500"
                                : rtcStatus.status === "disconnected"
                                  ? "text-gray-100"
                                  : ""
                      }`}
                    >
                      <Wifi className="h-4 w-4" />
                      {rtcStatus.message}
                    </div>
                    {connectionState.status === "connected" && (
                      <div className="flex items-center gap-1 text-[#ff5757] text-xs mr-2 bg-black/50 px-2 py-1 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#ff5757] animate-pulse shadow-[0_0_5px_rgba(255,87,87,0.7)]"></span>
                        LIVE
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat panel - desktop */}
            {partner && (
              <div className="xl:w-[20%] lg:w-[25%] h-[80vh] rounded-2xl border-2 border-[#ff5757]/10 bg-black/30 backdrop-blur-sm shadow-lg lg:flex flex-col relative hidden">
                <div className="relative h-full flex flex-col">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <MessageSquareIcon className="w-4 h-4 text-[#ff5757]" />
                      <h3 className="text-white text-shadow-neon text-sm">Messages</h3>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] py-1 px-3 text-sm rounded-2xl ${
                            msg.sender === "me"
                              ? "bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] text-white rounded-tr-none shadow-[0_0_10px_rgba(255,87,87,0.3)]"
                              : "bg-zinc-800 text-white rounded-tl-none"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="bg-zinc-900 border-zinc-800 text-white border-none outline-none placeholder:text-xs text-xs rounded-2xl rounded-r-none"
                          placeholder="Send a message..."
                        />
                      </div>
                      <Button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] hover:bg-[#ff5757]/90 shadow-[0_0_10px_rgba(255,87,87,0.5)] py-1 rounded-2xl px-3 rounded-l-none"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report dialog */}
        <ReportVideoSession
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          reportedUser={partner?._id}
          reportedByWho={user?._id}
          remoteVideoRef={remoteVideoRef}
        />

        {/* Controls */}
        <div className="bg-black/50 p-3 w-full rounded-tr-2xl rounded-tl-2xl z-10 border-t border-[#ff5757]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-center pb-2 lg:pb-0 lg:justify-between gap-2">
            {connectionState.status !== "idle" && <div></div>}
            {connectionState.status === "idle" && (
              <div className="flex gap-2">
                <Dialog open={genderDialogOpen} onOpenChange={setGenderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className={`font-normal rounded-tl-xl ${filters.gender ? "bg-[#5795ff44] border-[#57abff2d] shadow-[0_0_10px_rgba(87,149,255,0.3)]" : "bg-[#252525] border-[#4f4f4f]"} px-2 py-2 text-gray-200 border cursor-pointer hover:bg-[#ff575738] hover:text-gray-100 transition-all duration-150 flex items-center gap-2`}
                    >
                      {getGenderButtonLabel()}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-100 max-h-[50vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-gray-700 font-normal text-sm">Select Gender</DialogTitle>
                      <div className="flex items-center">
                        <div className="flex flex-col items-start justify-center gap-2 w-full">
                          <div
                            className={`cursor-pointer ${filters.gender === "Male" ? "bg-[#5795ff] text-white" : "bg-[#5795ff44] border-[#57abff2d]"} transition-all duration-150 flex items-center gap-2 border p-2 rounded-lg justify-between w-full`}
                            onClick={() => handleGenderSelect("Male")}
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-gender-male"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9.5 2a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V2.707L9.871 6.836a5 5 0 1 1-.707-.707L13.293 2zM6 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
                                />
                              </svg>{" "}
                              Male
                            </span>
                          </div>
                          <div
                            className={`cursor-pointer ${filters.gender === "Female" ? "bg-[#ff5757] text-white" : "bg-[#ff575725] border-[#ff57572d]"} transition-all duration-150 flex items-center gap-2 border p-2 rounded-lg justify-between w-full`}
                            onClick={() => handleGenderSelect("Female")}
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-gender-female"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8M3 5a5 5 0 1 1 5.5 4.975V12h2a.5.5 0 0 1 0 1h-2v2.5a.5.5 0 0 1-1 0V13h-2a.5.5 0 0 1 0-1h2V9.975A5 5 0 0 1 3 5"
                                />
                              </svg>{" "}
                              Female
                            </span>
                          </div>
                          <div
                            className={`cursor-pointer ${filters.gender === null ? "bg-gray-500 text-white" : "bg-gray-200 border-gray-300"} transition-all duration-150 flex items-center gap-2 border p-2 rounded-lg justify-between w-full mt-2`}
                            onClick={() => handleGenderSelect(null)}
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-gender-ambiguous"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M11.5 1a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-3.45 3.45A4 4 0 0 1 8.5 10.97V13H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V14H6a.5.5 0 0 1 0-1h1.5v-2.03a4 4 0 1 1 3.471-6.648L14.293 1zm-.997 4.346a3 3 0 1 0-5.006 3.309 3 3 0 0 0 5.006-3.31z"
                                />
                              </svg>{" "}
                              Any
                            </span>
                          </div>
                        </div>
                      </div>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>

                <Dialog open={countryDialogOpen} onOpenChange={setCountryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className={`font-normal ${filters.country ? "bg-[#5795ff44] border-[#57abff2d] shadow-[0_0_10px_rgba(87,149,255,0.3)]" : "bg-[#252525] border-[#4f4f4f]"} px-2 py-2 text-gray-200 border cursor-pointer hover:bg-[#ff575738] hover:text-gray-100 transition-all duration-150 flex items-center gap-2`}
                    >
                      {getCountryButtonLabel()}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-100 max-h-[50vh] overflow-y-auto min-h-[50vh]">
                    <DialogHeader>
                      <DialogTitle className="text-gray-700 font-normal text-sm">Select Country</DialogTitle>
                      <div className="flex items-center">
                        <div className="flex flex-col items-start justify-center gap-2 w-full">
                          <input
                            type="text"
                            placeholder="Search for a country..."
                            className="w-full p-2 mb-2 border border-gray-300 rounded-lg outline-none text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map(([country, code]) => (
                              <div
                                key={code}
                                className={`cursor-pointer ${filters.country === country ? "bg-[#5795ff] text-white" : "hover:bg-[#ff575725] hover:border-[#ff57572d] bg-gray-200"} transition-all duration-150 flex items-center gap-2 border border-gray-300 p-2 rounded-lg justify-between w-full`}
                                onClick={() => handleCountrySelect(country)}
                              >
                                <span className="flex items-center gap-2 text-sm">
                                  <span className="text-white text-sm">
                                    {getFlagImage(country) ? (
                                      <img
                                        src={getFlagImage(country) || "/placeholder.svg"}
                                        alt={`${country} flag`}
                                        className="w-6 h-4 rounded-sm inline-block"
                                      />
                                    ) : (
                                      "🌎"
                                    )}
                                  </span>
                                  {country}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 w-full text-center py-2">No countries found.</p>
                          )}
                          <div
                            className={`cursor-pointer ${filters.country === null ? "bg-gray-500 text-white" : "bg-gray-200 border-gray-300"} transition-all duration-150 flex items-center gap-2 border p-2 rounded-lg justify-between w-full mt-2`}
                            onClick={() => handleCountrySelect(null)}
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-globe-europe-africa"
                                viewBox="0 0 16 16"
                              >
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M3.668 2.501l-.288.646a.847.847 0 0 0 1.479.815l.245-.368a.81.81 0 0 1 1.034-.275.81.81 0 0 0 .724 0l.261-.13a1 1 0 0 1 .775-.05l.984.34q.118.04.243.054c.784.093.855.377.694.801-.155.41-.616.617-1.035.487l-.01-.003C8.274 4.663 7.748 4.5 6 4.5 4.8 4.5 3.5 5.62 3.5 7c0 1.96.826 2.166 1.696 2.382.46.115.935.233 1.304.618.449.467.393 1.181.339 1.877C6.755 12.96 6.674 14 8.5 14c1.75 0 3-3.5 3-4.5 0-.262.208-.468.444-.7.396-.392.87-.86.556-1.8-.097-.291-.396-.568-.641-.756-.174-.133-.207-.396-.052-.551a.33.33 0 0 1 .42-.042l1.085.724c.11.072.255.058.348-.035.15-.15.415-.083.489.117.16.43.445 1.05.849 1.357L15 8A7 7 0 1 1 3.668 2.501" />
                              </svg>{" "}
                              Any
                            </span>
                          </div>
                        </div>
                      </div>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>

                <Dialog open={ageDialogOpen} onOpenChange={setAgeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className={`font-normal rounded-tr-xl ${filters.ageRange[0] !== 18 || filters.ageRange[1] !== 35 ? "bg-[#5795ff44] border-[#57abff2d] shadow-[0_0_10px_rgba(87,149,255,0.3)]" : "bg-[#252525] border-[#4f4f4f]"} px-2 py-2 text-gray-200 border cursor-pointer hover:bg-[#ff575738] hover:text-gray-100 transition-all duration-150 flex items-center gap-2`}
                    >
                      {getAgeButtonLabel()}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-100 max-h-[50vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-gray-700 font-normal text-sm">Select Age</DialogTitle>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <Label htmlFor="min-age" className="font-normal text-xs text-gray-500">
                            Min Age
                          </Label>
                          <div className="text-2xl text-gray-500" id="min-age">
                            {filters.ageRange[0]}
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <Label htmlFor="max-age" className="font-normal text-xs text-gray-500">
                            Max Age
                          </Label>
                          <div className="text-2xl text-gray-500" id="max-age">
                            {filters.ageRange[1]}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <RangeSlider
                          defaultValue={[18, 35]}
                          min={18}
                          max={110}
                          step={1}
                          value={filters.ageRange}
                          onValueChange={handleAgeRangeChange}
                          className="w-full bg-gray-400 rounded-full"
                        />

                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>18</span>
                          <span>110</span>
                        </div>
                      </div>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              {connectionState.status !== "idle" && <div></div>}
              {connectionState.status === "connected" && (
                <>
                  <Button
                    onClick={toggleMic}
                    variant="outline"
                    size="icon"
                    className={`rounded-full border-gray-700 ${!isMicOn ? "bg-[#ff5757]/20 text-[#ff5757] border-[#ff5757]/50 shadow-[0_0_5px_rgba(255,87,87,0.5)]" : "bg-transparent text-white"}`}
                  >
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </Button>

                  <Button
                    onClick={toggleCamera}
                    variant="outline"
                    size="icon"
                    className={`rounded-full border-gray-700 ${!isCameraOn ? "bg-[#ff5757]/20 text-[#ff5757] border-[#ff5757]/50 shadow-[0_0_5px_rgba(255,87,87,0.5)]" : "bg-transparent text-white"}`}
                  >
                    {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full border-zinc-700 ${isChatOpen ? "bg-[#ff5757]/20 border-[#ff5757]/50 text-[#ff5757] shadow-[0_0_5px_rgba(255,87,87,0.5)]" : "bg-transparent lg:hidden text-white"}`}
                    onClick={() => setIsChatOpen(!isChatOpen)}
                  >
                    <MessageSquare size={20} />
                  </Button>
                </>
              )}
              <div className="lg:flex items-center gap-2 hidden">
                {connectionState.status === "connected" ? (
                  <Button
                    onClick={skipMatch}
                    variant="default"
                    size="sm"
                    className="rounded-full font-normal text-gray-100 bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] shadow-[0_0_10px_rgba(255,87,87,0.5)]"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </Button>
                ) : (
                  <Button
                    onClick={findMatch}
                    variant="default"
                    size="sm"
                    className="font-normal text-gray-100 bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] shadow-[0_0_10px_rgba(255,87,87,0.5)] ml-2"
                    disabled={connectionState.status === "searching" || connectionState.status === "connecting"}
                  >
                    <span className="flex items-center gap-1">
                      Start Matching <ArrowUpRight />
                    </span>
                  </Button>
                )}
                {partner || connectionState.status === "searching" ? (
                  <Button
                    onClick={disconnect}
                    variant="destructive"
                    size="sm"
                    className="bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] text-gray-100 font-normal shadow-[0_0_10px_rgba(255,87,87,0.5)]"
                  >
                    {connectionState.status === "searching" ? (
                      <>
                        <span className="flex items-center gap-1">
                          <SearchX size={20} /> Cancel
                        </span>
                      </>
                    ) : (
                      "End"
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 lg:hidden">
            {connectionState.status === "connected" ? (
              <Button
                onClick={skipMatch}
                variant="default"
                size="sm"
                className=" font-normal text-gray-100 bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] shadow-[0_0_10px_rgba(255,87,87,0.5)]"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
            ) : null}
            {partner || connectionState.status === "searching" ? (
              <Button
                onClick={disconnect}
                variant="destructive"
                size="sm"
                className=" bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] text-gray-100 font-normal shadow-[0_0_10px_rgba(255,87,87,0.5)]"
              >
                {connectionState.status === "searching" ? <>Cancel</> : "End"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <SmallVersion />
      {/* Mobile Chat panel - as overlay */}
      {isChatOpen && (
        <div
          ref={chatRef}
          className="fixed inset-0 z-30 bg-black/95 backdrop-blur-md border border-[#ff5757]/30 shadow-[0_0_20px_rgba(0,0,0,0.5)] m-4 rounded-2xl transition-all duration-300 ease-in-out lg:hidden"
        >
          <div className="relative h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <MessageSquareIcon className="w-4 h-4 text-[#ff5757]" />
                <h3 className=" text-white text-shadow-neon text-sm">Messages</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                onClick={() => setIsChatOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 py-1 text-sm rounded-2xl ${
                      msg.sender === "me"
                        ? "bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] text-white rounded-tr-none shadow-[0_0_10px_rgba(255,87,87,0.3)]"
                        : "bg-zinc-800 text-white rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-zinc-900 border-zinc-800 text-white border-none outline-none placeholder:text-xs text-xs rounded-2xl rounded-r-none"
                    placeholder="Send a message..."
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-[#ff5757] to-[#ff8a8a] hover:bg-[#ff5757]/90 shadow-[0_0_10px_rgba(255,87,87,0.5)] py-1 rounded-2xl px-3 rounded-l-none"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface RangeSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  className?: string
}

function RangeSlider({ className, ...props }: RangeSliderProps) {
  return (
    <SliderPrimitive.Root
      className={`relative flex w-full touch-none select-none items-center ${className}`}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-gray-600 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-gray-600 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
}

