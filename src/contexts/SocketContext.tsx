import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import axiosInstance from "@/lib/axiosInstance";

// ✅ Notification interface
interface Notification {
  _id: string;
  userId: string;
  senderId: string;
  type: "CommentLike" | "CommentReply" | "CommentPost" | "PostLike" | "System" | "ReplyToReply" | "MentionReply" ;
  title: string;
  description: string;
  userAvatar: string;
  read: boolean;
  createdAt: string;
}

// ✅ Online user tracking interface
interface OnlineUser {
  userId: string;
  socketId: string;
  status: "online" | "away" | "offline";
  device: "desktop" | "mobile"; // ✅ Track device type
}

// ✅ Socket context type
interface SocketContextType {
  socket: Socket | null;
  isAway: boolean;
  onlineUsers: OnlineUser[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  realTimeComments?: Record<string, any[]>; // ✅ Add this
  realTimeReplies?: Record<string, any[]>; // ✅ Add this
}

// ✅ Import notification sounds
import sound1 from './notification.mp3'
import sound2 from './sound1.mp3'
import sound3 from './sound2.mp3'
import sound4 from './sound3.mp3'
import sound5 from './sound4.mp3'
import sound6 from './sound5.mp3'
import sound7 from './sound6.mp3'
import sound8 from './sound7.mp3'
import sound9 from './sound8.mp3'
import sound10 from './sound9.mp3'
// ✅ Create socket context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useContext(AuthContext) || {};
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isAway, setIsAway] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fetchedFromAPI, setFetchedFromAPI] = useState<boolean>(false); // ✅ Prevent duplicate fetching
  const [realTimeComments, setRealTimeComments] = useState<Record<string, any[]>>({});
  const [realTimeReplies, setRealTimeReplies] = useState<Record<string, any[]>>({});
  
  // ✅ Store all sounds in an array
  const notificationSounds = [sound1, sound2, sound3,sound4,sound5,sound6,sound7,sound8,sound9,sound10];

  // ✅ Function to play a random notification sound
  const playRandomSound = () => {
    const randomSound = notificationSounds[Math.floor(Math.random() * notificationSounds.length)];
    const notificationSound = new Audio(randomSound);
    notificationSound
      .play()
      .catch((error) => console.error("🔇 Error playing sound:", error));
  };

  useEffect(() => {
    if (!user || !user._id) return;

    // ✅ Detect device type (mobile/desktop)
    const deviceType = window.innerWidth <= 768 ? "mobile" : "desktop";

    const newSocket: Socket = io("http://localhost:3000", {
      query: { userId: user._id, device: deviceType }, // ✅ Send device info
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
      forceNew: true,
    });

    setSocket(newSocket);

    // ✅ Debugging logs
    newSocket.on("connect", () => console.log("✅ WebSocket Connected:", newSocket.id));
    newSocket.on("connect_error", (error) => console.error("❌ WebSocket Connection Error:", error));
    newSocket.on("disconnect", (reason) => console.warn("❌ WebSocket Disconnected:", reason));

    // ✅ Update online users list
    newSocket.on("onlineUsers", (users: OnlineUser[]) => {
      console.log("🟢 Online Users Updated:", users);
      setOnlineUsers(users);
    });

    newSocket.on("newComment", (data) => {
      console.log("📩 [WebSocket] New Comment Received:", data);
      setRealTimeComments((prev) => ({
        ...prev,
        [data.postId]: [...(prev[data.postId] || []), data.comment],
      }));
    });
    
    newSocket.on("newReply", (data) => {
      console.log("📩 [WebSocket] New Reply Received:", data);
      setRealTimeReplies((prev) => ({
        ...prev,
        [data.commentId]: [...(prev[data.commentId] || []), data.reply],
      }));
    });
    
    // ✅ Fetch notifications from API only once
    const fetchNotifications = async () => {
      if (!fetchedFromAPI) {
        try {
          const { data } = await axiosInstance.get<Notification[]>(`/notifications/${user._id}`);
          setNotifications(data);
          setFetchedFromAPI(true);
        } catch (error) {
          console.error("❌ Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();

    // ✅ Handle real-time notifications
    newSocket.on("newNotification", (newNotification: Notification | Notification[]) => {
      console.log("🔔 New real-time notification received:", newNotification);

      playRandomSound(); // ✅ Play notification sound

      setNotifications((prev) => {
        // ✅ Prevent duplicate notifications
        if (Array.isArray(newNotification)) {
          return [...newNotification.filter(n => !prev.some(p => p._id === n._id)), ...prev];
        } else {
          return prev.some(n => n._id === newNotification._id) ? prev : [newNotification, ...prev];
        }
      });
    });

    // ✅ Detect when the user switches tabs (away/back)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        newSocket.emit("away");
        setIsAway(true);
      } else {
        newSocket.emit("back");
        setIsAway(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      newSocket.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, fetchedFromAPI]);

  return (
    <SocketContext.Provider value={{ socket, isAway, onlineUsers, notifications, setNotifications, realTimeComments ,realTimeReplies }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
