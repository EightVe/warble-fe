import  { useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useLocation, useParams } from "react-router-dom";
import { Forward, MapPin, MessageSquareHeart, MessageSquareShare, MessageSquareText, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ThreeDotsAction from "@/(Protected)/Feed/functions/ThreeDotsAction";
import errorRobot from '@/assets/img/404.png'
import PostCardHover from "@/(Protected)/Feed/functions/PostCardHover";
import FollowFunctionality from "@/(Protected)/Feed/functions/Follow_Message/FollowFunctionality";
import LikeFunctionality from "@/(Protected)/Feed/functions/LikeFunctionality";
import FetchRelatedLikes from "@/(Protected)/Feed/functions/FetchRelatedLikes";
import SinglePostCommentsFetch from "./SinglePostCommentsFetch";
import { useMediaQuery } from "react-responsive";
import MediaModal from "@/(Protected)/Feed/functions/images/MediaModal";
import { useSocket } from "@/contexts/SocketContext";
import { Separator } from "@radix-ui/react-dropdown-menu";
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
  postOwner: PostOwner;
  content: string;
  images: string[];
  videos: string[];
  likes: number;
  comments: string[];
  shares: number;
  locationCity?: string;
  locationCountry?: string;
  postUID: string;
  commentCount:number;
}

// Define API response type
interface ApiResponse {
  success: boolean;
  post: Post;
}
export default function FetchSinglePost() {
  const { postUID } = useParams<{ postUID: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [mediaLoaded, setMediaLoaded] = useState<boolean[]>([])
  const [loading, setLoading] = useState(true);
          const [commentsFetched, setCommentsFetched] = useState<{ [key: string]: boolean }>({});
          const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
          const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
            const { socket} = useSocket();
            useEffect(() => {
              if (!socket) return;
            
              const handleNewCommentOrReply = (data: { postId: string; commentsCount: number }) => {
                if (data.postId !== post?._id) return;
            
                // ✅ Update the post state to reflect the new comment count
                setPost((prev) => prev ? { ...prev, commentCount: data.commentsCount } : prev);
              };
            
              const handleCommentDeleted = (data: { postId: string; commentsCount: number }) => {
                if (data.postId !== post?._id) return;
            
                // ✅ Update the comment count when a comment is deleted
                setPost((prev) => prev ? { ...prev, commentCount: data.commentsCount } : prev);
              };
            
              const handleReplyDeleted = (data: { postId: string; commentsCount: number }) => {
                if (data.postId !== post?._id) return;
            
                // ✅ Update the comment count when a reply is deleted
                setPost((prev) => prev ? { ...prev, commentCount: data.commentsCount } : prev);
              };
            
              // ✅ Listen for events
              socket.on("newComment", handleNewCommentOrReply);
              socket.on("newReply", handleNewCommentOrReply);
              socket.on("commentDeleted", handleCommentDeleted);
              socket.on("replyDeleted", handleReplyDeleted);
            
              return () => {
                socket.off("newComment", handleNewCommentOrReply);
                socket.off("newReply", handleNewCommentOrReply);
                socket.off("commentDeleted", handleCommentDeleted);
                socket.off("replyDeleted", handleReplyDeleted);
              };
            }, [socket, post]);
            
          
    useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse>(`/post/get-single-post/${postUID}`);
        if (response.data.success) {
          setPost(response.data.post);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postUID]);
  const handleMediaLoad = (index: number) => {
    setMediaLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };
  if (loading) {
    return (
<div className="mb-4 border-0 shadow-none bg-[#fff] rounded-2xl p-4 animate-pulse mt-4">
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
    );
  }
  if (!post) {return (
    <div className="min-h-screen flex flex-col">
          <main className="flex-1 bg-[#ececec] p-4 pb-20 xl:pb-4">
            <div className="mt-4 w-full flex items-center justify-center">
                                  <div className="mt-6 space-y-4 px-4 sm:px-6 flex items-center justify-center p-2 rounded-2xl flex-col">
               <img src={errorRobot} alt="" className='h-52'/>
               <p className='text-sm text-gray-600 tracking-tight text-center'>It seems the post you are looking for is unavailable or has been deleted.</p>
              </div>
                </div>
          </main>
      </div>
  )}
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
  const mediaItems = [...post.images, ...post.videos];
  const mediaCount = mediaItems.length;
  const handleOpenModal = (mediaUrl: string) => {
    setSelectedMedia(mediaUrl);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  return (
    <div className="w-full flex items-center justify-center flex-col py-4">
      <Card className="border-0 shadow-none bg-[#fff] w-full md:max-w-2xl rounded-2xl">
        <div className="p-4">
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

          <p className="mt-3 text-sm text-gray-600">{post?.content}</p>


          <div className="w-full mt-2">
      {/* ✅ 1 Media - Full Size */}
      {mediaCount === 1 && !isMobile && (
  <div className="w-full h-auto relative flex items-center justify-center">
  {/* ✅ Loader stays properly behind the media and prevents shifting */}
  {!mediaLoaded[0] && (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-300 animate-pulse rounded-lg">
      <span className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
    </div>
  )}
    {mediaItems[0].includes(".mp4") ? (
      <video
        controls
        className={`w-full rounded-lg object-cover transition-opacity duration-300 ${
          mediaLoaded[0] ? "opacity-100" : "opacity-0"
        }`}
        onLoadedData={() => setTimeout(() => handleMediaLoad(0), 300)}
        onClick={() => handleOpenModal(mediaItems[0])}
      >
        <source src={mediaItems[0]} type="video/mp4" />
      </video>
    ) : (
      <img
        src={mediaItems[0]}
        alt="Post Media"
        className={`w-full rounded-lg object-cover transition-opacity duration-300 ${
          mediaLoaded[0] ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setTimeout(() => handleMediaLoad(0), 300)}
        onClick={() => handleOpenModal(mediaItems[0])}
      />
    )}
  </div>
)}








      {/* ✅ 2 Media - Side by Side Grid */}
      {mediaCount === 2 && !isMobile &&(
        <div className="grid grid-cols-2 gap-2">
          {mediaItems.map((media, index) => (
            <div key={index} className="w-full relative">
              {!mediaLoaded[index] && <div className="absolute inset-0 w-full h-[250px] bg-gray-300 animate-pulse rounded-lg"></div>}
              {media.includes(".mp4") ? (
                <video
                  controls
                  className={`w-full rounded-lg transition-opacity duration-300 cursor-pointer${
                    mediaLoaded[index] ? "opacity-100" : "opacity-0"
                  }`}
                  onLoadedData={() => handleMediaLoad(index)}
                  onClick={() => handleOpenModal(mediaItems[index])}
                >
                  <source src={media} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={media}
                  alt="Post Media"
                  className={`w-full rounded-lg transition-opacity duration-300 cursor-pointer${
                    mediaLoaded[index] ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => handleMediaLoad(index)}
                  onClick={() => handleOpenModal(mediaItems[index])}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ 3-4 Media Grid */}
      {mediaCount === 3 && !isMobile &&(
  <div className="grid grid-cols-1 gap-2">
    {/* ✅ First Media - Full Width (Image or Video) */}
    <div className="relative">
      {!mediaLoaded[0] && <div className="absolute inset-0 w-full h-[300px] bg-gray-300 animate-pulse rounded-lg"></div>}
      
      {mediaItems[0].includes(".mp4") ? (
        <video
          controls
          className="w-full h-[300px] rounded-lg object-cover cursor-pointer"
          onLoadedData={() => handleMediaLoad(0)}
          onClick={() => handleOpenModal(mediaItems[0])}
        >
          <source src={mediaItems[0]} type="video/mp4" />
        </video>
      ) : (
        <img
          src={mediaItems[0]}
          className="w-full h-[300px] rounded-lg object-cover cursor-pointer"
          onLoad={() => handleMediaLoad(0)}
          onClick={() => handleOpenModal(mediaItems[0])}
        />
      )}
    </div>

    {/* ✅ Bottom Two Media - Side by Side (Image or Video) */}
    <div className="grid grid-cols-2 gap-2">
      {mediaItems.slice(1).map((media, index) => (
        <div key={index + 1} className="relative">
          {!mediaLoaded[index + 1] && <div className="absolute inset-0 w-full h-[200px] bg-gray-300 animate-pulse rounded-lg"></div>}
          
          {media.includes(".mp4") ? (
            <video
              controls
              className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
              onLoadedData={() => handleMediaLoad(index + 1)}
              onClick={() => handleOpenModal(mediaItems[index + 1])}
            >
              <source src={media} type="video/mp4" />
            </video>
          ) : (
            <img
              src={media}
              className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
              onLoad={() => handleMediaLoad(index + 1)}
              onClick={() => handleOpenModal(mediaItems[index + 1])}
            />
          )}
        </div>
      ))}
    </div>
  </div>
)}










{mediaCount === 4 && !isMobile &&(
  <div className="grid grid-cols-2 gap-2">
    {mediaItems.map((media, index) => (
      <div key={index} className="relative">
        {!mediaLoaded[index] && <div className="absolute inset-0 w-full h-[200px] bg-gray-300 animate-pulse rounded-lg"></div>}
        {media.includes(".mp4") ? (
          <video
            controls
            className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
            onLoadedData={() => handleMediaLoad(index)}
            onClick={() => handleOpenModal(mediaItems[index])}
          >
            <source src={media} type="video/mp4" />
          </video>
        ) : (
          <img
            src={media}
            className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
            onLoad={() => handleMediaLoad(index)}
            onClick={() => handleOpenModal(mediaItems[index])}
          />
        )}
      </div>
    ))}
  </div>
)}

{/* ✅ 5+ Media - Show 2x2 Grid, Last One Has Overlay */}
{mediaCount > 4 && !isMobile &&(
  <div className="grid grid-cols-2 gap-2 relative">
    {mediaItems.slice(0, 3).map((media, index) => (
      <div key={index} className="relative">
        {!mediaLoaded[index] && <div className="absolute inset-0 w-full h-[200px] bg-gray-300 animate-pulse rounded-lg"></div>}
        
        {media.includes(".mp4") ? (
          <video
            controls
            className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
            onLoadedData={() => handleMediaLoad(index)}
            onClick={() => handleOpenModal(mediaItems[index])}
          >
            <source src={media} type="video/mp4" />
          </video>
        ) : (
          <img
            src={media}
            className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
            onLoad={() => handleMediaLoad(index)}
            onClick={() => handleOpenModal(mediaItems[index])}
          />
        )}
      </div>
    ))}

    {/* ✅ Last Image/Video - Overlay Applied Here */}
    <div className="relative">
      {!mediaLoaded[3] && <div className="absolute inset-0 w-full h-[200px] bg-gray-300 animate-pulse rounded-lg"></div>}
      
      {mediaItems[3].includes(".mp4") ? (
        <video
          controls
          className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
          onLoadedData={() => handleMediaLoad(3)}
          onClick={() => handleOpenModal(mediaItems[3])}
        >
          <source src={mediaItems[3]} type="video/mp4" />
        </video>
      ) : (
        <img
          src={mediaItems[3]}
          className="w-full h-[200px] rounded-lg object-cover cursor-pointer"
          onLoad={() => handleMediaLoad(3)}
          onClick={() => handleOpenModal(mediaItems[3])}
        />
      )}

      {/* ✅ Overlay only on last media */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg text-white/80 text-5xl cursor-pointer"
        onClick={() => handleOpenModal(mediaItems[3])}
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
  {!mediaLoaded[0] && (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-300 animate-pulse rounded-lg">
      <span className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
    </div>
  )}

    {/* ✅ Video Handling */}
    {mediaItems[0].includes(".mp4") ? (
      <video
        controls
        className={`w-full h-auto rounded-lg object-contain transition-opacity duration-300 ${
          mediaLoaded[0] ? "opacity-100" : "opacity-0"
        }`}
        onLoadedData={() => handleMediaLoad(0)}
      >
        <source src={mediaItems[0]} type="video/mp4" />
      </video>
    ) : (
      /* ✅ Image Handling */
      <img
        src={mediaItems[0]}
        alt="Post Media"
        className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 ${
          mediaLoaded[0] ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => handleMediaLoad(0)}
      />
    )}
  </div>
) : isMobile && mediaCount > 1 ? (
  /* ✅ Mobile - Use Carousel for Multiple Media */
<Carousel className="w-full">
  <CarouselContent>
    {mediaItems.map((media, index) => (
      <CarouselItem
        key={index}
        className="relative rounded-lg bg-gray-200 w-full h-auto flex items-center justify-center overflow-hidden"
      >
          {mediaLoaded[index] && 
  <>
  <CarouselPrevious className="absolute left-15 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-tr from-[#ff2942a1] to-[#ff078fa1] border-none text-white p-2 rounded-full" />
  <CarouselNext className="absolute right-10 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-tr from-[#ff2942a1] to-[#ff078fa1] border-none text-white p-2 rounded-full" />
  </>
 }
        {!mediaLoaded[index] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-300 rounded-lg transition-opacity duration-300">
            <span className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
          </div>
        )}
        {media.includes(".mp4") ? (
          <video
            controls
            className={`w-full h-auto rounded-lg object-contain transition-opacity duration-500 ${
              mediaLoaded[index] ? "opacity-100" : "opacity-0"
            }`}
            onLoadedData={() => setMediaLoaded((prev) => ({ ...prev, [index]: true }))}
          >
            <source src={media} type="video/mp4" />
          </video>
        ) : (
          /* ✅ Image Handling */
          <img
            src={media}
            alt="Post Media"
            className={`w-full h-auto object-cover rounded-lg transition-opacity duration-500 ${
              mediaLoaded[index] ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setMediaLoaded((prev) => ({ ...prev, [index]: true }))}
          />
        )}
      </CarouselItem>
    ))}
  </CarouselContent>

  {/* ✅ Navigation ALWAYS visible */}

</Carousel>

) : null}

<MediaModal
        selectedMedia={selectedMedia}
        mediaItems={mediaItems}
        onClose={handleCloseModal}
        onSelectMedia={setSelectedMedia}
      />
    </div>
    
    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 justify-between">
                  <FetchRelatedLikes postId={post._id}/>
<div className="flex items-center gap-1">
{post.commentCount > 0 ? 
<>

                   <p className="flex items-center gap-1 text-xs">
                     <span className="flex items-center gap-0.5">{post.commentCount}<span>{post.commentCount > 1 ? "Comments" : "Comment"}</span></span>
                    </p>
                  
                    </>
                    : null}
                 {post.shares > 0 &&  <div className="h-1 w-1 rounded-full bg-gray-400"></div>}
                    {post.shares > 0 && 
                    <button className="flex items-center gap-1 text-xs">
                      <span>{post.shares} Reposts</span>
                    </button>
                    }
</div>
                  </div>
                  <Separator className="bg-gray-100 my-1 h-[1px]"/>
                  <div className="flex items-center justify-between px-2 py-1 text-sm text-gray-500 gap-2">
                  <LikeFunctionality postId={post._id} initialLikes={post.likes} />
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

                            <SinglePostCommentsFetch postId={post._id}
                                postOwner={post.postOwner}
                                commentsFetched={commentsFetched}
                                setCommentsFetched={setCommentsFetched} 
                                postUID={postUID}/>
        </div>
      </Card>
    </div>
  );
}
