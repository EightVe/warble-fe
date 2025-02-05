import  { useState, ChangeEvent, useContext, useEffect } from "react";
import { ArrowLeft,  Eye, ImageIcon,  Loader2, MapPin, Trash2, VideoIcon, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Country, City } from "country-state-city";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { AuthContext } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { uploadImageToFirebase } from "@/lib/firebaseUtils";
import { Separator } from "@radix-ui/react-separator";
import { AnimatePresence, motion } from "framer-motion";
import { useCircleAnimation } from "@/components/ui/useCircleAnimation";
export default function CreatePost() {
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const countries = Country.getAllCountries();
    const [isVisible, setIsVisible] = useState(false);
    const [viewAttachments, setViewAttachments] = useState(false);
    const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedCity(""); // Reset city when country changes
    };
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);
    const cities = selectedCountry
        ? City.getCitiesOfCountry(selectedCountry)
        : [];

    const [images, setImages] = useState<string[]>([]);
    const [videos, setVideos] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const totalMedia = images.length + videos.length;
    const [location, setLocation] = useState({ city: "", country: "" });
    const [showLocationInput, setShowLocationInput] = useState(false);
    const { triggerAnimation, AnimationComponent } = useCircleAnimation();
    const [postContent, setPostContent] = useState("");
    const { user } = useContext(AuthContext) || {};

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of Array.from(files)) {
                const url = await uploadImageToFirebase(file, setProgress, setUploading);
                uploadedUrls.push(url);
            }
            setImages((prev) => [...prev, ...uploadedUrls]);
            triggerAnimation("success", "Upload successful.");
        } catch (error) {
            triggerAnimation("error", "An error accured.");
            console.error("Image upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of Array.from(files)) {
                const url = await uploadImageToFirebase(file, setProgress, setUploading);
                uploadedUrls.push(url);
            }
            setVideos((prev) => [...prev, ...uploadedUrls]);
            triggerAnimation("success", "Upload successful.");
        } catch (error) {
            triggerAnimation("error", "An error accured.");
            console.error("Video upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const handlePost = async () => {
        if (!postContent.trim() && images.length === 0 && videos.length === 0) {
            triggerAnimation("error", "Your post must have a text, an image or a video.");
            return;
        }
        const countryName = countries.find(
            (country) => country.isoCode === selectedCountry
        )?.name;
        const postData = {
            postOwner: user?._id,
            isImageAttached: images.length > 0,
            images,
            videos,
            locationCity: selectedCity,
            locationCountry: countryName || "",
            content: postContent,
        };
        setSubmitting(true)
        try {
            const response = await axiosInstance.post("/post/create", postData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
            });

            if (response.status === 200 || response.status === 201) {
                setImages([]);
                setVideos([]);
                setLocation({ city: "", country: "" });
                setPostContent("");
                setShowLocationInput(false);
                setSubmitting(false);
                setIsVisible(false)
                setViewAttachments(false)
                triggerAnimation("success", "Your post is now public! 🎉");
            } else {
                console.log("Post data:", postData);
                setSubmitting(false);
                triggerAnimation("error", "An error accured.");
            }
        } catch (error) {
            triggerAnimation("error", "An error accured.");
            console.error(error);
            setSubmitting(false);
        }
    };

    return (
<>
{AnimationComponent}
{isVisible && (
    <AnimatePresence>
<motion.div 
              initial={{ opacity: 0 }} // Starts slightly below and transparent
              animate={{ opacity: 1 }} // Fades in and moves up
              exit={{ opacity: 0}} // Fades out and moves down
              transition={{ duration: 0.2, ease: "easeIn" }} // Smooth transition
    className="h-screen w-full fixed top-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center">
        {viewAttachments ? (
            <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-4 p-4 border border-gray-400 shadow-none bg-[#fff] w-full md:max-w-2xl mx-4 rounded-2xl pt-6 pb-4 relative py-10 overflow-y-auto"
    >
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-600 cursor-pointer hover:bg-[#eaecef] p-2 rounded-full transition-all duration-150 flex items-center gap-1 text-sm"
        onClick={() => setViewAttachments(false)}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Media Count Display */}
      <p className="text-gray-600 text-sm mb-4">
        {images.length} {images.length === 1 ? "Image" : "Images"} &middot; {videos.length} {videos.length === 1 ? "Video" : "Videos"}
      </p>

      {/* Render Media */}
      <div className="flex flex-col gap-2">
        {totalMedia <= 4 && !isMobile ? (
          // Grid Layout for Desktop (1-4 Media)
          <div
            className={`grid gap-2 ${
              totalMedia === 1 ? "grid-cols-1" : totalMedia === 2 ? "grid-cols-2" : totalMedia === 3 ? "grid-cols-3" : totalMedia === 1 ? "h-[420px]"  : "grid-cols-4"
            }`}
          >
            {[...images, ...videos].map((media, index) => (
                <div className={`relative ${totalMedia === 1 ? "h-[250px] md:h-[350px]" : ""}`}>
                {media.includes("mp4") || media.includes("webm") ? (
                  <video controls className="rounded-lg w-full h-auto object-cover bg-black/5">
                    <source src={media} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="relative w-full aspect-square bg-black/5">
                    <img src={media} alt={`Uploaded ${index + 1}`} className="absolute inset-0 w-full h-full object-contain rounded-lg" />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-gradient-to-tr from-[#ff2941ad] to-[#ff078fad] font-normal text-white text-[13px]"
                  onClick={() =>
                    media.includes("mp4") || media.includes("webm")
                      ? setVideos((prev) => prev.filter((_, i) => i !== index - images.length))
                      : setImages((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          // Carousel for More than 4 Items or Mobile View
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {[...images, ...videos].map((media, index) => (
                  <CarouselItem key={index} className="w-full">
                    <div className="relative h-[300px] md:h-[400px] lg:h-[450px]">
                      {media.includes("mp4") || media.includes("webm") ? (
                        <video controls className="rounded-lg w-full h-full object-cover bg-black/5">
                          <source src={media} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="relative w-full h-full bg-black/5">
                          <img
                            src={media}
                            alt={`Uploaded ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-gradient-to-tr from-[#ff2941ad] to-[#ff078fad] font-normal text-white text-[13px] rounded-full px-2.5"
                        onClick={() =>
                          media.includes("mp4") || media.includes("webm")
                            ? setVideos((prev) => prev.filter((_, i) => i !== index - images.length))
                            : setImages((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-2">
                      {index + 1}/{totalMedia}
                    </p>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Fix: Carousel Navigation Buttons */}
              <CarouselPrevious className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-tr from-[#ff2942a1] to-[#ff078fa1] border-none text-white p-2 rounded-full" />
              <CarouselNext className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-tr from-[#ff2942a1] to-[#ff078fa1] border-none text-white p-2 rounded-full" />
            </Carousel>
          </div>
        )}
      </div>
    </motion.div>
      )  : 
<motion.div
          initial={{ opacity: 0, y: 20 }} // Starts slightly below and transparent
          animate={{ opacity: 1, y: 0 }} // Fades in and moves up
          exit={{ opacity: 0, y: 20 }} // Fades out and moves down
          transition={{ duration: 0.4, ease: "easeOut" }} // Smooth transition
className="mb-4 p-4 border-1 border-gray-400 shadow-none bg-[#fff] w-full md:max-w-2xl mx-4 rounded-2xl pt-6 pb-0 relative">
    <button className="absolute top-4 right-4 text-gray-600 cursor-pointer hover:bg-[#eaecef] p-2 rounded-full transition-all duration-150"  disabled={uploading || submitting}                   onClick={() => setIsVisible(false)}>
        <X className="h-5 w-5"/>
    </button>
            <div className="flex gap-1.5">
                <Avatar>
                    <AvatarImage src={user?.avatar} alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <textarea
                        placeholder="What's on your mind?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full rounded-lg h-20 border-0 bg-transparent p-2 focus:outline-none text-sm text-gray-600 resize-none"
                    />
                      <div className="flex items-center justify-end">
                      {(images.length > 0 || videos.length > 0) && (  <div>
                      <Button
                          className="ml-auto whitespace-nowrap bg-[#f0f1f3] h-8 font-normal text-gray-700 text-[13px] flex items-center gap-1"
                          size="sm"
                          onClick={() => setViewAttachments(true)}
                          disabled={uploading || submitting}
                      >
                          {uploading || submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4"/> } View Attachments
                      </Button>
                        </div>          )}
                      <Button
                            className="ml-auto whitespace-nowrap bg-gradient-to-tr from-[#ff2941] to-[#ff078e] h-8 font-normal text-white text-[13px]"
                            size="sm"
                            onClick={handlePost}
                            disabled={uploading || submitting}
                        >
                            {uploading || submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null }Share Post
                        </Button>
                      </div>
                     <Separator className="w-full bg-[#e7e9ed] h-[1.5px] rounded-full mt-3"/>
                        <div className="flex items-center py-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 whitespace-nowrap rounded-full flex items-center gap-1.5 font-medium"
                            onClick={() => document.getElementById("imageUpload")?.click()}
                            disabled={uploading || submitting}
                        >
                            <ImageIcon className=" h-4 w-4 text-[#1e7467]" />
                            Image
                        </Button>
                        <input
                            id="imageUpload"
                            type="file"
                            multiple
                            accept="image/*"
                            hidden
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 whitespace-nowrap rounded-full flex items-center gap-1.5 font-medium"
                            onClick={() => document.getElementById("videoUpload")?.click()}
                            disabled={uploading || submitting}
                        >
                            <VideoIcon className="h-4 w-4 text-[#938919]" />
                            Video
                        </Button>
                        <input
                            id="videoUpload"
                            type="file"
                            multiple
                            accept="video/*"
                            hidden
                            onChange={handleVideoUpload}
                            disabled={uploading}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 whitespace-nowrap rounded-full flex items-center gap-1.5 font-medium"
                            disabled={uploading || submitting}
                            onClick={() => setShowLocationInput((prev) => !prev)}
                        >
                            <MapPin className=" h-4 w-4 text-[#ff5757]" />
                            Location
                        </Button>
                    </div>
                    {showLocationInput && (
                        <>
                                                 <Separator className="w-full bg-[#e7e9ed] h-[1px] rounded-full"/>
                        <div className="flex gap-2 py-2">
                            {/* Country Dropdown */}
                            <select
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className="border p-2 rounded-md text-sm bg-[#f5f6f8] border-[#e7e9ed] focus:outline-0 text-gray-600 w-full lg:w-1/4"
                            >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>

                            {/* City Dropdown */}
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="border p-2 rounded-md text-sm bg-[#f5f6f8] border-[#e7e9ed] focus:outline-0 text-gray-600 w-full lg:w-1/4"
                                disabled={!selectedCountry}
                            >
                                <option value="">Select City</option>
                                {cities?.map((city) => (
                                    <option key={city.name} value={city.name}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
        }
</motion.div>
</AnimatePresence>
)}
<div className="mb-4 p-4 border-0 shadow-none bg-[#fff] cursor-pointer w-full rounded-2xl" onClick={() => setIsVisible(true)}>
            <div className="flex gap-3">
                <Avatar>
                    <AvatarImage src={user?.avatar} alt="User" />
                    <AvatarFallback className="bg-[#e5dfdf]"></AvatarFallback>
                </Avatar>
                <div className="flex-1 w-full rounded-lg border-0 bg-transparent p-2 focus:outline-none text-sm text-gray-500 max-h-32 cursor-pointer">
                    What's on your mind?
                </div>
            </div>
        </div>
</>
    );
}
