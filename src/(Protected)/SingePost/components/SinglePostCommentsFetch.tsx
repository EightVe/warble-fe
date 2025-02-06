import { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";// Import AuthContext
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, Reply, Send, Trash2, Heart, Flag, Smile, Shield, Loader2 } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { useCircleAnimation } from "@/components/ui/useCircleAnimation";
import CustomLink from "@/hooks/useLink";
import { Card } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { useSocket } from "@/contexts/SocketContext";
  
interface CommentProps {
  postId: string;
  postOwner:any;
  commentsFetched:any;
  setCommentsFetched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; // ✅ Add this
  postUID?: string;
}
export default function SinglePostCommentsFetch({ postId, postOwner,commentsFetched,postUID,setCommentsFetched }: CommentProps) {
  const { user } = useContext(AuthContext) || {}; // Get current logged-in user
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [successDelete, setSuccessDelete] = useState(false);
  const { triggerAnimation, AnimationComponent } = useCircleAnimation();

  const [page, setPage] = useState(1); // Track pagination
const [hasMore, setHasMore] = useState(true); // Check if more comments exist
  const [visibleCount, setVisibleCount] = useState(5);
  const fetchingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fetchLimit] = useState(5); // First fetch is 5, next is 10
  const [likeLoading, setLikeLoading] = useState<{ [key: string]: boolean }>({});
  const [replies, setReplies] = useState<{ [key: string]: any[] }>({});
  const [loadingReplies, setLoadingReplies] = useState<{ [key: string]: boolean }>({});
  const [showMoreReplies, setShowMoreReplies] = useState<{ [key: string]: { hasMore: boolean; page: number } }>({});

  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { socket, comments: socketComments, replies: socketReplies } = useSocket();
  const mergedComments = Array.from(
    new Map(
      [...(socketComments?.[postId] || []), ...comments].map((c) => [c._id, c])
    ).values()
  );
  
  const mergedReplies = { ...replies, ...(socketReplies || {}) }; // ✅ Ensure it's always an object
// ✅ Join and leave post room
useEffect(() => {
  if (!socket || !user || !postId) return;

  console.log(`🚀 Rejoining post room on every action: ${postId}`);
  socket.emit("joinPostRoom", postId);

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
  
    return () => {
      socket.off("newComment", handleNewComment);
      socket.off("newReply", handleNewReply);
      socket.off("deleteComment", handleCommentDeleted);
      socket.off("replyDeleted", handleReplyDeleted);
    };
  }, [socket, postId]);
  
  


  
  
const handleReplyToReply = (commentId: string, replyUsername: string) => {
  setReplyingTo({ commentId, username: replyUsername });
  setNewComment((prev) => (prev.startsWith(`@${replyUsername} `) ? prev : `@${replyUsername} `));
  setTimeout(() => inputRef.current?.focus(), 100);
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
  const location = useLocation();
  const commentIdFromUrl = new URLSearchParams(location.search).get("comment");
  const replyIdFromUrl = new URLSearchParams(location.search).get("reply");
  const fetchComments = async (isInitialLoad = false): Promise<void> => {
    if (!hasMore || fetchingRef.current) return;
    fetchingRef.current = true;

    if (isInitialLoad) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
        const response = await axiosInstance.get(`/post/get-comments/${postId}`, {
            params: { page, limit: fetchLimit, ...(commentIdFromUrl && { commentId: commentIdFromUrl }) },
        });

        if (response.data.success) {
            setComments((prev: any[]) => {
                const existingIds = new Set(prev.map((comment: any) => comment._id));
                const newComments = response.data.comments.filter((comment: any) => !existingIds.has(comment._id));
                return [...prev, ...newComments];
            });

            response.data.comments.forEach((comment: any) => fetchReplies(comment._id));

            setPage((prevPage: number) => prevPage + 1);
            setHasMore(response.data.hasMore);
        }
    } catch (error) {
        console.error(`❌ Error fetching comments for Post ID: ${postId}`, error);
    } finally {
        fetchingRef.current = false;
        setIsLoading(false);
        setIsFetchingMore(false);
    }
};
  
  
  
  
//   useEffect(() => {
//     console.log("Updated Comments State:", comments);
//   }, [comments]);
  useEffect(() => {
    if (!commentsFetched[postId]) {
        fetchComments(true);
        setCommentsFetched((prev) => ({ ...prev, [postId]: true }));
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
}, [comments.length]); // ✅ Now runs only when the **number of comments changes**




  
  
  
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

  const toggleLike = async (commentId: string, isLiked: boolean) => {
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

  
  
const MAX_LENGTH = 300;

const TruncatedText = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > MAX_LENGTH;

  return (
    <div className="text-sm text-gray-800 break-words break-all whitespace-normal">
      {isExpanded ? content : `${content.slice(0, MAX_LENGTH)}${shouldTruncate ? "..." : ""}`}
      
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#ff5757] text-xs ml-1 cursor-pointer"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
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

  const commentRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!commentIdFromUrl) return;
  
    console.log(`🧐 Looking for comment ID: ${commentIdFromUrl} and reply ID: ${replyIdFromUrl}`);
  
    const waitForCommentAndHighlight = async () => {
      let attempts = 0;
      let found = false;
  
      while (!found && attempts < 10) {
        const commentExists = comments.some((comment) => comment._id === commentIdFromUrl);
  
        if (commentExists) {
          console.log("✅ Comment found in fetched comments!");
  
          setTimeout(() => {
            const commentElement = commentRef.current[commentIdFromUrl];
            if (commentElement) {
              console.log("🎯 Scrolling to comment...");
              commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
              commentElement.classList.add("highlight-comment");
              console.log("🌟 Comment highlighted!");
  
              found = true;
  
              setTimeout(() => {
                commentElement.classList.remove("highlight-comment");
                console.log("⏳ Highlight effect removed.");
              }, 3000);
            } else {
              console.log("🚨 Comment element not found in the DOM!");
            }
          }, 500);
  
          // ✅ If reply exists, scroll to it
          if (replyIdFromUrl) {
            setTimeout(() => {
              const replyElement = document.getElementById(`reply-${replyIdFromUrl}`);
              if (replyElement) {
                console.log("🎯 Scrolling to reply...");
                replyElement.scrollIntoView({ behavior: "smooth", block: "center" });
                replyElement.classList.add("highlight-comment");
                console.log("🌟 Reply highlighted!");
  
                setTimeout(() => {
                  replyElement.classList.remove("highlight-comment");
                }, 3000);
              }
            }, 800);
          }
  
          break;
        }
  
        console.log(`⏳ Comment not found yet, retrying... (Attempt ${attempts + 1})`);
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
  
      if (!found) {
        console.log("⚠️ Comment not found after multiple attempts.");
      }
    };
  
    waitForCommentAndHighlight();
  }, [comments]);
  
  

  
  
  
  
  
  
  
  return (
<>
{AnimationComponent}
    <Card className="mt-2 border-0 shadow-none">
                    {/* Input for new comment */}
                    <Separator className="bg-gray-100 h-[0.5px] w-full"/>
                    <div className="flex items-center gap-2 mt-3">
<div className="w-full relative flex items-center gap-2 ">
<div className="w-full flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.avatar || "/default-avatar.png"} alt="User Avatar"/>
          <AvatarFallback className="bg-gray-300"></AvatarFallback>
        </Avatar>

        <div className="flex-grow relative">
          {replyingTo && (
            <motion.div 
              className="absolute top-[-21px] left-0 text-xs text-gray-700 bg-[#ffffffc7] px-2 py-0.5 rounded-sm border border-gray-200"
            >
              Replying to <span className="text-gray-700 lowercase">@{replyingTo.username}</span>
              <button onClick={cancelReply} className="text-[#ff5757] text-xs ml-1 cursor-pointer">Discard</button>
            </motion.div>
          )}

          <input
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            placeholder="Write a comment..."
            onKeyDown={handleKeyPress}
            className="w-full bg-[#f3f3f3] border-gray-200 focus:outline-0 text-gray-700 text-sm h-9 rounded-full pl-4 pr-4"
          />
        </div>
        <Button disabled={loading} className="px-3 hover:bg-gray-400/20 rounded-full">
          <Smile className="h-6 w-6 text-gray-800" />
        </Button>
        <Button onClick={addComment} disabled={loading} className="px-3 hover:bg-gray-400/20 rounded-full">
          <Send className="h-6 w-6 text-gray-800" />
        </Button>
      </div>
</div>
      </div>
      {/* Comments List */}
      <div className="mt-4 space-y-3">
      {isLoading ? (
    <div className="space-y-3">
      <CommentSkeleton />
    </div>
  ) :
        mergedComments.length === 0 && postOwner?._id!= user?._id ? (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-megaphone-fill" viewBox="0 0 16 16">
  <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0zm-1 .724c-2.067.95-4.539 1.481-7 1.656v6.237a25 25 0 0 1 1.088.085c2.053.204 4.038.668 5.912 1.56zm-8 7.841V4.934c-.68.027-1.399.043-2.008.053A2.02 2.02 0 0 0 0 7v2c0 1.106.896 1.996 1.994 2.009l.496.008a64 64 0 0 1 1.51.048m1.39 1.081q.428.032.85.078l.253 1.69a1 1 0 0 1-.983 1.187h-.548a1 1 0 0 1-.916-.599l-1.314-2.48a66 66 0 0 1 1.692.064q.491.026.966.06"/>
</svg>
             Be the first one to comment and hype <span className="capitalize">{postOwner.firstName}!</span></p>
        ) : (
          mergedComments.slice(0, visibleCount).map((comment) => {
            const commenter = comment?.commenterId; 
            const isLiked = comment.likedBy.includes(user?._id);// Ensure commenterId exists

            return (
<>
<Separator className="bg-[#eeeeee] " />
  <motion.div
  key={comment._id} className="flex w-full items-start gap-1.5">
    {/* Avatar (outside the background color) */}
    <CustomLink href={`/p/${commenter?.username}`}>
    <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
      <AvatarImage src={commenter?.avatar || "/default-avatar.png"} alt="User Avatar" />
      <AvatarFallback className="bg-gray-300"></AvatarFallback>
    </Avatar>
    </CustomLink>
    {/* Comment Content (with background color) */}
    <div className="">
    <div className="bg-[#f5f5f5] px-3 py-2 rounded-xl flex-1 w-fit" ref={(el) => commentRef && (commentRef.current[comment._id] = el)}>
      {/* Name and Time */}
      <div className="flex items-center gap-1 ">
                <CustomLink href={`/p/${commenter?.username}`}>
                <p className="text-sm font-normal capitalize">
          {commenter?.firstName || "Unknown"} {commenter?.lastName || ""}
        </p>
                </CustomLink>
        <div className="h-1 w-1 rounded-full bg-[#ff5757]"></div>
        <p className="text-[11px] text-[#ff5757]">{formatTimeAgo(comment.createdAt)}</p>
      </div>
      {/* Comment Text */}
      {comment.includesBadWords && (
    <p className="text-[#ff5757] text-xs italic">Comment filtered due to violence.</p>
  )}
  <TruncatedText content={comment.content} />

</div>

      {/* Comment Media (Image or Video) */}
      {comment.image && <img src={comment.image} alt="Comment Image" className="rounded-md mt-2 max-w-xs" />}
      {comment.video && (
        <video controls src={comment.video} className="rounded-md mt-2 max-w-xs" />
      )}

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
          <p className="cursor-pointer flex items-center gap-1 text-[12px] text-gray-600">
            <Flag className="h-3 w-3 text-gray-600" /> Report
          </p>
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
      {mergedReplies[comment._id]?.filter(reply => reply && reply._id && !reply.isDeleted).map((reply) => (
  <motion.div key={reply?._id} className="flex items-start gap-1.5 mt-2">
    <CustomLink href={`/p/${reply?.commenterId?.username}`}>
      <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
        <AvatarImage src={reply?.commenterId?.avatar || "/default-avatar.png"} alt="User Avatar" />
        <AvatarFallback className="bg-gray-300"></AvatarFallback>
      </Avatar>
    </CustomLink>
    <div>
      <div className="bg-[#f5f5f5] px-3 py-2 rounded-xl">
        <div className="flex items-center gap-1">
          <CustomLink href={`/p/${reply?.commenterId?.username}`}>
            <p className="text-sm font-normal capitalize">
              {reply?.commenterId?.firstName || "Unknown"} {reply?.commenterId?.lastName || ""}
            </p>
          </CustomLink>
          <div className="h-1 w-1 rounded-full bg-[#ff5757]"></div>
          <p className="text-[11px] text-[#ff5757]">{formatTimeAgo(reply?.createdAt)}</p>
        </div>
        {reply?.includesBadWords && (
          <p className="text-red-500 text-xs italic">Reply filtered due to violence.</p>
        )}
        <TruncatedText content={reply?.content} />
      </div>
      <div className="flex items-center gap-1.5 justify-start mt-0.5">
        <button
          onClick={() => handleReplyToReply(comment._id, reply?.commenterId?.username)}
          className="text-[12px] text-gray-600 flex items-center gap-1 cursor-pointer"
        >
          <Reply className="h-3.5 w-3.5" /> Reply
        </button>
        {reply?.commenterId?._id != user?._id && (
          <>
            <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
            <button className="text-[12px] text-gray-600 cursor-pointer flex items-center gap-1">
              <Flag className="h-3 w-3" /> Report
            </button>
          </>
        )}
        {reply?.commenterId?._id === user?._id && (
          <>
            <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
            <button
              className="text-[12px] text-gray-600 cursor-pointer flex items-center gap-1"
              onClick={() => deleteReply(comment._id, reply?._id)}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </>
        )}
        {user?.isAdmin && (
          <>
            <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
            <button
              className="text-[12px] text-[#ff5757] cursor-pointer flex items-center gap-1"
              onClick={() => deleteReply(comment._id, reply?._id)}
            >
              <Shield className="h-3 w-3 text-[#ff5757]" fill="#ff5757" /> Delete
            </button>
          </>
        )}
      </div>
    </div>
  </motion.div>
))}





      
    </div>
  </motion.div>

  {/* Success Delete Dialog */}
  <Dialog
    open={successDelete}
    onOpenChange={(successDelete) => {
      if (successDelete) setSuccessDelete(true);
    }}
    modal={true}
  >
    <DialogContent className="bg-white rounded-lg shadow-lg max-w-md">
      <DialogHeader>
        <DialogTitle>
          <div className="w-full flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
            >
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </motion.div>
          </div>
        </DialogTitle>
      </DialogHeader>
      <p className="text-sm text-gray-600 text-center">
        Your comment has been deleted!
      </p>
      <div className="flex items-center justify-center w-full">
        <Button
          onClick={() => setSuccessDelete(false)}
          className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-tr from-[#ff2941] to-[#ff078e] h-8 font-normal text-white text-[13px]"
          size="sm"
        >
          Okay
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</>
            );
            
          })
          
        )}
  {hasMore && (
    <div className="flex justify-start mt-3">
      <button 
        onClick={handleShowMore} 
        className="text-gray-500 text-[12.5px] cursor-pointer underline"
        disabled={isFetchingMore}
      >
        {isFetchingMore ? <div className="flex items-center gap-1"><Loader2 className="animate-spin h-3 w-3"/> Loading please wait...</div> : "Show more comments..."}
      </button>
    </div>
  )}
      </div>
    </Card>
    </>
  );
}
