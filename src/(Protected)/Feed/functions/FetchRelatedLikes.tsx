import React, { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CustomLink from '@/hooks/useLink';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Loader2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSocket } from '@/contexts/SocketContext';

interface FetchRelatedLikesProps {
    postId: string;
}

interface Like {
    likerId: {
        firstName: string;
        lastName: string;
        avatar: string;
        username: string;
    };
}

export default function FetchRelatedLikes({ postId }: FetchRelatedLikesProps) {
    const [likes, setLikes] = useState<Like[]>([]);
    const [loading, setLoading] = useState(false);
    const [showMoreLikes, setShowMoreLikes] = useState(false);

    const { socket } = useSocket();
  
    // ✅ Fetch likes from API
    useEffect(() => {
      const fetchLikes = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/post/get-related-likes/${postId}`);
          setLikes(response.data.likes);
        } catch (error) {
          console.error("Error fetching likes:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchLikes();
    }, [postId]);
  
    // ✅ Listen for real-time like updates
    useEffect(() => {
      if (!socket) return;
  
      const handlePostLiked = (data: { postId: string; likes: any[] }) => {
        if (data.postId === postId) {
          setLikes(data.likes);
        }
      };
  
      const handlePostUnliked = (data: { postId: string; likes: any[] }) => {
        if (data.postId === postId) {
          setLikes(data.likes);
        }
      };
  
      socket.on("postLiked", handlePostLiked);
      socket.on("postUnliked", handlePostUnliked);
  
      return () => {
        socket.off("postLiked", handlePostLiked);
        socket.off("postUnliked", handlePostUnliked);
      };
    }, [socket, postId]);

    return (
        <>
            <div className="flex space-x-1 mt-2 items-center cursor-pointer group transition-all duration-150" onClick={() => setShowMoreLikes(true)}>
                    <>
                                    <Heart  className='h-3.5 w-3.5 text-gray-500 group-hover:text-[#ff5757ae]'/>
                    <span className="text-xs text-gray-500 cursor-pointer group-hover:text-[#ff5757ae]">
                      {likes.length}
                    </span>
                    </>
            </div>

            <AnimatePresence>
                {showMoreLikes && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.2, ease: "easeIn" }}
                        className="h-screen w-full fixed top-0 left-0 bg-black/40 backdrop-blur-xs z-[70] flex items-end justify-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="md:mb-4 p-4 border border-gray-400 bg-white w-full md:max-w-2xl md:mx-4 md:rounded-2xl rounded-tr-2xl rounded-tl-2xl pt-6 pb-0 relative min-h-[75vh] max-h-[75vh] flex flex-col overflow-y-hidden"
                        >
                            <button 
                                className="absolute top-4 right-4 text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all duration-150 cursor-pointer"
                                onClick={() => setShowMoreLikes(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <p className="absolute top-4 left-4 text-gray-600 px-3 bg-gray-200 p-2 rounded-full transition-all duration-150 text-[13px]">
                                {likes.length} {likes.length === 1 ? "Like" : "Likes"}
                            </p>
                            <Card className="mt-9 border-0 shadow-none flex-grow overflow-y-auto">
                                <div className="space-y-2 flex items-start flex-col justify-center">
                                <Separator className='bg-gray-200 h-[0.5px] mb-4'/>
                                    {loading ? (
                                        <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
                                    ) : (
                                        likes.map((like, index) => (
                                           <>
                                           
                                           <div key={index} className="flex items-center space-x-2">
                                                <CustomLink href={`/p/${like.likerId.username}`}>
                                                <Avatar className='h-6 w-6'>
                                                    <AvatarImage src={like.likerId.avatar} alt="User Avatar" />
                                                    <AvatarFallback className='bg-gray-300'></AvatarFallback>
                                                </Avatar>
                                                </CustomLink>
                                                <CustomLink href={`/p/${like.likerId.username}`}><span className="text-sm text-gray-800">{like.likerId.firstName} {like.likerId.lastName}</span></CustomLink><p className='text-xs text-gray-400'>liked this post.</p>
                                            </div>
                                           </>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
