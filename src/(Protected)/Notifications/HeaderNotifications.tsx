"use client";

import { useContext, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import axiosInstance from "@/lib/axiosInstance";
import CustomLink from "@/hooks/useLink";
import { useNavigate } from "react-router-dom";
// ✅ Notification interface
interface Notification {
  _id: string;
  userId: string;
  senderId: string;
  type: "CommentLike" | "CommentReply" | "CommentPost" | "PostLike" | "System" | "ReplyToReply" | "MentionReply";
  title: string;
  description: string;
  userAvatar: string;
  read: boolean;
  createdAt: string;
  postUID?: string;
  commentId?: string;
  replyId?:string;
}


export function HeaderNotifications() {
  const { user } = useContext(AuthContext) || {};
  const { notifications, setNotifications } = useSocket();
  const userId = user?._id;
  const navigate = useNavigate(); // Use navigation hook
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id); // ✅ Mark as read before navigating
  
    if (notification.type === "CommentLike") {
      navigate(`/post/dtls/${notification.postUID}?comment=${notification.commentId}`); // ✅ Navigate to post with comment ID
    } else if (notification.type === "PostLike") {
      navigate(`/post/dtls/${notification.postUID}`); // ✅ Navigate to post without comment query
    } else if (notification.type === "CommentPost") {
      navigate(`/post/dtls/${notification.postUID}?comment=${notification.commentId}`); // ✅ Navigate to post with comment ID
    }
    else if (notification.type === "CommentReply") {
      navigate(`/post/dtls/${notification.postUID}?comment=${notification.commentId}&reply=${notification.replyId}`);
    }
    else if (notification.type === "ReplyToReply" || notification.type ==="MentionReply") {
      navigate(`/post/dtls/${notification.postUID}?comment=${notification.commentId}&reply=${notification.replyId}`);
    }
  };
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await axiosInstance.get<Notification[]>(`/notifications/${userId}`);
        setNotifications(data);
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [userId, setNotifications]);

  // ✅ Filter unread notifications
  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  // ✅ Mark a single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/markAsRead`);
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  // ✅ Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axiosInstance.put(`/notifications/${userId}/markAllAsRead`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("❌ Error marking notifications as read:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="outline-0 focus:outline-0 visited:outline-0">
        <Button variant="ghost" size="icon" className="relative outline-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center bg-[#ff5757] text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="md:w-[380px] w-[320px] bg-[#fff] border-gray-100">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <h2 className="text-sm text-gray-600">Notifications</h2>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} className="text-[#ff5757eb] font-normal flex items-center gap-1 px-0 text-[13px]" size="sm">
              <Check /> Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {unreadCount === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">No unread notifications.</p>
          ) : (
            unreadNotifications.map((n) => (
              <DropdownMenuItem
                key={n._id}
                className={cn("flex items-start gap-1.5 p-4 cursor-pointer", "bg-muted/50")}
                onClick={() => handleNotificationClick(n)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={n.userAvatar} />
                  <AvatarFallback className="bg-gray-200/60"></AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-none">{n.title}</p>
                  <p className="text-[13px] text-gray-500">{n?.description}</p>
                  <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="h-1.5 w-1.5 bg-[#ff5757] rounded-full mt-2" />
              </DropdownMenuItem>
            ))
          )}
        </div>
        {unreadCount > 0 &&     <div className="p-4 py-2 border-t border-gray-200 flex items-center justify-center">
          <CustomLink href="/notifications">
            <Button className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-tr from-[#ff2941] to-[#ff078e] h-8 font-normal text-white text-[13px]" size="sm">
              View All Notifications
            </Button>
          </CustomLink>
        </div> }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
