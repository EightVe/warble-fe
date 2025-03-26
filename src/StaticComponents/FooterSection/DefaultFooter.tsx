
import { Facebook, Twitter, Instagram, Youtube, Github } from "lucide-react"
import Logo from '@/assets/img/mainLogo.png'
export default function DefaultFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <a href="/" className="flex items-center gap-2">
              <img src={Logo} className="w-8 h-8"/> Warble
            </a>
            <p className="text-zinc-400 max-w-xs text-sm">
              The next generation of random video chatting with enhanced privacy and a futuristic interface.
            </p>
            <div className="flex space-x-4">
              {/* <a href="#" className="text-zinc-400 hover:text-[#ff5757] transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a> */}
              {/* <a href="#" className="text-zinc-400 hover:text-[#ff5757] transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a> */}
              <a href="#" className="text-zinc-400 hover:text-[#ff5757] transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              {/* <a href="#" className="text-zinc-400 hover:text-[#ff5757] transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
              <a href="#" className="text-zinc-400 hover:text-[#ff5757] transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a> */}
            </div>
          </div>

          <div>
            <h3 className="text-base mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Features", href: "#features" },
                { name: "How It Works", href: "#how-it-works" },
                { name: "About", href: "#about" },
                { name: "Contact", href: "#contact" },
              ].map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-zinc-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base mb-4">Resources</h3>
            <ul className="space-y-3">
              {[
                { name: "Blog", href: "#blog" },
                { name: "Support Center", href: "#support" },
                { name: "Safety Tips", href: "#safety" },
                { name: "Community Guidelines", href: "#guidelines" },
                { name: "API Documentation", href: "#api" },
              ].map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                { name: "Terms of Service", href: "#terms" },
                { name: "Privacy Policy", href: "#privacy" },
                { name: "Cookie Policy", href: "#cookies" },
                { name: "GDPR Compliance", href: "#gdpr" },
                { name: "Accessibility", href: "#accessibility" },
              ].map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-500 text-xs">&copy; {new Date().getFullYear()} Eightve LTD. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors text-sm">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

