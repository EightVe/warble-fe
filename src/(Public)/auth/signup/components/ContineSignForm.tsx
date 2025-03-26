import AuthBG from "@/assets/img/peer/couple1.jpg"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import Logo from "@/assets/img/mainLogo.png"
import { Helmet } from "react-helmet"
import { OnboardingStepper } from "./on-boarding-stepper"
import { useContext } from "react"
import { AuthContext } from "@/contexts/AuthContext"
export default function ContinueSignForm() {
  const {user , updateGeoLocationManually } = useContext(AuthContext) || {};
  return (
    <>
    <Helmet>
      <title>Warble - Setting up account</title>
      <meta name="description" content="Continue your Warble account steps and unlock the portal of chatting and meeting new people." />
      <meta property="og:title" content="Warble - Continue Sign Up" />
      <meta property="og:site_name" content="Warble Chat" />
      <meta property="og:url" content="https://warble.chat/auth/signup/cs" />
      <link rel="canonical" href="https://warble.chat/auth/signup/cs" />
    </Helmet>
    <main className="relative flex min-h-screen items-center justify-between overflow-auto bg-[#110e0e]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[#ff5757] opacity-5 blur-[120px] z-0"></div>
      {/* Form section */}
      <div className="w-full md:w-1/2 z-10 flex flex-col py-6 items-center justify-between h-screen">
      <div className='flex items-center gap-1'>
      <div className='h-10 w-10 pr-[1px] rounded-xl bg-[#ff5757]/20 flex items-center justify-center'><Avatar className="h-full w-full rounded-none flex items-center justify-center">
      <AvatarImage src={Logo || "/placeholder.svg"} alt="Authentication" className="h-8 w-8 " />
      <AvatarFallback><Skeleton className="h-[50%] w-[50%] bg-[#ff5757]/30" /></AvatarFallback>
    </Avatar></div>
      <p className='text-gray-300 logofont'>Warble.</p>
      </div>
        <OnboardingStepper user={user} updateGeoLocationManually={updateGeoLocationManually }/>
        <div></div>
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

