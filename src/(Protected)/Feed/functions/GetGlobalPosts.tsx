import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { Forward, Heart, Loader, Loader2, MapPin, MessageSquareHeart, MessageSquareShare, MessageSquareText, Plus, Send, Share, Share2, X } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/AuthContext";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import axiosInstance from "@/lib/axiosInstance";
import ThreeDotsAction from "./ThreeDotsAction";
import PostCardHover from "./PostCardHover";
import LikeFunctionality from "./LikeFunctionality";
import CommentFunctionality from "./CommentFunctionality";
import {FastAverageColor} from "fast-average-color";
import { AnimatePresence, motion } from "framer-motion";

import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import FetchRelatedLikes from "./FetchRelatedLikes";
import FollowFunctionality from "./Follow_Message/FollowFunctionality";
import { useMediaQuery } from "react-responsive";
import MediaModal from "./images/MediaModal";
import GeneralMediaModal from "./images/GeneralMediaModel";
// Define PostOwner interface
interface PostOwner {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  username: string;
  city?: string;
  country?: string;
}

// Define Post interface
interface Post {
  _id: string;
  createdAt: string;
  postUID: string;
  postOwner: PostOwner;
  content: string;
  images: string[]; // Array of image URLs
  videos: string[]; // Array of video URLs
  likes: number;
  comments: string[];
  shares: number;
  locationCity?: string;
  locationCountry?: string;
}

// Define API response type
interface ApiResponse {
  success: boolean;
  posts: Post[];
}

    export default function GetGlobalPosts() {
        const { user } = useContext(AuthContext) || {}; 
        const [showComments, setShowComments] = useState<string | null>(null);
        const [posts, setPosts] = useState<Post[]>([]);
        const [loading, setLoading] = useState<boolean>(false);
        const [hasMore, setHasMore] = useState<boolean>(true);
        const [dominantColors, setDominantColors] = useState<{ [key: string]: string }>({});
        const skipRef = useRef<number>(0); // Track the skip value
        const fetchingRef = useRef<boolean>(false);
        const limit = 5;
        const [commentsFetched, setCommentsFetched] = useState<{ [key: string]: boolean }>({});
        const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
const [isFetching, setIsFetching] = useState<boolean>(false);
const fetchPosts = async () => {
  if (!hasMore || loadingPosts || fetchingRef.current) return;
  fetchingRef.current = true;
  setLoadingPosts(true);

  try {
      const response = await axiosInstance.get<ApiResponse>("/post/get-all-posts", {
          params: { skip: skipRef.current, city: user?.city, country: user?.country },
      });

      if (!response.data.success || response.data.posts.length === 0) {
          setHasMore(false);
          setLoadingPosts(false);
          fetchingRef.current = false;
          return;
      }

      const newPosts = response.data.posts;
      newPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPosts((prevPosts) => {
          const uniquePosts = [...prevPosts, ...newPosts].reduce((acc, post) => {
              if (!acc.some((p) => p._id === post._id)) {
                  acc.push(post);
              }
              return acc;
          }, [] as Post[]);
          return uniquePosts;
      });

      skipRef.current += newPosts.length;
      setLoadingPosts(false);
      fetchingRef.current = false;
  } catch (error) {
      console.error("Error fetching posts:", error);
      setLoadingPosts(false);
  }
};
useEffect(() => {
  setPosts([]); // ✅ Clear previous posts on refresh
  skipRef.current = 0; // ✅ Reset skip value to 0
  fetchPosts();
}, []);
          // **🛠 Fix: Improved Scroll Event - Triggers Only Once**
          useEffect(() => {
            const handleScroll = () => {
                if (!isFetching && hasMore) {
                    const nearBottom = window.innerHeight + document.documentElement.scrollTop + 5 >= document.documentElement.scrollHeight;
                    if (nearBottom) {
                        fetchPosts();
                    }
                }
            };
        
            window.addEventListener("scroll", handleScroll, { passive: true });
            return () => window.removeEventListener("scroll", handleScroll);
        }, [isFetching, hasMore]);
        
          useEffect(() => {
            fetchPosts(); // Initial fetch
          }, []);
        const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
        const toggleExpand = (postId: string) => {
            setExpanded((prev) => ({ ...prev, [postId]: !prev[postId] }));
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
          const [mediaLoaded, setMediaLoaded] = useState<{ [key: string]: boolean }>({});
          const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
          
          const handleMediaLoad = (postId: string, index: number) => {
            setMediaLoaded((prev) => ({ ...prev, [`${postId}-${index}`]: true }));
          };
          
          const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
          const [selectedPostMedia, setSelectedPostMedia] = useState<string[]>([]); // ✅ Store only clicked post media
          
          const handleOpenModal = (postMedia: string[], mediaUrl: string) => {
            setSelectedPostMedia(postMedia); // ✅ Now stores only the clicked post’s media
            setSelectedMedia(mediaUrl);
          };
          
          const handleCloseModal = () => {
            setSelectedMedia(null);
          };
          
          
        
        return (
<div className="w-full max-w-2xl">
  
            {posts.map((post) => (
              <>
              <div key={post._id} className="mb-4 border-0 shadow-none bg-[#fff] rounded-2xl">
                <div className="p-4 pb-1.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                    <PostCardHover data={post.postOwner}>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={post.postOwner.avatar} alt={post.postOwner.username} />
                        <AvatarFallback className="bg-gray-300"></AvatarFallback>
                      </Avatar>
                        </PostCardHover>
                      <div>
                        <PostCardHover data={post.postOwner}>
                          
<div className="flex items-center gap-1">
<p className="tracking-tight text-[14.5px] capitalize text-gray-800">
                          {post.postOwner.firstName}  {post.postOwner.lastName}
                        </p>
                        <div className="h-1 w-1 bg-[#ff5757] rounded-full"></div>
                        <p className="text-xs text-[#ff5757]">{formatTimeAgo(post.createdAt)}</p>
</div>
                        </PostCardHover>
                        {(post.locationCity || post.locationCountry) ? (
                          <p className="text-[12px] text-gray-500 flex items-center gap-0.5">
                          <MapPin className="h-3.5 w-3.5"/>  {post.locationCity}{post.locationCity && post.locationCountry && ","} {post.locationCountry && ` ${post.locationCountry}`}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 lowercase">
                           @{post.postOwner.username}
                          </p>
                        )}
                      </div>

                        </div>
                     <div className="flex items-center gap-2">
                      <FollowFunctionality />
                     <ThreeDotsAction PostId={post}/>
                     </div>
                  </div>


                  {loadingPosts ? (
    <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse mt-3"></div>
) : (
    <p className="mt-3 text-sm text-gray-600 break-words break-all whitespace-normal">
        {post?.content &&
            (expanded[post._id]
                ? post.content
                : post.content.length > 300
                ? `${post.content.slice(0, 300)}...`
                : post.content
            )}
        {post?.content.length > 300 && (
            <button
                onClick={() => toggleExpand(post._id)}
                className="text-[#ff5757] ml-1 lowercase cursor-pointer"
            >
                {expanded[post._id] ? "Show less" : "Show more"}
            </button>
        )}
    </p>
)}


{/* Media Display Logic */}
{/* Media Display Logic */}
{/* Media Display Logic */}
{(() => {
  const mediaItems = [...post.images, ...post.videos];
  const mediaCount = mediaItems.length;

  if (mediaCount === 0) return null;

  return (
    <div className="w-full mt-2">
      {/* ✅ 1 Media - Full Size */}
      {mediaCount === 1 && !isMobile && (
  <div className="w-full h-auto relative flex items-center justify-center">
  {/* ✅ Loader stays properly behind the media and prevents shifting */}
  {!mediaLoaded[`${post._id}-0`] && (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-300 animate-pulse rounded-lg">
      <span className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
    </div>
  )}

    {mediaItems[0].includes(".mp4") ? (
      <video
        controls
        className={`w-full rounded-lg transition-opacity duration-300 cursor-pointer ${
          mediaLoaded[`${post._id}-0`] ? "opacity-100" : "opacity-0"
        }`}
        onLoadedData={() => handleMediaLoad(post._id, 0)}
        onClick={() => handleOpenModal(mediaItems, mediaItems[0])}
      >
        <source src={mediaItems[0]} type="video/mp4" />
      </video>
    ) : (
      <img
        src={mediaItems[0]}
        alt="Post Media"
        className={`w-full rounded-lg transition-opacity duration-300 cursor-pointer ${
          mediaLoaded[`${post._id}-0`] ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => handleMediaLoad(post._id, 0)}
        onClick={() => handleOpenModal(mediaItems, mediaItems[0])}
      />
    )}
  </div>
)}




      {/* ✅ 2 Media - Side by Side Grid */}
      {mediaCount === 2 && !isMobile && (
        <div className="grid grid-cols-2 gap-2">
          {mediaItems.map((media, index) => (
            <div key={index} className="w-full relative">
              {!mediaLoaded[`${post._id}-${index}`] && <div className="absolute inset-0 w-full h-[250px] bg-gray-300 animate-pulse rounded-lg"></div>}
              {media.includes(".mp4") ? (
                <video
                  controls
                  className={`w-full rounded-lg transition-opacity duration-300 cursor-pointer ${
                    mediaLoaded[`${post._id}-${index}`] ? "opacity-100" : "opacity-0"
                  }`}
                  onLoadedData={() => handleMediaLoad(post._id, index)}
                  onClick={() => handleOpenModal(mediaItems, media)}
                >
                  <source src={media} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={media}
                  alt="Post Media"
                  className={`w-full rounded-lg transition-opacity duration-300 cursor-pointer ${
                    mediaLoaded[`${post._id}-${index}`] ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => handleMediaLoad(post._id, index)}
                  onClick={() => handleOpenModal(mediaItems, media)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ 3 Media - Large Top, Two Below */}
      {mediaCount === 3 && !isMobile && (
        <div className="grid grid-cols-1 gap-2">
          <div className="relative">
            {!mediaLoaded[`${post._id}-0`] && <div className="absolute inset-0 w-full h-[300px] bg-gray-300 animate-pulse rounded-lg"></div>}
            {mediaItems[0].includes(".mp4") ? (
              <video
                controls
                className="w-full h-[300px] rounded-lg object-cover cursor-pointer"
                onLoadedData={() => handleMediaLoad(post._id, 0)}
                onClick={() => handleOpenModal(mediaItems, mediaItems[0])}
              >
                <source src={mediaItems[0]} type="video/mp4" />
              </video>
            ) : (
              <img
                src={mediaItems[0]}
                className="w-full h-[300px] rounded-lg object-cover cursor-pointer"
                onLoad={() => handleMediaLoad(post._id, 0)}
                onClick={() => handleOpenModal(mediaItems, mediaItems[0])}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {mediaItems.slice(1).map((media, index) => (
              <div key={index + 1} className="relative">
                {!mediaLoaded[`${post._id}-${index + 1}`] && <div className="absolute inset-0 w-full h-[200px] bg-gray-300 animate-pulse rounded-lg"></div>}
                {media.includes(".mp4") ? (
                  <video
                    controls
                    className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
                    onLoadedData={() => handleMediaLoad(post._id, index + 1)}
                    onClick={() => handleOpenModal(mediaItems, media)}
                  >
                    <source src={media} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={media}
                    className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
                    onLoad={() => handleMediaLoad(post._id, index + 1)}
                    onClick={() => handleOpenModal(mediaItems, media)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ✅ 4+ Media - 2x2 Grid */}
{/* ✅ Exactly 4 Media - 2x2 Grid Layout */}
{mediaCount === 4 && !isMobile && (
  <div className="grid grid-cols-2 gap-2">
    {mediaItems.map((media, index) => (
      <div key={index} className="relative">
        {/* ✅ Proper Loader Handling */}
        {!mediaLoaded[`${post._id}-${index}`] && (
          <div className="absolute inset-0 w-full h-[200px] bg-gray-300 animate-pulse rounded-lg"></div>
        )}

        {/* ✅ Video Handling */}
        {media.includes(".mp4") ? (
          <video
            controls
            className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
            onLoadedData={() => handleMediaLoad(post._id, index)}
            onClick={() => handleOpenModal(mediaItems, media)}
          >
            <source src={media} type="video/mp4" />
          </video>
        ) : (
          /* ✅ Image Handling */
          <img
            src={media}
            className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
            onLoad={() => handleMediaLoad(post._id, index)}
            onClick={() => handleOpenModal(mediaItems, media)}
          />
        )}
      </div>
    ))}
  </div>
)}

{/* ✅ 5+ Media - Show 2x2 Grid, Last One Has Overlay */}
{mediaCount > 4 && !isMobile && (
  <div className="grid grid-cols-2 gap-2 relative">
    {/* ✅ Display First 3 Media Normally */}
    {mediaItems.slice(0, 3).map((media, index) => (
      <div key={index} className="relative">
        {!mediaLoaded[`${post._id}-${index}`] && (
          <div className="absolute inset-0 w-full h-[200px] bg-gray-300 animate-pulse rounded-lg"></div>
        )}

        {media.includes(".mp4") ? (
          <video
            controls
            className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
            onLoadedData={() => handleMediaLoad(post._id, index)}
            onClick={() => handleOpenModal(mediaItems, media)}
          >
            <source src={media} type="video/mp4" />
          </video>
        ) : (
          <img
            src={media}
            className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
            onLoad={() => handleMediaLoad(post._id, index)}
            onClick={() => handleOpenModal(mediaItems, media)}
          />
        )}
      </div>
    ))}

    {/* ✅ Last Media Item - Overlay Applied */}
    <div className="relative">
      {!mediaLoaded[`${post._id}-3`] && (
        <div className="absolute inset-0 w-full h-[200px] bg-gray-300 animate-pulse rounded-lg"></div>
      )}

      {mediaItems[3].includes(".mp4") ? (
        <video
          controls
          className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
          onLoadedData={() => handleMediaLoad(post._id, 3)}
          onClick={() => handleOpenModal(mediaItems, mediaItems[3])}
        >
          <source src={mediaItems[3]} type="video/mp4" />
        </video>
      ) : (
        <img
          src={mediaItems[3]}
          className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
          onLoad={() => handleMediaLoad(post._id, 3)}
          onClick={() => handleOpenModal(mediaItems, mediaItems[3])}
        />
      )}

      {/* ✅ Overlay for Additional Media */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg text-white/80 text-5xl cursor-pointer"
        onClick={() => handleOpenModal(mediaItems, mediaItems[3])}
      >
        +{mediaCount - 4}
      </div>
    </div>
  </div>
)}



{/* ✅ Mobile Logic - Show Normally If Only 1 Media, Else Use Carousel */}
{isMobile && mediaCount === 1 ? (
  <div className="w-full h-auto relative flex items-center justify-center">
  {/* ✅ Loader stays properly behind the media and prevents shifting */}
  {!mediaLoaded[`${post._id}-0`] && (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-300 animate-pulse rounded-lg">
      <span className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
    </div>
  )}


    {/* ✅ Video Handling */}
    {mediaItems[0].includes(".mp4") ? (
      <video
        controls
        className={`w-full h-auto rounded-lg object-contain transition-opacity duration-300 ${
          mediaLoaded[`${post._id}-0`] ? "opacity-100" : "opacity-0"
        }`}
        onLoadedData={() => handleMediaLoad(post._id, 0)}
      >
        <source src={mediaItems[0]} type="video/mp4" />
      </video>
    ) : (
      /* ✅ Image Handling */
      <img
        src={mediaItems[0]}
        alt="Post Media"
        className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 ${
          mediaLoaded[`${post._id}-0`] ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => handleMediaLoad(post._id, 0)}
      />
    )}
  </div>
) : isMobile && mediaCount > 1 ? (
  /* ✅ Mobile - Use Carousel for Multiple Media */
<Carousel className="w-full">
  <CarouselContent>
    {mediaItems.map((media, index) => (
      <CarouselItem key={index} className="relative rounded-lg bg-gray-200 w-full h-auto flex items-center justify-center overflow-hidden">
        {/* ✅ Loader stays properly behind the media and prevents shifting */}
        {!mediaLoaded[`${post._id}-${index}`] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-300 animate-pulse rounded-lg">
            <span className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
          </div>
        )}
        {mediaLoaded[`${post._id}-${index}`] && (
<>
<CarouselPrevious className="absolute left-15 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-tr from-[#ff2942a1] to-[#ff078fa1] border-none text-white p-2 rounded-full" />
      <CarouselNext className="absolute right-10 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-tr from-[#ff2942a1] to-[#ff078fa1] border-none text-white p-2 rounded-full" />
</>
        )}
        {/* ✅ Video Handling */}
        {media.includes(".mp4") ? (
          <video
            controls
            className={`w-full h-auto rounded-lg object-contain transition-opacity duration-300 ${
              mediaLoaded[`${post._id}-${index}`] ? "opacity-100" : "opacity-0"
            }`}
            onLoadedData={() => handleMediaLoad(post._id, index)}
          >
            <source src={media} type="video/mp4" />
          </video>
        ) : (
          /* ✅ Image Handling */
          <img
            src={media}
            alt="Post Media"
            className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
              mediaLoaded[`${post._id}-${index}`] ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => handleMediaLoad(post._id, index)}
          />
        )}
      </CarouselItem>
    ))}
  </CarouselContent>

  {/* ✅ Navigation only appears when ALL media are loaded */}
</Carousel>

) : null}


<GeneralMediaModal
  selectedMedia={selectedMedia}
  selectedPostMedia={selectedPostMedia} // ✅ Only pass media from the clicked post
  onClose={handleCloseModal}
  onSelectMedia={setSelectedMedia}
/>


    </div>
  );
})()}







                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 justify-between">
                  <FetchRelatedLikes postId={post._id}/>
<div className="flex items-center gap-1">
{post.comments.length > 0 ? 
                   <p className="flex items-center gap-1 text-xs cursor-pointer hover:text-[#ff5757ae] transition-all duration-150" onClick={() => setShowComments(showComments === post._id ? null : post._id)}>
                     <span className="flex items-center gap-0.5">{post.comments.length}<span>{post.comments.length > 1 ? "Comments" : "Comment"}</span></span>
                    </p>
                    : null}
                    <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                    <button className="flex items-center gap-1 text-xs">
                      <span>{post.shares} Reposts</span>
                    </button>
</div>
                  </div>
                  <Separator className="bg-gray-200 my-1"/>
                  <div className="flex items-center justify-between px-2 py-1 text-sm text-gray-500 gap-2">
                  <LikeFunctionality postId={post._id} initialLikes={post.likes} />
                  <p className="text-gray-200">|</p>
                  <button className="w-full flex  flex-col md:flex-row  justify-center items-center gap-1 cursor-pointer hover:bg-gray-100 transition-all duration-150 px-3 py-1.5 rounded-full" onClick={() => setShowComments(showComments === post._id ? null : post._id)}>
                    <MessageSquareHeart className=" h-4 w-4"/>
                     <span className="hidden md:flex ">Comment</span>
                    </button>
                    <p className="text-gray-200">|</p>
                    <button className="w-full flex  flex-col md:flex-row  justify-center items-center gap-1 cursor-pointer hover:bg-gray-100 transition-all duration-150 px-3 py-1.5 rounded-full">
                      <Forward className=" h-4 w-4" />
                     <span className="hidden md:flex ">Repost</span>
                    </button>
                    <p className="text-gray-200">|</p>
                    <button className="w-full flex  flex-col md:flex-row  justify-center items-center gap-1 cursor-pointer hover:bg-gray-100 transition-all duration-150 px-3 py-1.5 rounded-full">
                      <MessageSquareShare className=" h-3.5 w-3.5" />
                     <span className="hidden md:flex ">Share</span>
                    </button>
                  </div>
                  {showComments === post._id && (
                            <CommentFunctionality
                                postId={post._id}
                                commentCount={post.comments.length}
                                postOwner={post.postOwner}
                                commentsFetched={commentsFetched}
                                setCommentsFetched={setCommentsFetched}
                                setShowComments={setShowComments}
                                postUID={post?.postUID}
                            />
                        )}
                </div>
              </div>
                </>
            ))}
                {loadingPosts &&
<>

<div className="mb-4 border-0 shadow-none bg-[#fff] rounded-2xl p-4 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                    <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
                    <div>
                        <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded-md mt-1"></div>
                    </div>
                </div>
            </div>
            <div className="mt-3 h-3 w-full bg-gray-200 rounded-md"></div>
            <div className="mt-4 h-[300px] bg-gray-300 rounded-lg"></div>
            <div className="flex items-center gap-2 mt-3">
                        <div className="h-3 w-10 bg-gray-200 rounded-md"></div>
                        <div className="h-3 w-10 bg-gray-200 rounded-md"></div>
                        <div className="h-3 w-10 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-4">
                    <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
                        <div className="h-7 w-full bg-gray-300 rounded-md"></div>
                </div>
        </div>
        <div className="w-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-500"/></div>
</>
    }

            {!hasMore && <p className="text-center mt-4 text-xs bg-gradient-to-r from-[#ff078e] to-[#ff2941] bg-clip-text text-transparent px-4">This is the end, no more new posts available, maybe try refreshing the page!</p>}
          </div>
        );
      }