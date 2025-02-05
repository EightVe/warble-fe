import { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";// Import AuthContext
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, CircleAlert, CircleCheck, CircleX, Icon, Image, Loader, Loader2, Megaphone, MessageSquare, Reply, Send, Trash2, TriangleAlertIcon, Video, ThumbsUp, Heart, Flag, X, MessageSquareWarning, Smile, Shield } from "lucide-react";
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

  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
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
        const updatedComments = await Promise.all(
          comments.map(async (comment) => {
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
        setComments(updatedComments);
      } catch (error) {
        console.error("Error fetching like status for comments:", error);
      }
    };
  
    if (comments.length > 0) {
      fetchLikeStatusForComments();
    }
  }, [comments.length]); // Fetch like status when comments are loaded
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
    
        const response = await axiosInstance.post(`/post/add-comment/${postId}`, payload);
    
        if (response.data.success) {
          if (replyingTo) {
            setReplies((prev) => ({
              ...prev,
              [replyingTo.commentId]: [...(prev[replyingTo.commentId] || []), response.data.reply],
            }));
          } else {
            setComments((prev) => [response.data.comment, ...prev]);
          }
    
          setNewComment("");
          setReplyingTo(null);
        }
      } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
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
        setComments(comments.filter((comment) => comment._id !== commentId)); // Remove comment from UI
      }
    } catch (error) {
        triggerAnimation("error", "An error accured while deleting your comment.");
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
            params: { page: currentPage, limit , userId: user?._id  },
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
        setReplies((prev) => ({
          ...prev,
          [commentId]: prev[commentId].filter((reply) => reply._id !== replyId),
        }));

      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      triggerAnimation("error", "An error accured while deleting your reply.");
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
        comments.length === 0 && postOwner?._id!= user?._id ? (
<div className="flex flex-col items-center justify-center gap-2">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-megaphone-fill h-9 w-9 text-gray-500" viewBox="0 0 16 16">
  <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0zm-1 .724c-2.067.95-4.539 1.481-7 1.656v6.237a25 25 0 0 1 1.088.085c2.053.204 4.038.668 5.912 1.56zm-8 7.841V4.934c-.68.027-1.399.043-2.008.053A2.02 2.02 0 0 0 0 7v2c0 1.106.896 1.996 1.994 2.009l.496.008a64 64 0 0 1 1.51.048m1.39 1.081q.428.032.85.078l.253 1.69a1 1 0 0 1-.983 1.187h-.548a1 1 0 0 1-.916-.599l-1.314-2.48a66 66 0 0 1 1.692.064q.491.026.966.06"/>
</svg>
<p className="text-sm text-gray-500 animate-pulse text-center">Be the first one to comment <br/> and hype <span className="capitalize">{postOwner.firstName} 🚀</span></p>
</div>
        ) : comments.length === 0 ? (

            <div className="flex flex-col items-center justify-center gap-2">
                <MessageSquareWarning  className="text-gray-500 h-12 w-12 stroke-[1.5] animate-pulse"/>
                <p className="text-sm text-gray-500 animate-pulse text-center">No comments yet.</p>
            </div>
        ) :
         (
            comments.slice(0, visibleCount).map((comment) => {
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
    <div className="">
    <div className="bg-[#f5f5f5] px-3 py-2 rounded-xl flex-1 w-fit">
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
      <>
  {comment.includesBadWords && (
    <p className="text-red-500 text-xs italic">Comment filtered due to violence.</p>
  )}
  <TruncatedText content={comment.content} />
</>

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
      {replies[comment._id]?.length > 0 && (
        <div className="mt-2">
          {replies[comment._id].map((reply) => (
            <>
            <div key={reply._id} className="flex items-start gap-1.5 mt-2">
                    <CustomLink href={`/p/${commenter?.username}`}>
              <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
                <AvatarImage src={reply?.commenterId?.avatar || "/default-avatar.png"} alt="User Avatar" />
                <AvatarFallback className="bg-gray-300"></AvatarFallback>
              </Avatar>
              </CustomLink>
<div>
<div className="bg-[#f5f5f5] px-3 py-2 rounded-xl">
                <div className="flex items-center gap-1">
                <CustomLink href={`/p/${commenter?.username}`}>
                  <p className="text-sm font-normal capitalize">
                    {reply.commenterId?.firstName || "Unknown"} {reply.commenterId?.lastName || ""}
                  </p>
                  </CustomLink>
                  <div className="h-1 w-1 rounded-full bg-[#ff5757]"></div>
                  <p className="text-[11px] text-[#ff5757]">{formatTimeAgo(reply.createdAt)}</p>
                </div>
                <>
  {reply.includesBadWords && (
    <p className="text-red-500 text-xs italic">Reply filtered due to violence.</p>
  )}
  <TruncatedText content={reply.content} />
</>

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
        className="text-gray-500 text-[12.5px] cursor-pointer underline"
    disabled={loadingReplies[comment._id]}
  >

    {loadingReplies[comment._id] ? <div className="flex items-center gap-1"><Loader2 className="animate-spin h-3 w-3"/> Loading please wait...</div> : "Load more replies..."}
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
        className="text-gray-500 text-[12.5px] cursor-pointer underline"
        disabled={isFetchingMore}
      >
        {isFetchingMore ? <div className="flex items-center gap-1"><Loader2 className="animate-spin h-3 w-3"/> Loading please wait...</div> : "Show more comments..."}
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
            className="w-full bg-[#f3f3f3] border-gray-200 focus:outline-0 text-gray-700 text-sm h-8 rounded-full pl-4"
          />
        </div>
        <Button disabled={loading} className="px-3 hover:bg-gray-400/20 rounded-full">
          <Smile className="h-6 w-6 text-gray-800" />
        </Button>
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
