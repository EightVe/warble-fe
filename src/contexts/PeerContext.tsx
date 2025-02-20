import React, { useState, useEffect, useRef, createContext, ReactNode } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");
// Define interfaces for the context and props
interface Call {
  isReceivingCall?: boolean;
  from?: string;
  name?: string;
  signal?: any;
}

interface ReceivedMessage {
  text: string;
  senderName: string;
}

interface VideoCallContextProps {
  call: Call;
  isCallAccepted: boolean;
  myVideoRef: React.RefObject<HTMLVideoElement>;
  partnerVideoRef: React.RefObject<HTMLVideoElement>;
  userStream: MediaStream | null;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  isCallEnded: boolean;
  myUserId: string;
  callUser: (targetId: string) => void;
  endCall: () => void;
  receiveCall: () => void;
  sendMessage: (text: string) => void;
  receivedMessage: ReceivedMessage;
  chatMessages: Array<{ message: string; type: string; timestamp: number; sender: string }>;
  setChatMessages: React.Dispatch<React.SetStateAction<Array<{ message: string; type: string; timestamp: number; sender: string }>>>;
  setReceivedMessage: React.Dispatch<React.SetStateAction<ReceivedMessage>>;
  setPartnerUserId: React.Dispatch<React.SetStateAction<string>>;
  endIncomingCall: () => void;
  opponentName: string;
  isMyVideoActive: boolean;
  setIsMyVideoActive: React.Dispatch<React.SetStateAction<boolean>>;
  isPartnerVideoActive?: boolean;
  setIsPartnerVideoActive: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  toggleVideo: () => boolean;
  isMyMicActive: boolean;
  isPartnerMicActive?: boolean;
  toggleMicrophone: () => boolean;
  isScreenSharing: boolean;
  toggleScreenSharingMode: () => void;
  toggleFullScreen: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const VideoCallContext = createContext<VideoCallContextProps | undefined>(undefined);

const VideoCallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [call, setCall] = useState<Call>({});
  const [isCallAccepted, setIsCallAccepted] = useState<boolean>(false);
  const [isCallEnded, setIsCallEnded] = useState<boolean>(false);
  const [myUserId, setMyUserId] = useState<string>("");
  const [partnerUserId, setPartnerUserId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ message: string; type: string; timestamp: number; sender: string }>>([]);
  const [receivedMessage, setReceivedMessage] = useState<ReceivedMessage>({ text: "", senderName: "" });
  const [name, setName] = useState<string>("");
  const [opponentName, setOpponentName] = useState<string>("");
  const [isMyVideoActive, setIsMyVideoActive] = useState<boolean>(true);
  const [isPartnerVideoActive, setIsPartnerVideoActive] = useState<boolean | undefined>(undefined);
  const [isMyMicActive, setIsMyMicActive] = useState<boolean>(true);
  const [isPartnerMicActive, setIsPartnerMicActive] = useState<boolean | undefined>(undefined);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<Peer.Instance | null>(null);
  const screenShareTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    const getUserMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setUserStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    const handleSocketEvents = () => {
      socket.on("socketId", (id: string) => {
        setMyUserId(id);
      });

      socket.on("mediaStatusChanged", ({ mediaType, isActive }: { mediaType: string; isActive: boolean | boolean[] }) => {
        if (isActive !== null) {
          if (mediaType === "video") {
            setIsPartnerVideoActive(isActive as boolean);
          } else if (mediaType === "audio") {
            setIsPartnerMicActive(isActive as boolean);
          } else {
            setIsPartnerMicActive(isActive[0] as boolean);
            setIsPartnerVideoActive(isActive[1] as boolean);
          }
        }
      });

      socket.on("callTerminated", () => {
        setIsCallEnded(true);
        window.location.reload();
      });

      socket.on("incomingCall", ({ from, name, signal }: { from: string; name: string; signal: any }) => {
        setCall({ isReceivingCall: true, from, name, signal });
      });

      socket.on("receiveMessage", ({ message: text, senderName }: { message: string; senderName: string }) => {
        const receivedMsg = { text, senderName };
        setReceivedMessage(receivedMsg);

        const timeout = setTimeout(() => {
          setReceivedMessage({ text: "", senderName: "" });
        }, 1000);

        return () => clearTimeout(timeout);
      });
    };

    getUserMediaStream();
    handleSocketEvents();
  }, []);

  const receiveCall = () => {
    setIsCallAccepted(true);
    setPartnerUserId(call.from || "");
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: userStream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: call.from,
        userName: name,
        mediaType: "both",
        mediaStatus: [isMyMicActive, isMyVideoActive],
      });
    });

    peer.on("stream", (currentStream) => {
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = currentStream;
      }
    });
    peer.signal(call.signal);
    peerConnectionRef.current = peer;
  };

  const callUser = (targetId: string) => {
    console.log("Calling user with ID:", targetId);  // Add a log here
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: userStream!,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }, // Add ICE configuration if necessary
    });
  
    setPartnerUserId(targetId);
  
    const handleSignal = (data: any) => {
      socket.emit("initiateCall", {
        targetId,
        signalData: data,
        senderId: myUserId,
        senderName: name,
      });
    };
  
    const handleStream = (currentStream: MediaStream) => {
      partnerVideoRef.current!.srcObject = currentStream;
    };
  
    const joinAcceptedCall = ({ signal, userName }: { signal: any; userName: string }) => {
      setIsCallAccepted(true);
      setOpponentName(userName);
      peer.signal(signal);
      socket.emit("changeMediaStatus", {
        mediaType: "both",
        isActive: [isMyMicActive, isMyVideoActive],
      });
    };
  
    peer.on("signal", handleSignal);
    peer.on("stream", handleStream);
    socket.on("callAnswered", joinAcceptedCall);
  
    peerConnectionRef.current = peer;
  };
  

  const toggleVideo = () => {
    const newStatus = !isMyVideoActive;
    setIsMyVideoActive(newStatus);

    userStream?.getVideoTracks().forEach((track) => {
      track.enabled = newStatus;
    });

    socket.emit("changeMediaStatus", {
      mediaType: "video",
      isActive: newStatus,
    });

    return newStatus;
  };

  const toggleMicrophone = () => {
    const newStatus = !isMyMicActive;
    setIsMyMicActive(newStatus);

    userStream?.getAudioTracks().forEach((track) => {
      track.enabled = newStatus;
    });

    socket.emit("changeMediaStatus", {
      mediaType: "audio",
      isActive: newStatus,
    });

    return newStatus;
  };

  const toggleScreenSharingMode = () => {
    if (!isMyVideoActive) {
      alert("Please turn on your video to share the screen");
      return;
    }
    if (!isScreenSharing) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((screenStream) => {
          const screenTrack = screenStream.getTracks()[0];
          const videoTracks = peerConnectionRef.current?.streams[0].getTracks();
          const videoTrack = videoTracks?.find((track) => track.kind === "video");
          if (videoTrack) {
            peerConnectionRef.current?.replaceTrack(videoTrack, screenTrack, userStream);
          }
          screenTrack.onended = () => {
            if (videoTrack) {
              peerConnectionRef.current?.replaceTrack(screenTrack, videoTrack, userStream);
              myVideoRef.current!.srcObject = userStream;
              setIsScreenSharing(false);
            }
          };
          myVideoRef.current!.srcObject = screenStream;
          screenShareTrackRef.current = screenTrack;
          setIsScreenSharing(true);
        })
        .catch((error) => {
          console.log("Failed to get screen sharing stream", error);
        });
    } else {
      if (screenShareTrackRef.current) {
        screenShareTrackRef.current.stop();
        screenShareTrackRef.current.onended();
      }
    }
  };

  const toggleFullScreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    const element = e.currentTarget;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const endCall = () => {
    setIsCallEnded(true);
    socket.emit("terminateCall", { targetId: partnerUserId });
    peerConnectionRef.current?.destroy();
    window.location.reload();
  };

  const endIncomingCall = () => {
    socket.emit("terminateCall", { targetId: partnerUserId });
  };

  const sendMessage = (text: string) => {
    const newMessage = {
      message: text,
      type: "sent",
      timestamp: Date.now(),
      sender: name,
    };

    setChatMessages((prevMessages) => [...prevMessages, newMessage]);

    socket.emit("sendMessage", {
      targetId: partnerUserId,
      message: text,
      senderName: name,
    });
  };

  return (
    <VideoCallContext.Provider
      value={{
        call,
        isCallAccepted,
        myVideoRef,
        partnerVideoRef,
        userStream,
        name,
        setName,
        isCallEnded,
        myUserId,
        callUser,
        endCall,
        receiveCall,
        sendMessage,
        receivedMessage,
        chatMessages,
        setChatMessages,
        setReceivedMessage,
        setPartnerUserId,
        endIncomingCall,
        opponentName,
        isMyVideoActive,
        setIsMyVideoActive,
        isPartnerVideoActive,
        setIsPartnerVideoActive,
        toggleVideo,
        isMyMicActive,
        isPartnerMicActive,
        toggleMicrophone,
        isScreenSharing,
        toggleScreenSharingMode,
        toggleFullScreen,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export { VideoCallContext, VideoCallProvider };