import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Video, SkipForward, UserPlus, Flag, Mic, MicOff, Camera, CameraOff, X, ArrowLeft } from "lucide-react"
import AuthBG from "@/assets/img/mainLogo.png";
import CustomLink from "@/hooks/useLink";
const socket = io("http://localhost:3000");

export default function VideoChat() {
  const [chatStarted, setChatStarted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Getting started");
  const [connectionStatus, setConnectionStatus] = useState("🔴 Not connected");
  const [onlineUsers, setOnlineUsers] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const startChat = async () => {
    setChatStarted(true);
    setSearching(true);
    setPartnerId(null); // Reset partner
    setStatusMessage("🔄 Searching for a match...");
    setConnectionStatus("🟡 Looking for a partner...");
    socket.emit("startChat");

    try {
      // Stop previous streams if they exist
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        let tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track: MediaStreamTrack) => track.stop());
      }

      // Request new media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: true,
      });

      if (localVideoRef.current) {
        (localVideoRef.current as HTMLVideoElement).srcObject = stream;
      }
    } catch (err) {
      console.error("⚠️ Camera access error:", err);
    }
  };

  const skipChat = () => {
    if (searching) return; // Prevent skipping while searching

    setStatusMessage("⏭ Skipping... Searching for a new match...");
    setSearching(true);
    setPartnerId(null);
    socket.emit("skipChat");
  };

  const cancelSearch = () => {
    setChatStarted(false);
    setSearching(false);
    setPartnerId(null);
    setStatusMessage("Click 'Start Chat' to find a match.");
    setConnectionStatus("🔴 Not connected");
    socket.emit("endChat");
  };

  useEffect(() => {
    socket.on("matchFound", (id: string) => {
      setPartnerId(id);
      setSearching(false);
      setStatusMessage(`✅ Matched with ${id}! Connecting...`);
      setConnectionStatus("🟢 Connected!");
    });

    socket.on("onlineUsers", (count: number) => {
      if (typeof count === "number") {
        setOnlineUsers(count);
      }
    });

    socket.on("partnerDisconnected", () => {
      setStatusMessage("❌ Partner left! Searching for a new match...");
      setSearching(true);
      setPartnerId(null);
      socket.emit("startChat");
    });

    socket.on("skipSuccess", () => {
      setStatusMessage("🔄 Searching for a new match...");
      setSearching(true);
      setPartnerId(null);
    });

    return () => {
      socket.off("matchFound");
      socket.off("partnerDisconnected");
      socket.off("onlineUsers");
      socket.off("skipSuccess");
    };
  }, []);

  return (
    <>
  
    {/* <div className="flex flex-col items-center bg-gray-100 min-h-screen justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">🎥 Video Chat ({onlineUsers} Online)</h1>
      <p className="text-lg text-gray-700">{statusMessage}</p>
      <p className="text-sm text-gray-500">{connectionStatus}</p>
      <div className="flex space-x-4 mb-6 mt-4 items-center justify-center flex-col lg:flex-row">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-[50%] h-[60vh] bg-black rounded-xl" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-[50%] h-[60vh] bg-black rounded-xl" />
      </div>
      {!chatStarted ? (
        <Button onClick={startChat} className="bg-green-500">🎬 Start Chat</Button>
      ) : searching ? (
        <Button onClick={cancelSearch} className="bg-yellow-500">⛔ Cancel</Button>
      ) : (
        <div className="flex space-x-4">
          <Button onClick={skipChat} className="bg-yellow-500">⏭ Skip</Button>
          <Button onClick={cancelSearch} className="bg-red-500">❌ Cancel</Button>
        </div>
      )}
    </div> */}
    <div className="flex flex-col h-screen bg-[#202020] text-white">
      {/* Header */}
      <header className="bg-[#202020] p-4 flex justify-between items-center">
        <h1 className="text-xl font-normal flex items-center text-[#fe9696]">        <img 
          src={AuthBG} 
          alt="logo" 
          className="object-cover opacity-100" height={50} width={50}
        />
        Warble</h1>
        <div className="flex items-center gap-2">
        <p className="text-xs flex items-center gap-2">
          <div className="relative h-3 w-3 bg-green-500 rounded-full">
          <div className="absolute h-3 w-3 bg-green-200 animate-ping rounded-full"></div>
          </div>
           {onlineUsers} are online now!</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col relative">
        {/* Video containers */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2 p-2" style={{ height: '80vh' }}>
          {/* Your video */}
          <div className="relative rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-400/50 to-blue-600/50">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-2 left-2 flex items-center bg-[#fe96964a] bg-opacity-50 rounded-full p-2 px-4 backdrop-blur-sm gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage alt="You" />
                <AvatarFallback className="bg-[#fe9696]"></AvatarFallback>
              </Avatar>
              <span className="text-sm">You</span>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center bg-[#fe96964a] rounded-full px-2 py-1 backdrop-blur-sm gap-2">
            <p className="text-xs">{connectionStatus}</p>
            </div>
          </div>

          {/* Partner's video */}
          <div className="relative rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-purple-400/50 to-purple-600/50">
            <video ref={remoteVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </div>
            <p className="text-base text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fe96964a] backdrop-blur-sm px-2 py-1 rounded-full">
  {statusMessage}
</p>
<div className="absolute top-2 left-2 flex items-center bg-[#fe96964a] bg-opacity-50 rounded-full p-2 px-4 backdrop-blur-sm gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage alt="Partner" />
                <AvatarFallback className="bg-[#fe9696]"></AvatarFallback>
              </Avatar>
              <span className="text-sm">Vexo</span>
            </div>
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
              <div className="flex items-center gap-1">
              <Button className="bg-[#fe96964a] backdrop-blur-sm transition-colors font-normal text-white rounded-full text-sm flex items-center">
                <UserPlus className="h-4 w-4" /> Follow
              </Button>
              <Button className="bg-[#fe96964a] backdrop-blur-sm transition-colors font-normal text-white rounded-full text-sm flex items-center">
                <Flag className="h-4 w-4" /> Report
              </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="bg-[#2f2e2e] p-4 flex justify-between items-center space-x-4">
        <a href="/wr/video-chat">
        <Button className="bg-[#fe96964a] text-white font-normal flex items-center" size="default"><ArrowLeft className="h-6 w-6" /> Go Back</Button>
        </a>
<div className="p-4 flex justify-center items-center space-x-4">
<button className="bg-[#ff5757] text-white rounded-full p-2 cursor-pointer">
            <Mic className="h-5 w-5" />
          </button>
          <button className="bg-[#ff5757] text-white rounded-full p-2 cursor-pointer">
            <Camera className="h-5 w-5" />
          </button>
        {!chatStarted ? (
        <Button onClick={startChat} className="bg-gradient-to-br from-[#ff078e]/70 to-[#ff2941]/70 text-white font-normal flex items-center" size="default">
        <Video className="h-6 w-6" /> Start
      </Button>
      ) : searching ? (
        <Button onClick={cancelSearch} className="bg-gradient-to-br from-[#ff078e]/70 to-[#ff2941]/70 text-white font-normal flex items-center" size="default"><X className="h-6 w-6" /> Cancel</Button>
      ) : (
        <div className="flex space-x-4">
          <Button onClick={skipChat} className="bg-gradient-to-br from-[#ff078e]/70 to-[#ff2941]/70 text-white font-normal flex items-center" size="default">
            <SkipForward className="h-6 w-6" /> Skip
          </Button>
          <Button onClick={cancelSearch} className="bg-gradient-to-br from-[#ff078e]/70 to-[#ff2941]/70 text-white font-normal flex items-center" size="default"><X className="h-6 w-6" /> Cancel</Button>
        </div>
      )}
</div>
        </div>
      </main>
    </div>
   </>
  );
}
