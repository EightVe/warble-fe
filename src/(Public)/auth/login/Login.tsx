
import AuthBG from "@/assets/img/bg1.webp";
import { Link } from "react-router-dom";
import Form from "./components/Form";
export default function Login() {
  return (
    <div className="flex min-h-screen w-full bg-[#0c0c14] items-center justify-between py-4 relative flex-col">
      <img src={AuthBG} width={1920} height={1080} alt="logo" className="opacity-[0.08] absolute bottom-0 z-5  md:translate-y-0 w-full h-full object-cover"/>
      <div></div>
      <div className="flex w-full z-10 items-center justify-center">
        <div className="w-full max-w-md">
          <Form />
        </div>
      </div>
      <div className="text-gray-500 z-10 text-xs max-w-sm text-center">You acknowledge that you read, and agree to our 
        <Link to="/legal/terms-of-use" className="text-gray-300"> Terms of Use</Link> and our <Link to="/legal/privacy-policy" className="text-gray-300">Privacy Policy</Link>
      </div>
    </div>
  )
}