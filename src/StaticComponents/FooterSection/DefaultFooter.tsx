
import { Facebook, Twitter, Instagram, Youtube, Github } from "lucide-react"
import Logo from '@/assets/img/mainLogo.png'
import { Link } from "react-router-dom"
import ImageWithLoading from "@/(Public)/home/image-with-loading"
export default function DefaultFooter() {
  return (
    <footer className="bg-black text-gray-300 py-12 px-4 md:px-8">
    <div className="container mx-auto max-w-6xl">
      <div className="flex flex-col items-center md:items-start space-y-8">
        {/* Logo and tagline */}
        <div className="text-center md:text-left max-w-md">
          <div className="flex items-center justify-center md:justify-start mb-4 gap-1">
            <div className="h-7 w-7 rounded-lg bg-[#ff575748] flex items-center justify-center">
             <ImageWithLoading
              src={Logo || "/placeholder.svg"}
              alt="Warble Logo"
            />
            </div>
            <span className="text-gray-200 font-medium text-base tracking-tighter leading-tight logofont">Warble.</span>
          </div>
          <p className="text-sm text-gray-300 leading-tight tracking-tight max-w-xs mx-auto md:mx-0">
            The next generation of random video chatting with enhanced privacy and a futuristic interface.
          </p>
        </div>

        {/* Main links */}
        {/* <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/cookies" className="hover:text-white transition-colors">
            Cookie Policy
          </Link>
        </div> */}

        {/* Social icons */}
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <Link
              key={i}
              to="#"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={`Instagram link ${i}`}
            >
              <Instagram size={20} />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom section with copyright and secondary links */}
      <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <div>© 2024 - {new Date().getFullYear()} Eightve LTD. All rights reserved.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link to="/cookies" className="hover:text-white transition-colors">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  </footer>
    
  )
}

