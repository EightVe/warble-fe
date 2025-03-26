import { Link } from "react-router-dom"
import { ChevronRight, Users, Shield, Zap, Globe, MessageSquare } from "lucide-react"
import DefaultNavigation from "./DefaultNavigation"
import DefaultFooter from "../FooterSection/DefaultFooter"


export default function SideNavigation() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <DefaultNavigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/80"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#ff5757]/20 to-[#ff5757]/5 backdrop-blur-sm border border-[#ff5757]/20 mb-4">
              <span className="text-[#ff5757] font-medium text-sm">The Future of Random Video Chat</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-[#ff5757] leading-[1.1]">
              Connect With The World <br /> In Real-Time
            </h1>
            <p className="max-w-[700px] text-zinc-400 md:text-xl">
              Experience the next generation of random video chatting with enhanced privacy, advanced matching
              algorithms, and a futuristic interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                to="#get-started"
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#ff5757] px-8 text-white font-medium shadow-lg shadow-[#ff5757]/25 transition-all hover:bg-[#ff5757]/90 hover:shadow-xl hover:shadow-[#ff5757]/20 focus:outline-none focus:ring-2 focus:ring-[#ff5757] focus:ring-offset-2 focus:ring-offset-black"
              >
                Get Started <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="#learn-more"
                className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-800 bg-black/50 backdrop-blur-sm px-8 text-white font-medium transition-colors hover:bg-zinc-900 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff5757]/50 to-transparent"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Advanced <span className="text-[#ff5757]">Features</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our platform offers cutting-edge technology to make your random chat experience seamless and exciting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-10 w-10 text-[#ff5757]" />,
                title: "Smart Matching",
                description:
                  "Our AI-powered algorithm connects you with people who share your interests and preferences.",
              },
              {
                icon: <Shield className="h-10 w-10 text-[#ff5757]" />,
                title: "Enhanced Privacy",
                description: "Advanced encryption and privacy controls keep your conversations secure and anonymous.",
              },
              {
                icon: <Zap className="h-10 w-10 text-[#ff5757]" />,
                title: "Ultra-Fast Connection",
                description: "Experience lightning-fast connections with minimal latency for smooth video chats.",
              },
              {
                icon: <Globe className="h-10 w-10 text-[#ff5757]" />,
                title: "Global Reach",
                description: "Connect with people from over 190 countries around the world in real-time.",
              },
              {
                icon: <MessageSquare className="h-10 w-10 text-[#ff5757]" />,
                title: "Real-time Translation",
                description: "Break language barriers with our built-in translation feature for text chats.",
              },
              {
                icon: <Shield className="h-10 w-10 text-[#ff5757]" />,
                title: "Content Moderation",
                description: "AI-powered moderation ensures a safe and respectful environment for all users.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="relative group p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-[#ff5757]/50 hover:bg-zinc-900/80"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ff5757]/0 to-[#ff5757]/0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-[#ff5757]">Works</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Get started in just a few simple steps and begin connecting with people worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Sign up and customize your profile with your interests and preferences.",
              },
              {
                step: "02",
                title: "Set Your Preferences",
                description: "Choose your matching preferences including language, region, and topics.",
              },
              {
                step: "03",
                title: "Start Chatting",
                description: "Click the 'Start' button and get instantly connected with someone new.",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-4 -top-4 text-6xl font-bold text-[#ff5757]/10">{step.step}</div>
                <div className="p-6 rounded-xl border border-zinc-800 bg-black/50 backdrop-blur-sm relative z-10">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-zinc-400">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-full">
                    <ChevronRight className="h-8 w-8 text-[#ff5757]/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                About <span className="text-[#ff5757]">Our Platform</span>
              </h2>
              <p className="text-zinc-400 mb-6">
                Founded in 2023, our platform was built with a vision to revolutionize how people connect online. We
                believe in creating meaningful connections in a safe, secure, and exciting environment.
              </p>
              <p className="text-zinc-400 mb-6">
                Our team of engineers and designers work tirelessly to create the most advanced random video chat
                platform with cutting-edge technology and a user-centric approach.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#ff5757]"></div>
                  <span className="text-zinc-400">10M+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#ff5757]"></div>
                  <span className="text-zinc-400">190+ Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#ff5757]"></div>
                  <span className="text-zinc-400">99.9% Uptime</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff5757]/20 to-transparent rounded-2xl blur-3xl opacity-30"></div>
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
                <img
                  src="/placeholder.svg?height=600&width=800"
                  width={800}
                  height={600}
                  alt="About our platform"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-zinc-950 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10M+", label: "Active Users" },
              { value: "500K+", label: "Daily Connections" },
              { value: "190+", label: "Countries" },
              { value: "4.8/5", label: "User Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff5757]/5 to-transparent"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Connect With the World?</h2>
            <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
              Join millions of users already experiencing the future of random video chatting. Sign up now and start
              connecting with people from around the globe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="#signup"
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#ff5757] px-8 text-white font-medium shadow-lg shadow-[#ff5757]/25 transition-all hover:bg-[#ff5757]/90 hover:shadow-xl hover:shadow-[#ff5757]/20 focus:outline-none focus:ring-2 focus:ring-[#ff5757] focus:ring-offset-2 focus:ring-offset-black"
              >
                Sign Up Free
              </Link>
              <Link
                to="#premium"
                className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-800 bg-black/50 backdrop-blur-sm px-8 text-white font-medium transition-colors hover:bg-zinc-900 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                Explore Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DefaultFooter />
    </div>
  )
}

