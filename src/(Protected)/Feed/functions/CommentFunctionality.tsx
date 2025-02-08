import { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";// Import AuthContext
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, CircleAlert, CircleCheck, CircleX, Icon, Image, Loader, Loader2, Megaphone, MessageSquare, Reply, Send, Trash2, TriangleAlertIcon, Video, ThumbsUp, Heart, Flag, X, MessageSquareWarning, Smile, Shield, RefreshCcw } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { useCircleAnimation } from "@/components/ui/useCircleAnimation";
import CustomLink from "@/hooks/useLink";
import { Card } from "@/components/ui/card";
import CommentReport from "./reports/CommentReport";
import { useSocket } from "@/contexts/SocketContext";
import EmojiPicker from 'emoji-picker-react';
import CommentReplyThreeDotsAction from "./CommentReplyThreeDotsAction";
interface CommentProps {
  postId: string;
  postOwner:any;
  commentsFetched:any;
  setCommentsFetched:any;
  setShowComments:any;
  commentCount:any;
  postUID:any;
}
export default function CommentFunctionality({postUID, postId, postOwner,commentsFetched,setCommentsFetched,setShowComments,commentCount }: CommentProps) {
  const { user } = useContext(AuthContext) || {}; // Get current logged-in user
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [badwordsDetect, setBadwordsDetect] = useState(false);
  const [successDelete, setSuccessDelete] = useState(false);
  const { triggerAnimation, AnimationComponent } = useCircleAnimation();
  const [page, setPage] = useState(1); // Track pagination
const [hasMore, setHasMore] = useState(true); // Check if more comments exist
const [isFetching, setIsFetching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const fetchingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fetchLimit, setFetchLimit] = useState(5); // First fetch is 5, next is 10
  const [likeLoading, setLikeLoading] = useState<{ [key: string]: boolean }>({});
  const [replies, setReplies] = useState<{ [key: string]: any[] }>(() => commentsFetched[postId]?.replies || {});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [loadingReplies, setLoadingReplies] = useState<{ [key: string]: boolean }>({});
  const [showMoreReplies, setShowMoreReplies] = useState<{ [key: string]: { hasMore: boolean; page: number } }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiClick = (emojiObject: any) => {
    setNewComment((prev) => prev + emojiObject.emoji); // Append emoji to input
  };
  const [pickerSize, setPickerSize] = useState({ width: 250, height: 300 });
  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 768) { // For small screens (md and below)
        setPickerSize({ width: 250, height: 300 });
      } else { // For larger screens (md+)
        setPickerSize({ width: 350, height: 400 });
      }
    };
  
    updateSize(); // Run initially
    window.addEventListener("resize", updateSize); // Listen for screen size changes
  
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
    const { socket, comments: socketComments, replies: socketReplies } = useSocket();
    const mergedComments = Array.from(
      new Map(
        [...(socketComments?.[postId] || []), ...comments].map((c) => [c._id, c])
      ).values()
    );
    
    const mergedReplies = {
      ...replies,
      ...(socketReplies || {}), // ✅ Ensure existing replies are kept
    };
  // ✅ Join and leave post room
  useEffect(() => {
    if (!socket || !user || !postId) return;
  
    console.log(`🚀 Rejoining post room on every action: ${postId}`);
    socket.emit("joinPostRoom", postId);
    fetchComments();

  // ✅ Fetch replies for each comment that exists
    return () => {
      console.log(`👤 Leaving post room: ${postId}`);
      socket.emit("leavePostRoom", postId);
    };
  }, [socket, user, postId, comments, replies]);  // 👈 Trigger rejoining on updates
    // ✅ Listen for real-time updates from WebSocket
    useEffect(() => {
      if (!socket) return;
    
      const handleNewComment = (data: { postId: string; comment: any }) => {
        if (data.postId !== postId) return;
    
        setComments((prev) => {
          // ✅ Prevent duplicates by checking if the comment ID already exists
          const existingIds = new Set(prev.map((c) => c._id));
          if (existingIds.has(data.comment._id)) return prev;
    
          return [data.comment, ...prev]; // ✅ Always add to the TOP
        });
      };
    
      const handleNewReply = (data: { postId: string; commentId: string; reply: any }) => {
        if (data.postId !== postId || !data.reply || !data.reply._id) return;
      
        setReplies((prev) => {
          const existingReplies = prev[data.commentId] || [];
      
          // ✅ Ensure existingReplies only contains valid replies with `_id`
          const validReplies = existingReplies.filter(r => r && r._id);
          const existingIds = new Set(validReplies.map((r) => r._id));
      
          // ✅ Prevent duplicates
          if (existingIds.has(data.reply._id)) return prev;
      
          return {
            ...prev,
            [data.commentId]: [...validReplies, data.reply], // ✅ Append safely
          };
        });
      };
      
      const handleCensoredReply = (data: { postId: string; commentId: string; reply: any }) => {
        if (data.postId !== postId || !data.reply || !data.reply._id) return;
    
        const censoredContent = "This reply was filtered due to inappropriate content."; // 🚀 Static message for censorship
    
        setReplies((prev) => {
          const existingReplies = prev[data.commentId] || [];
          const validReplies = existingReplies.filter(r => r && r._id);
          const existingIds = new Set(validReplies.map((r) => r._id));
    
          if (existingIds.has(data.reply._id)) return prev;
    
          return {
            ...prev,
            [data.commentId]: [...validReplies, { ...data.reply, content: !user?.isAdmin ? censoredContent : data.reply.content }],
          };
        });
      };
      const handleCommentDeleted = ({ postId: receivedPostId, commentId }: { postId: string; commentId: string }) => {
        if (receivedPostId !== postId) return;
    
        console.log(`🗑️ Deleting comment ${commentId} in post ${receivedPostId}`);
        setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      };
      const handleReplyDeleted = ({ postId: receivedPostId, commentId, replyId }: { postId: string; commentId: string; replyId: string }) => {
        if (receivedPostId !== postId) return;
    
        console.log(`🗑️ Reply deleted: ${replyId} under comment ${commentId}`);
    
        setReplies((prev) => {
          if (!prev[commentId]) return prev;
          return { ...prev, [commentId]: prev[commentId].filter((reply) => reply?._id !== replyId) };
        });
      };
      socket.on("commentDeleted", handleCommentDeleted);
      
      socket.on("replyDeleted", handleReplyDeleted);
      socket.on("newComment", handleNewComment);
      socket.on("newReply", handleNewReply);
      socket.on("CommentReplyBadWord", handleCensoredReply);
      return () => {
        socket.off("newComment", handleNewComment);
        socket.off("newReply", handleNewReply);
        socket.off("deleteComment", handleCommentDeleted);
        socket.off("replyDeleted", handleReplyDeleted);
        socket.off("CommentReplyBadWord", handleCensoredReply);
      };
    }, [socket, postId,replies,comments]);
    
  const handleReplyToReply = (commentId: string, replyUsername: string) => {
    setReplyingTo({ commentId, username: replyUsername });
    setNewComment((prev) => {
        return prev.startsWith(`@${replyUsername} `) ? prev : `@${replyUsername} `;
      });
    inputRef.current?.focus(); // Scroll input into view
  };
  const handleReplyClick = (username: string, commentId: string) => {
    setReplyingTo({ username, commentId });
  
    // 🚀 Prefill username in input
    setNewComment(`@${username} `);
  
    // 🚀 Focus input field after setting username
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };
  const fetchComments = async (isInitialLoad = false): Promise<void> => {
    if (!hasMore || fetchingRef.current) return;
    fetchingRef.current = true;
  
    if (isInitialLoad) {
      setIsLoading(true); // Full-page loading
    } else {
      setIsFetchingMore(true); // "Show More" loader
    }
  
    try {
      const response = await axiosInstance.get(`/post/get-comments/${postId}`, {
        params: { page, limit: fetchLimit, userId: user?._id  },
      });
  
      if (response.data.success) {
        setComments((prev: any[]) => {
          const existingIds = new Set(prev.map((comment: any) => comment._id));
          const newComments = response.data.comments.filter((comment: any) => !existingIds.has(comment._id));
  
          return [...prev, ...newComments]; // Append only new ones
        });
  
        // 🚀 Fetch replies for each comment automatically
        response.data.comments.forEach((comment: any) => {
          fetchReplies(comment._id);
        });
  
        setPage((prevPage: number) => prevPage + 1);
        setHasMore(response.data.hasMore);
      }
    } catch (error: any) {
      console.error(`❌ Error fetching comments for Post ID: ${postId}`, error);
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };


const hasFetchedRef = useRef(false); // Track if comments have been fetched

useEffect(() => {
    if (!hasFetchedRef.current) {
        fetchComments();
        hasFetchedRef.current = true; // Mark as fetched
    }
}, [postId]); // Only depend on postId
// 🚀 Fetch comments **only** when modal is opened
useEffect(() => {
    if (!commentsFetched[postId]) {
        fetchComments();
    }
}, [postId]);
useEffect(() => {
  const fetchLikeStatusForComments = async () => {
    try {
      // ✅ Extract only valid MongoDB ObjectId comments (skip temporary ones)
      const validComments = comments.filter((c) => /^[a-f\d]{24}$/i.test(c._id));

      // ✅ Avoid fetching if all comments already have `liked` status
      if (validComments.every((comment) => comment.liked !== undefined)) return;

      const updatedComments = await Promise.all(
        validComments.map(async (comment) => {
          if (comment.liked !== undefined) return comment; // ✅ Skip if already fetched

          const response = await axiosInstance.get(`/post/comment-like-status/${comment._id}`);
          if (response.data.success) {
            return {
              ...comment,
              liked: response.data.isLiked,
              likesCount: response.data.likesCount,
            };
          }
          return comment;
        })
      );

      // ✅ Update only the necessary comments without causing a full re-render
      setComments((prev) =>
        prev.map((comment) => {
          const updated = updatedComments.find((c) => c._id === comment._id);
          return updated || comment;
        })
      );
    } catch (error) {
      console.error("Error fetching like status for comments:", error);
    }
  };

  // ✅ Trigger fetch only if we have valid comments
  if (comments.length > 0) {
    fetchLikeStatusForComments();
  }
}, [comments.length]);
  const handleShowMore = () => {
  
    setVisibleCount((prev) => prev + fetchLimit); // Increase visible comments
    fetchComments();
  };
  const addComment = async () => {
    if (!newComment.trim() || loading) return;
    setLoading(true);
  
    try {
      let finalContent = newComment;
      if (replyingTo && !newComment.startsWith(`@${replyingTo.username} `)) {
        finalContent = `@${replyingTo.username} ${newComment}`;
      }
  
      const payload = replyingTo
        ? { content: finalContent, replyTo: replyingTo.commentId }
        : { content: finalContent };
  
      // ✅ Ensure a unique temporary ID for each reply
      const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
      const newCommentData = {
        _id: tempId, // ✅ Unique temp ID
        commenterId: user,
        content: finalContent,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: [],
        replies: [],
        isOptimistic: true,
      };
  
      if (replyingTo) {
        setReplies((prev) => ({
          ...prev,
          [replyingTo.commentId]: [...(prev[replyingTo.commentId] || []), newCommentData],
        }));
      } else {
        setComments((prev) => [newCommentData, ...prev]);
      }
  
      // ✅ Send actual request
      const response = await axiosInstance.post(`/post/add-comment/${postId}`, payload);
  
      if (response.data.success) {
        if (replyingTo) {
          setReplies((prev) => ({
            ...prev,
            [replyingTo.commentId]: prev[replyingTo.commentId].map((r) =>
              r?._id === tempId ? response.data.comment : r
            ),
          }));
        } else {
          setComments((prev) => prev.map((c) => (c._id === tempId ? response.data.comment : c)));
        }
      } else {
        // 🚨 Remove temporary reply if request fails
        if (replyingTo) {
          setReplies((prev) => ({
            ...prev,
            [replyingTo.commentId]: prev[replyingTo.commentId].filter((r) => r._id !== tempId),
          }));
        } else {
          setComments((prev) => prev.filter((c) => c._id !== tempId));
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setNewComment("");
      setReplyingTo(null);
      setLoading(false);
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents form submission if inside a form
      addComment();
    }
  };
  const deleteComment = async (commentId: string) => {
    try {
      const response = await axiosInstance.delete(`/post/delete-comment/${commentId}`);
  
      if (response.data.success) {
        setComments((prev) => prev.filter((comment) => comment._id !== commentId)); // ✅ Remove comment locally
  
        // ✅ Emit event to notify other users
        if (socket) {
          socket.emit("deleteComment", { postId, commentId });
        }
      }
    } catch (error) {
      triggerAnimation("error", "An error occurred while deleting your comment.");
      console.error("Error deleting comment:", error);
    }
  };
  const formatTimeAgo = (timestamp: string | number | Date) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  
    if (diffInSeconds < 5) return "now";
    if (diffInSeconds < 60) return `${diffInSeconds} s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 172800) return "1 day ago";
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} d`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} w`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} m`;
    
    return `${Math.floor(diffInSeconds / 31536000)} y`;
  };
  const CommentSkeleton = () => {
    return (
      <div className="flex items-start gap-3 w-full animate-pulse">
        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  };

  const toggleLike = async (commentId: string, isLiked: boolean,) => {
    if (likeLoading[commentId]) return; // Prevent multiple requests
    setLikeLoading((prev) => ({ ...prev, [commentId]: true }));
  
    try {
      if (isLiked) {
        const response = await axiosInstance.post(`/post/comment-unlike/${commentId}`);
        if (response.data.success) {
          setComments((prev) =>
            prev.map((comment) =>
              comment._id === commentId
                ? {
                    ...comment,
                    likesCount: comment.likesCount - 1,
                    likedBy: comment.likedBy.filter((id: string) => id !== user?._id),
                    liked: false,
                  }
                : comment
            )
          );
        }
      } else {
        const response = await axiosInstance.post(`/post/comment-like/${commentId}`,{postUID});
        if (response.data.success) {
          setComments((prev) =>
            prev.map((comment) =>
              comment._id === commentId
                ? {
                    ...comment,
                    likesCount: comment.likesCount + 1,
                    likedBy: [...comment.likedBy, user?._id],
                    liked: true,
                  }
                : comment
            )
          );
        }
      }
    } catch (error) {
      console.error("Error liking/unliking comment:", error);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const fetchReplies = async (commentId: string) => {
    if (loadingReplies[commentId]) return;
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

    try {
        const currentPage = showMoreReplies[commentId]?.page || 1;
        const limit = 5; // Always fetch 10 more replies



        const response = await axiosInstance.get(`/post/get-replies/${commentId}`, {
            params: { page: currentPage, limit },
        });

        if (response.data.success) {
            const newReplies = response.data.replies;
            


            // ✅ Ensure we append new replies instead of replacing existing ones
            setReplies((prev) => ({
                ...prev,
                [commentId]: [...(prev[commentId] || []), ...newReplies],
            }));

            // ✅ Increment page & update `hasMore`
            setShowMoreReplies((prev) => ({
                ...prev,
                [commentId]: { hasMore: response.data.hasMore, page: currentPage + 1 },
            }));
        }
    } catch (error) {
        console.error("❌ Error fetching replies:", error);
    } finally {
        setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
};



useEffect(() => {
    if (!commentsFetched[postId]?.fetched) {
        fetchComments();
    } else {
        setComments(commentsFetched[postId]?.comments || []);
        setReplies(commentsFetched[postId]?.replies || {});
        setIsLoading(false);
    }
}, [postId, commentsFetched]); // Add commentsFetched as a dependency
  
const MAX_LENGTH = 300;

const TruncatedText = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > MAX_LENGTH;
  const mentionRegex = /@([\w\d_]+)/g;

  const formattedContent = content.split(mentionRegex).map((part, index) => {
    if (index % 2 !== 0) {
      return (
        <CustomLink key={index} href={`/p/${part}`} className="text-[#ff5757bd] hover:text-gray-500 transition-colors duration-150 cursor-pointer">
          @{part}
        </CustomLink>
      );
    }
    return part;
  });

  return (
    <div className="text-sm text-gray-600 break-words break-all whitespace-normal">
      {content === "This reply was filtered due to inappropriate content." ? (
        <p className="text-[#ff5757] text-xs italic">{content}</p>
      ) : isExpanded ? (
        formattedContent
      ) : (
        formattedContent.slice(0, MAX_LENGTH)
      )}
      {shouldTruncate && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#ff5757] text-xs ml-1 cursor-pointer">
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};



  const addReply = async (commentId: string) => {
    if (!newComment.trim()) return;
    setLoading(true);
  
    try {
      let finalContent = newComment;
  
      if (replyingTo && !newComment.startsWith(`@${replyingTo.username} `)) {
        finalContent = `@${replyingTo.username} ${newComment}`;
      }
  
      const response = await axiosInstance.post(`/post/add-comment/${postId}`, {
        content: finalContent,
        replyTo: commentId,
      });
  
      if (response.data.success) {
        setReplies((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), response.data.reply],
        }));
  
        setNewComment("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReply = async (commentId: string, replyId: string) => {
    try {
      const response = await axiosInstance.delete(`/post/delete-reply/${commentId}/${replyId}`);
  
      if (response.data.success) {
        // ✅ Update local state to mark the reply as deleted
        setReplies((prev) => ({
          ...prev,
          [commentId]: prev[commentId].map((reply) =>
            reply?._id === replyId ? { ...reply, isDeleted: true } : reply
          ),
        }));
  
        // ✅ Emit event to notify other users in the post room
        if (socket) {
          socket.emit("deleteReply", { postId, commentId, replyId });
        }
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      triggerAnimation("error", "An error occurred while deleting your reply.");
    }
  };
  return (
<>
{AnimationComponent}

<AnimatePresence>
<motion.div 
              initial={{ opacity: 0 }} // Starts slightly below and transparent
              animate={{ opacity: 1 }} // Fades in and moves up
              exit={{ opacity: 0}} // Fades out and moves down
              transition={{ duration: 0.2, ease: "easeIn" }} // Smooth transition
    className="h-screen w-full fixed top-0 left-0 bg-black/40 backdrop-blur-xs z-[70] flex items-end justify-center">
<motion.div
          initial={{ opacity: 0, y: 20 }} // Starts slightly below and transparent
          animate={{ opacity: 1, y: 0 }} // Fades in and moves up
          exit={{ opacity: 0, y: 20 }} // Fades out and moves down
          transition={{ duration: 0.4, ease: "easeOut" }} // Smooth transition
className="md:mb-4 p-4 border border-gray-400 bg-white w-full md:max-w-2xl md:mx-4 md:rounded-2xl rounded-tr-2xl rounded-tl-2xl pt-6 pb-0 relative min-h-[75vh] max-h-[75vh] flex flex-col overflow-y-hidden">
      <button 
        className="absolute top-4 right-4 text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all duration-150 cursor-pointer"
        onClick={() => {
          setShowComments(null);
          hasFetchedRef.current = false;
        }}
      >
        <X className="h-5 w-5" />
      </button>
      <p 
        className="absolute top-4 left-4 text-gray-600 px-3 bg-gray-200 p-2 rounded-full transition-all duration-150 text-[13px]"
      >
        
 {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
      </p>
    <Card className="mt-9 border-0 shadow-none flex-grow overflow-y-auto">
                    {/* Input for new comment */}
      {/* Comments List */}
      <div className="space-y-3 relative flex items-center flex-col justify-center">
      {isLoading ? (
    <div className="space-y-3">
      <Loader2 className="h-7 w-7 animate-spin text-gray-400"/>
    </div>
  ) :
        mergedComments.length === 0 && postOwner?._id!= user?._id ? (
<div className="flex flex-col items-center justify-center gap-2">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-megaphone-fill h-9 w-9 text-gray-500" viewBox="0 0 16 16">
  <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0zm-1 .724c-2.067.95-4.539 1.481-7 1.656v6.237a25 25 0 0 1 1.088.085c2.053.204 4.038.668 5.912 1.56zm-8 7.841V4.934c-.68.027-1.399.043-2.008.053A2.02 2.02 0 0 0 0 7v2c0 1.106.896 1.996 1.994 2.009l.496.008a64 64 0 0 1 1.51.048m1.39 1.081q.428.032.85.078l.253 1.69a1 1 0 0 1-.983 1.187h-.548a1 1 0 0 1-.916-.599l-1.314-2.48a66 66 0 0 1 1.692.064q.491.026.966.06"/>
</svg>
<p className="text-sm text-gray-500 animate-pulse text-center">Be the first one to comment <br/> and hype <span className="capitalize">{postOwner.firstName} 🚀</span></p>
</div>
        ) : mergedComments.length === 0 ? (

            <div className="flex flex-col items-center justify-center gap-2">
                <MessageSquareWarning  className="text-gray-500 h-12 w-12 stroke-[1.5] animate-pulse"/>
                <p className="text-sm text-gray-500 animate-pulse text-center">No comments yet.</p>
            </div>
        ) :
         (
          mergedComments.slice(0, visibleCount).map((comment) => {
            const commenter = comment?.commenterId; 
            const isLiked = comment.likedBy.includes(user?._id);// Ensure commenterId exists

            return (
<>
<Separator className="bg-[#eeeeee]" />
  <div
  key={comment._id} className="flex w-full items-start gap-1.5">
    {/* Avatar (outside the background color) */}
    <CustomLink href={`/p/${commenter?.username}`}>
    <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
      <AvatarImage src={commenter?.avatar || "/default-avatar.png"} alt="User Avatar" />
      <AvatarFallback className="bg-gray-300"></AvatarFallback>
    </Avatar>
    </CustomLink>
    {/* Comment Content (with background color) */}
    <div className="w-full mr-3">
    <div className="bg-[#f5f5f500] px-1 rounded-xl w-full">
      <div className="flex items-center gap-1 w-full justify-between">
                <CustomLink href={`/p/${commenter?.username}`} className="flex items-center gap-1">
                <p className="text-sm font-normal capitalize text-gray-800">
          {commenter?.firstName || "Unknown"} {commenter?.lastName || ""}
        </p>
        {postOwner._id === commenter._id && (
    <p className="text-gray-700 px-1.5 rounded-sm ml-0.5 text-xs bg-gray-200">Author</p>
  )}
                </CustomLink>
        <div className="flex items-center gap-2">
        <p className="text-[11px] text-gray-500">{formatTimeAgo(comment.createdAt)}</p>
          <div><CommentReplyThreeDotsAction /></div>
        </div>
      </div>
      {comment.includesBadWords && (
          <p className="text-red-400 text-xs bg-red-50 w-fit px-1 py-1 rounded-full">Comment censored due to community guideline violations.</p>
  )}
  <TruncatedText content={comment.content} />
</div>



      {/* Reply and Delete Actions */}
      <div className="flex items-center gap-1.5 mt-2">
      <button
        onClick={() => toggleLike(comment._id, isLiked)}
        disabled={likeLoading[comment._id]}
        className="flex items-center gap-1 text-[12px] text-gray-600 cursor-pointer"
      >
        <Heart className={`h-3 w-3 ${isLiked ? "text-[#ff5757]" : "text-gray-600"}`} fill={isLiked ? "#ff5757" : "none"}/> 
        {comment.likesCount} Likes
      </button>
                    <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                    <button
  onClick={() => handleReplyClick(commenter?.username, comment._id)}
  className="flex items-center gap-1 text-[12px] text-gray-600 cursor-pointer"
>
  <Reply className="h-3.5 w-3.5" /> Reply
</button>
{commenter?._id != user?._id && (
<>
<div className="h-1 w-1 bg-gray-600 rounded-full"></div>
          <CommentReport />
</>
        )}
        {commenter?._id === user?._id && (
<>
<div className="h-1 w-1 bg-gray-600 rounded-full"></div>
          <p className="cursor-pointer flex items-center gap-1 text-[12px] text-gray-600" onClick={() => deleteComment(comment._id)}>
         <Trash2 className="h-3 w-3 text-gray-600" /> Delete
          </p>
</>
        )}
                {user?.isAdmin && (
<>
<div className="h-1 w-1 bg-gray-600 rounded-full"></div>
          <p className="cursor-pointer flex items-center gap-1 text-[12px] text-[#ff5757]" onClick={() => deleteComment(comment._id)}>
         <Shield className="h-3 w-3 text-[#ff5757]" fill="#ff5757"/> Delete
          </p>
</>
        )}
      </div>

      {/* Replies Section */}
      {mergedReplies[comment._id]?.length > 0 && (
        <div className="mt-2">
           {mergedReplies[comment._id]?.filter(reply => reply && reply._id && !reply.isDeleted).map((reply) =>  (
            <>
            <div key={reply._id} className="flex items-start gap-1.5 mt-2">
            <CustomLink href={`/p/${reply?.commenterId?.username}`} className="relative">
      <Avatar className="w-8 h-8 flex-shrink-0 mt-2">
        <AvatarImage src={reply?.commenterId?.avatar || "/default-avatar.png"} alt="User Avatar" />
        <AvatarFallback className="bg-gray-300"></AvatarFallback>
      </Avatar>
      <div className="absolute bg-[#ff57572f] h-0.5 w-3.5  rounded-full top-5.5 right-10"></div>
      <div className="absolute bg-[#ff57572f] h-full w-0.5 rounded-full bottom-4 right-13"></div>
    </CustomLink>
<div className="w-full">
<div className="bg-[#f5f5f500] px-1 py-2 rounded-xl">
        <div className="flex items-center gap-1 justify-between">
          <CustomLink href={`/p/${reply?.commenterId?.username}`} className="flex items-center gap-1">
            <p className="text-sm font-normal capitalize text-gray-800">
              {reply?.commenterId?.firstName || "Unknown"} {reply?.commenterId?.lastName || ""}
            </p>
        {postOwner._id === reply?.commenterId?._id && (
    <p className="text-gray-700 px-1.5 rounded-sm ml-0.5 text-xs bg-gray-200">Author</p>
  )}
          </CustomLink>
          <div className="flex items-center gap-2">
        <p className="text-[11px] text-gray-500">{formatTimeAgo(reply.createdAt)}</p>
          <div><CommentReplyThreeDotsAction /></div>
        </div>
        </div>
        {reply?.includesBadWords && (
          <p className="text-red-400 text-xs bg-red-50 w-fit px-1 py-1 rounded-full">Reply censored due to community guideline violations.</p>
        )}
        <TruncatedText content={reply?.content} />
      </div>
              <div className="flex items-center gap-1.5 justify-start mt-0.5">
                          <button
              onClick={() => handleReplyToReply(comment._id, reply.commenterId?.username)}
              className="text-[12px] text-gray-600 flex items-center gap-1 cursor-pointer"
            >
              <Reply className="h-3.5 w-3.5" /> Reply
            </button>
            {reply.commenterId?._id != user?._id && (
                            <>
                            <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                            <CommentReport />
                            </>
                )}
                          {reply.commenterId?._id === user?._id && (
                            <>
                            <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                            <button className="text-[12px] text-gray-600 cursor-pointer flex items-center gap-1"  onClick={() => deleteReply(comment._id, reply._id)}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                            </>
                )}
                                {user?.isAdmin && (
<>
<div className="h-1 w-1 bg-gray-600 rounded-full"></div>
<button className="text-[12px] text-[#ff5757] cursor-pointer flex items-center gap-1"  onClick={() => deleteReply(comment._id, reply._id)}>
                      <Shield className="h-3 w-3 text-[#ff5757]" fill="#ff5757"/> Delete
                    </button>
</>
        )}
                    </div>
</div>
            </div>

            </>
          ))}
 {showMoreReplies[comment._id]?.hasMore && (
  <button
    onClick={() => fetchReplies(comment._id)} // Fetch next 10 replies
        className="text-gray-500 text-[12.5px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-full ml-0 mt-2"
    disabled={loadingReplies[comment._id]}
  >

    {loadingReplies[comment._id] ? <div className="flex items-center gap-1"><Loader2 className="animate-spin h-4 w-4"/> Loading</div> : <div className="flex items-center gap-2"><RefreshCcw className="h-4 w-4"/> Load more replies</div>}
  </button>
)}

        </div>
      )}




      
    </div>
  </div>
</>
            );
        })
    )}
    </div>
      

    {hasMore && (
    <div className="flex justify-start mt-3">
      <button 
        onClick={handleShowMore} 
        className="text-gray-500 text-[12.5px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-full"
        disabled={isFetchingMore}
      >
        {isFetchingMore ? <div className="flex items-center gap-1"><Loader2 className="animate-spin h-4 w-4"/> Loading</div> : <div className="flex items-center gap-2"><RefreshCcw className="h-4 w-4"/> Load more comments</div>}
      </button>
    </div>
  )}
    </Card>
      <div className="sticky bottom-0 left-0 w-full  py-4 flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.avatar || "/default-avatar.png"} alt="User Avatar"/>
          <AvatarFallback className="bg-gray-300"></AvatarFallback>
        </Avatar>

        <div className="flex-grow relative">
          {replyingTo && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="absolute top-[-21px] left-0 text-xs text-gray-700 bg-[#ffffffc7] px-2 py-0.5 rounded-sm border border-gray-200"
            >
              Replying to <span className="text-gray-700 lowercase">@{replyingTo.username}</span>
              <button onClick={cancelReply} className="text-[#ff5757] text-xs ml-1 cursor-pointer">Cancel</button>
            </motion.div>
          )}

          <input
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            placeholder="Write a comment..."
            onKeyDown={handleKeyPress}
            className="w-full bg-[#f3f3f3] border-gray-200 focus:outline-0 text-gray-700 text-sm h-8 rounded-full pl-4"
          />
        </div>
        <div className="relative">
  <Button
    disabled={loading}
    className="px-3 hover:bg-gray-400/20 rounded-full"
    onClick={() => setShowEmojiPicker((prev) => !prev)} // Toggle picker
  >
    <Smile className="h-6 w-6 text-gray-800" />
  </Button>

  {/* Emoji Picker (Hidden by default) */}
  {showEmojiPicker && (
    <div className="absolute bottom-12 right-0 z-50">
      <EmojiPicker onEmojiClick={handleEmojiClick} width={pickerSize.width} height={pickerSize.height} />
    </div>
  )}
</div>

        <Button onClick={addComment} disabled={loading} className="px-3 hover:bg-gray-400/20 rounded-full">
          <Send className="h-6 w-6 text-gray-800" />
        </Button>
      </div>
      </motion.div>
      </motion.div>
</AnimatePresence>

    </>
  );
}
