import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

interface LikeFunctionalityProps {
  postId: string;
  initialLikes: number;
}

export default function LikeFunctionality({ postId, initialLikes }: LikeFunctionalityProps) {
  const [liked, setLiked] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Used for initial loading

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await axiosInstance.get(`/post/check-like/${postId}`);
        if (response.data.success) {
          setLiked(response.data.liked);
        }
      } catch (error) {
        console.error("Error fetching like status:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchLikeStatus();
  }, [postId]);

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let response;
      if (liked) {
        response = await axiosInstance.post(`/post/remove-like/${postId}`);
      } else {
        response = await axiosInstance.post(`/post/like/${postId}`);
      }

      if (response.data.success) {
        setLiked(response.data.liked);
        setLikes(response.data.likes);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggleLike} className="w-full flex items-center justify-center gap-1 cursor-pointer hover:bg-gray-100 transition-all duration-150 px-3 py-1.5 rounded-full" disabled={loading}>
      {isFetching ? (
        // Skeleton for initial loading
        <div className="h-4 w-8 bg-gray-300 animate-pulse rounded-md"></div>
      ) : loading ? (
        // Skeleton for button loading
        <div className="flex items-center gap-1">
          <div className="h-4 w-8 bg-gray-300 animate-pulse rounded-md"></div>
        </div>
      ) :  (
        <>
          <Heart className={`h-4 w-4 ${liked ? "text-[#ff5757] fill-[#ff5757]" : ""}`} />
          <span className="hidden md:flex ">{liked ? "Liked" : "Like"}</span>
        </>
      )}
    </button>
  );
}
