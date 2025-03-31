import { Button } from "@/components/ui/button"
import person from "@/assets/img/peer/girl1.jpg"
import person2 from "@/assets/img/peer/couple1.jpg"
import person3 from "@/assets/img/peer/guy1.jpg"
import person4 from "@/assets/img/peer/p1.jpg"
import person5 from "@/assets/img/peer/p2.jpg"
import person6 from "@/assets/img/peer/p3.jpg"
import DefaultFooter from "@/StaticComponents/FooterSection/DefaultFooter"
import { Link } from "react-router-dom"
import ImageWithLoading from "./image-with-loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import Logo from "@/assets/img/mainLogo.png"
export default function Home() {
  return (
    <>
      <div className="h-screen bg-black text-white flex flex-col items-center relative overflow-hidden">
      <div className=' gap-1 absolute z-50 py-2 w-full flex items-center justify-center'>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-transparent -z-5 h-32" />
      <div className="flex items-center justify-center gap-1">
            <div className="h-7 w-7 rounded-lg bg-[#ff575748] flex items-center justify-center">
             <img src={Logo} loading="lazy" alt="Warble Logo" />
            </div>
            <span className="text-gray-200 font-medium text-base tracking-tighter leading-tight logofont">Warble.</span>
          </div>
      </div>
        <div className="grid md:grid-cols-3 grid-cols-2 gap-3 w-full md:w-[60%] h-full lg:h-auto lg:py-6 px-4 py-2">
          {/* Row 1 */}
          <div className="relative rounded-lg overflow-hidden h-full lg:aspect-[3/4]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10" />
            <ImageWithLoading
              src={person || "/placeholder.svg"}
              alt="Profile 1"
              className="object-cover h-full w-full"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden h-full lg:aspect-[3/4] hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10" />
            <ImageWithLoading
              src={person2 || "/placeholder.svg"}
              alt="Profile 2"
              className="object-cover h-full w-full"
            />
          </div>

          {/* Row 2 */}
          <div className="relative rounded-lg overflow-hidden h-full lg:aspect-[3/4] hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10" />
            <ImageWithLoading
              src={person3 || "/placeholder.svg"}
              alt="Profile 3"
              className="object-cover h-full w-full"
            />
          </div>

          <div className="relative rounded-lg overflow-hidden h-full lg:aspect-[3/4]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10" />
            <ImageWithLoading
              src={person6 || "/placeholder.svg"}
              alt="Profile 4"
              className="object-cover h-full w-full"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden h-full lg:aspect-[3/4]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10" />
            <ImageWithLoading
              src={person4 || "/placeholder.svg"}
              alt="Profile 5"
              className="object-cover h-full w-full"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden h-full lg:aspect-[3/4]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10" />
            <ImageWithLoading
              src={person5 || "/placeholder.svg"}
              alt="Profile 6"
              className="object-cover h-full w-full"
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 py-10">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent -z-5" />
          <div className="flex items-center justify-center flex-col z-20 md:w-[60%] mx-auto">
            <h2 className="text-2xl leading-tight text-center">
              Talk to the World, <br /> Instantly with Warble.
            </h2>
            <p className="mt-2 text-zinc-300 text-sm px-6 max-w-xl text-center">
              Random video and text chat that brings people together. Meet new faces, start conversations, and enjoy
              spontaneous connections. Connect through feeds, send friend requests, chat in DMs, and explore new
              conversations effortlessly.
            </p>
            <div className="flex items-center justify-center w-1/2 gap-2 flex-col">
              <Link to="/auth/signup" className="w-full">
                <Button className="w-full bg-gradient-to-bl from-[#ff5757]/90 to-[#ff078e]/90 text-white rounded-full py-4 text-base font-normal mt-4">
                  Get Started
                </Button>
              </Link>
              <Link to="/auth/login">
                <p className="text-[#db5d6c] text-sm">Log In</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <DefaultFooter />
      </div>
    </>
  )
}

