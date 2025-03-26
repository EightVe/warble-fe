"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Logo from "@/assets/img/mainLogo.png"
interface NavItem {
  name: string
  href?: string
  items?: { name: string; href: string; description?: string }[]
}

const navItems: NavItem[] = [
    {
      name: "Account",
      items: [
        {
          name: "Account Health",
          href: "/security-center/account-health",
          description: "View any restrictions or limitations on your account",
        },
        {
          name: "Ban History",
          href: "/security-center/view-ban-history",
          description: "Check past bans or suspensions",
        },
        {
            name: "Logs",
            href: "/security-center/view-logs",
            description: "Check log's of your account",
          },
      ],
    },
    {
      name: "Reports & Tickets",
      items: [
        {
          name: "Reports",
          href: "/security-center/my-reports",
          description: "Track issues you've reported",
        },
        {
          name: "Tickets",
          href: "/security-center/my-tickets",
          description: "Manage your support requests",
        },
      ],
    },
    {
      name: "Community & Guidelines",
      items: [
        {
          name: "Community Guidelines",
          href: "/support/community-guidelines",
          description: "Understand our rules and policies",
        },
        {
          name: "Terms of Service",
          href: "/legal/terms-of-service",
          description: "Review our terms and conditions",
        },
        {
            name: "Privacy & Policy",
            href: "/legal/privacy-policy",
            description: "Review our policy and privacy",
          },
      ],
    },
    {
      name: "Support",
      items: [
        {
          name: "Contact Support",
          href: "/support/contact",
          description: "Reach out to our support team for assistance",
        },
        {
          name: "System Status",
          href: "/system/status",
          description: "Check for outages or ongoing issues",
        },
      ],
    },
  ];
  

export default function SCNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileExpandedItems, setMobileExpandedItems] = useState<string[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const handleMobileExpand = (itemName: string) => {
    setMobileExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  return (
    <>
      <header
        className={`z-50 fixed top-0 left-0 right-0 transition-all duration-300
          bg-black/80 backdrop-blur-md border-b border-zinc-800 `}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <a href="/" className="flex items-center gap-2 z-50">
              <img src={Logo} alt="" className="h-8 w-8"/>
              Security Center
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors py-2"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <button className="flex items-center gap-1 text-sm cursor-pointer text-zinc-400 hover:text-white transition-colors py-2">
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {item.items && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 w-64 mt-1 py-2 bg-black border border-zinc-800 rounded-lg shadow-xl"
                        >
                          {item.items.map((subItem) => (
                            <a
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900"
                            >
                              <div className="font-medium">{subItem.name}</div>
                              {subItem.description && (
                                <div className="text-xs text-zinc-500 mt-0.5">{subItem.description}</div>
                              )}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            <div className="hidden lg:flex items-center space-x-4">
              <a href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Login
              </a>
              <a
                href="/auth/signup"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#ff5757] px-6 text-sm font-medium text-white transition-colors hover:bg-[#ff5757]/90 focus:outline-none focus:ring-2 focus:ring-[#ff5757] focus:ring-offset-2 focus:ring-offset-black"
              >
                Get Started
              </a>
            </div>

            <button
              className="lg:hidden flex items-center cursor-pointer justify-center h-10 w-10 rounded-md border border-zinc-800 bg-black/50"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

            <motion.div
              className="absolute top-0 right-0 w-full max-w-sm h-full bg-black border-l border-zinc-800 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
            >
              <div className="flex items-center justify-between h-16 md:h-20 px-4 border-b border-zinc-800">
                <a href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Menu
                </a>
                <button
                  className="flex cursor-pointer items-center justify-center h-10 w-10 rounded-md border border-zinc-800 bg-black/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <nav className="p-4">
                {navItems.map((item) => (
                  <div key={item.name} className="mb-4">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="flex items-center justify-between py-2 text-base text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ) : (
                      <>
                        <button
                          className="flex items-center justify-between w-full py-2 text-base text-white"
                          onClick={() => handleMobileExpand(item.name)}
                        >
                          {item.name}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              mobileExpandedItems.includes(item.name) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {item.items && (
                          <AnimatePresence>
                            {mobileExpandedItems.includes(item.name) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 pb-2">
                                  {item.items.map((subItem) => (
                                    <a
                                      key={subItem.name}
                                      href={subItem.href}
                                      className="block py-2 text-sm text-zinc-400 hover:text-white"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      <div className="font-medium">{subItem.name}</div>
                                      {subItem.description && (
                                        <div className="text-xs text-zinc-500 mt-0.5">{subItem.description}</div>
                                      )}
                                    </a>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-zinc-800 space-y-4">
                <a
                  href="/auth/signup"
                  className="flex items-center justify-center h-12 rounded-md bg-[#ff5757] px-6 text-base font-medium text-white transition-colors hover:bg-[#ff5757]/90"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

