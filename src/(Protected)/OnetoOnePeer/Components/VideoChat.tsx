import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";

const socket = io("http://localhost:3000");

export default function VideoChat() {
  const [chatStarted, setChatStarted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Click 'Start Chat' to find a match.");
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
    <div className="flex flex-col items-center bg-gray-100 min-h-screen justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">🎥 Video Chat ({onlineUsers} Online)</h1>
      <p className="text-lg text-gray-700">{statusMessage}</p>
      <p className="text-sm text-gray-500">{connectionStatus}</p>
      <div className="flex space-x-4 mb-6 mt-4">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-72 h-56 bg-black rounded-xl" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-72 h-56 bg-black rounded-xl" />
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
    </div>
  );
}
