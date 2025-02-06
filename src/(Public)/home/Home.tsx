import logo2 from '@/assets/img/mainLogo.png'
import AuthBG from "@/assets/img/bg1.webp";
export default function Home() {
  return (
    <>
    
        <img src={AuthBG} width={1920} height={1080} alt="logo" className="opacity-[0.08] absolute bottom-0 -z-5  md:translate-y-0 w-full h-full object-cover"/>
    <div className='h-screen w-full flex items-center justify-between flex-col py-10 z-5'>
        <img src={logo2} height={100} width={100}/>

        <div className='md:w-1/2 lg:w-1/4 text-center text-gray-600 w-[90%]'>
        Warble is startup Platform where people can communicate, meet new people or create an online presence Providing user with full control of there accounts with Prime futures that stand. Still under development.
        </div>
        <p className='text-gray-500 text-xs px-4 text-center'>2025 Warble.chat is registered under Eightve Labs LTD all copyrights reserved including trendmarks.</p>
    </div>
    </>
  )
}