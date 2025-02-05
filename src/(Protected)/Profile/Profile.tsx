import axiosInstance from '@/lib/axiosInstance';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Feed/components/header';
import LeftSidebar from '../Feed/components/left-sidebar';
import RightSidebar from '../Feed/components/right-sidebar';
import MobileNavigation from '../Feed/components/mobile-navigation';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { UserPlus,MessageSquare} from "lucide-react"
import errorRobot from '@/assets/img/404.png'
import ProfileNavigation from './components/ProfileNavigation';
import GetUserProfilePosts from '../Feed/functions/GetUserProfilePosts';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await axiosInstance.get(`/user/user-id?username=${username}`);
        setUserData(response.data);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          setError(true);
        } else {
          console.error('Error fetching user data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);


  if (loading) {
    return (
<div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <main className="flex-1 bg-[#ececec] p-4 pb-20 xl:pb-4">
            <div className="mx-auto">
              {/* Skeleton Cover Photo */}
              <div className="relative h-32 sm:h-48 md:h-64 bg-gray-300 animate-pulse rounded-tl-4xl rounded-tr-4xl border-0" />
  
              {/* Skeleton Profile Info */}
              <div className="relative px-4 py-5 sm:px-6 -mt-16">
                <div className="flex flex-col sm:flex-row sm:items-end">
                  {/* Skeleton Avatar */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 animate-pulse rounded-full border-4 border-[#ececec]" />
                  <div className="mt-4 sm:mt-0 sm:ml-4 sm:mb-4 flex-1">
                    {/* Skeleton Name */}
                    <div className="h-6 w-36 bg-gray-300 animate-pulse rounded-md mb-2" />
                    {/* Skeleton Username */}
                    <div className="h-4 w-24 bg-gray-300 animate-pulse rounded-md" />
                  </div>
                  <div className="mt-4 sm:mt-0 sm:mb-4 flex space-x-2">
                    {/* Skeleton Buttons */}
                    <div className="w-20 h-8 bg-gray-300 animate-pulse rounded-md" />
                    <div className="w-20 h-8 bg-gray-300 animate-pulse rounded-md" />
                  </div>
                </div>
                {/* Skeleton User Stats */}
                <div className="mt-4 flex justify-between max-w-xs">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="text-center">
                      <div className="h-4 w-12 bg-gray-300 animate-pulse rounded-md mb-1 mx-auto" />
                      <div className="h-3 w-16 bg-gray-300 animate-pulse rounded-md mx-auto" />
                    </div>
                  ))}
                </div>
                {/* Skeleton Bio */}
                <div className="mt-2">
                  <div className="h-4 w-full max-w-md bg-gray-300 animate-pulse rounded-md mb-2" />
                  <div className="h-4 w-2/3 bg-gray-300 animate-pulse rounded-md" />
                </div>
                
              </div>

            </div>
            <div className="mt-4 w-full flex items-center justify-center flex-col">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="w-full ">
                      <div className="h-[220px] w-full lg:w-[620px] bg-gray-300 animate-pulse rounded-md mb-1 mx-auto" />
                    </div>
                  ))}
                </div>
          </main>
          <RightSidebar />
        </div>
        <MobileNavigation />
      </div>
    );
  }



  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <main className="flex-1 bg-[#ececec] p-4 pb-20 xl:pb-4">
            <div className="mx-auto">
              {/* Skeleton Cover Photo */}
              <div className="relative h-32 sm:h-48 md:h-64 bg-gray-300 animate-pulse rounded-tl-4xl rounded-tr-4xl border-0" />
  
              {/* Skeleton Profile Info */}
              <div className="relative px-4 py-5 sm:px-6 -mt-16">
                <div className="flex flex-col sm:flex-row sm:items-end">
                  {/* Skeleton Avatar */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 animate-pulse rounded-full border-4 border-[#ececec]" />
                  <div className="mt-4 sm:mt-0 sm:ml-4 sm:mb-4 flex-1">
                    {/* Skeleton Name */}
                    <div className="h-6 w-36 bg-gray-300 animate-pulse rounded-md mb-2" />
                    {/* Skeleton Username */}
                    <div className="h-4 w-24 bg-gray-300 animate-pulse rounded-md" />
                  </div>
                  <div className="mt-4 sm:mt-0 sm:mb-4 flex space-x-2">
                    {/* Skeleton Buttons */}
                    <div className="w-20 h-8 bg-gray-300 animate-pulse rounded-md" />
                    <div className="w-20 h-8 bg-gray-300 animate-pulse rounded-md" />
                  </div>
                </div>
                <div className="mt-6 space-y-4 px-4 sm:px-6 flex items-center justify-center bg-[#ff575747] p-2 rounded-2xl flex-col">
               <img src={errorRobot} alt="" className='h-52'/>
               <p className='text-sm text-gray-800 tracking-tight text-center'>It seems the profile you are looking for is unavailable or has been deleted.</p>
              </div>
                {/* Skeleton User Stats */}
                {/* <div className="mt-4 flex justify-between max-w-xs">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="text-center">
                      <div className="h-4 w-12 bg-gray-300 animate-pulse rounded-md mb-1 mx-auto" />
                      <div className="h-3 w-16 bg-gray-300 animate-pulse rounded-md mx-auto" />
                    </div>
                  ))}
                </div> */}
  
                {/* Skeleton Bio */}
                {/* <div className="mt-2">
                  <div className="h-4 w-full max-w-md bg-gray-300 animate-pulse rounded-md mb-2" />
                  <div className="h-4 w-2/3 bg-gray-300 animate-pulse rounded-md" />
                </div> */}
              </div>

            </div>
          </main>
          <RightSidebar />
        </div>
        <MobileNavigation />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      <Header />
      <div className="flex overflow-hidden xl:justify-center md:justify-center 2xl:justify-between">
        <LeftSidebar />
        <main className="flex-1 bg-[#ededed] p-4 pb-20 xl:pb-4">
        <div className="mx-auto">
      {/* Cover Photo */}
      <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-tr from-[#ff29417c] to-[#ff078f7c] rounded-tl-4xl rounded-tr-4xl border-0">
        {/* <img src="/placeholder.svg?height=256&width=768" className="w-full h-full object-cover" /> */}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 py-5 sm:px-6 -mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-[#ececec]">
            <AvatarImage src={userData?.avatar} alt="Profile picture" />
           
          </Avatar>
          <div className="mt-4 sm:mt-0 sm:ml-4 sm:mb-4 flex-1">
            <h1 className="text-xl sm:text-2xl text-gray-700 capitalize">{userData?.firstName} {userData?.lastName}</h1>
            <p className="text-xs text-gray-500 lowercase">@{userData?.username}</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:mb-4 flex space-x-2">
            <Button className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-tr from-[#ff2941] to-[#ff078e] h-8 font-normal text-white text-[13px]" size="sm"> <UserPlus className="h-4 w-4" /> Follow</Button>
            <Button className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-br from-[#ff2941af] to-[#ff078faf]  h-8 font-normal text-white text-[13px]" size="sm"> <MessageSquare className="h-4 w-4" /> Message</Button>
          </div>
        </div>
        {/* User Stats */}
        <div className="mt-4 flex justify-between max-w-xs">
          <div className="text-center flex items-center gap-1">
          <span className="font-normal text-gray-500">15k</span>
            <p className="text-xs sm:text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center flex items-center gap-1">
          <span className="font-normal text-gray-500">152</span>
            <p className="text-xs sm:text-sm text-gray-500">Following</p>
          </div>
          <div className="text-center flex items-center gap-1">
            <span className="font-normal text-gray-500">152</span>
            <p className="text-xs sm:text-sm text-gray-500">Posts</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {userData?.bio}
          </p>
        </div>
      </div>

      {/* Posts */}
      <ProfileNavigation data={userData}/>
      <div className="mt-6 space-y-4 px-4 sm:px-6 flex items-center justify-center flex-col">
      <GetUserProfilePosts data={userData}/>
      </div>
    </div>
        </main>
        <RightSidebar />
      </div>
      <MobileNavigation />
    </div>
  );
}
