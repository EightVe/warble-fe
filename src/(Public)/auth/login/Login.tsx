"use client"
import AuthBG from "@/assets/img/peer/couple1.jpg"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import Logo from "@/assets/img/mainLogo.png"
import Form from "./components/Form"
import { Helmet } from "react-helmet"
export default function Login() {
  return (
    <>
        <Helmet>
    <title>Warble - Log In</title>
    <meta name="description" content="log into account and connect with friends now!" />
    <meta property="og:title" content="Warble - Log In" />
    <meta property="og:site_name" content="Warble Chat" />
    <meta property="og:url" content="https://warble.chat/auth/login" />
    <link rel="canonical" href="https://warble.chat/auth/login" />
  </Helmet>

    <main className="relative flex min-h-screen items-center justify-between overflow-auto bg-[#110e0e]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[#ff5757] opacity-5 blur-[120px] z-0"></div>
      {/* Form section */}
      <div className="w-full md:w-1/2 h-full z-10 flex flex-col py-6 items-center justify-center">
      <div className='flex items-center gap-1'>
      <div className='h-10 w-10 pr-[1px] rounded-xl bg-[#ff5757]/20 flex items-center justify-center'><Avatar className="h-full w-full rounded-none flex items-center justify-center">
      <AvatarImage src={Logo || "/placeholder.svg"} alt="Authentication" className="h-8 w-8 " />
      <AvatarFallback><Skeleton className="h-[50%] w-[50%] bg-[#ff5757]/30" /></AvatarFallback>
    </Avatar></div>
      <p className='text-gray-300 logofont'>Warble.</p>
      </div>
        <Form />
        <div className="text-gray-300 z-10 text-[10px] max-w-sm text-center">You acknowledge that you read, and agree to our 
        <Link to="/legal/terms-of-use" className="text-[#ff7474]"> Terms of Use</Link> and our <Link to="/legal/privacy-policy" className="text-[#ff7474]">Privacy Policy</Link>
      </div>
      </div>

      {/* Image section */}
      <div className="hidden md:block w-1/2 h-screen relative">
        <Avatar className="h-full w-full rounded-none">
      <AvatarImage src={AuthBG || "/placeholder.svg"} alt="Authentication" className="h-full w-full object-cover object-top rounded-tl-2xl rounded-bl-full opacity-50" />
      <AvatarFallback><Skeleton className="h-full w-full rounded-tl-2xl rounded-bl-full bg-[#ff5757]/10" /></AvatarFallback>
    </Avatar>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white ">
        </div>
      </div>
    </main>
    </>
  )
}

