"use client"

import { useContext, useEffect, useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  CircleCheck,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  MessageSquare,
  Shield,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import DefaultFooter from "@/StaticComponents/FooterSection/DefaultFooter"
import SCNavigation from "../SCNavigation"
import { AuthContext } from "@/contexts/AuthContext"
import axiosInstance from "@/lib/axiosInstance"
import { toast } from "sonner"

export default function ViewUserBanHistory() {
  const [showHelp, setShowHelp] = useState(false)
  const { user } = useContext(AuthContext) || {}
  const [banData, setBanData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [appealText, setAppealText] = useState("");
  useEffect(() => {
    if (!user?._id) return

    // Fetch both current and previous bans
    Promise.all([
      axiosInstance.get(`/user/ban-info/${user._id}`).catch(() => null),
      axiosInstance.get(`/user/previous-bans/${user._id}`).catch(() => null),
    ])
      .then(([currentBanRes, previousBansRes]) => {
        const currentBan = currentBanRes?.data ? [{ ...currentBanRes.data, status: "active" }] : []
        const previousBans = previousBansRes?.data || []

        // Sort bans by banDate (newest first)
        const sortedBans = [...currentBan, ...previousBans].sort((a, b) => new Date(b.banDate) - new Date(a.banDate))

        setBanData(sortedBans)
      })
      .catch((err) => console.error("Error fetching bans:", err))
      .finally(() => setIsLoading(false))
  }, [user])

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Permanent"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }
  
  const handleSubmitAppeal = async () => {
    if (!appealText.trim()) {
      toast.error("Please provide a reason for your appeal.");
      return;
    }
  
    try {
      const response = await axiosInstance.put(`/user/appeal-ban/${user?._id}`, {
        appealExplanation: appealText,
      });
  
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to submit appeal.");
      console.error("Error submitting appeal:", error);
    }
  };
  // Replace the getRemainingTime function with this improved version
  const getRemainingTime = (expiryDate) => {
    if (!expiryDate) return "Permanent"

    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffMs = expiry - now // Get the difference in milliseconds

    if (diffMs <= 0) return "Expired"

    // Convert milliseconds to hours and round up to ensure we don't show 0 hours when time is remaining
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) {
      return "Less than 1 hour"
    }

    const diffDays = Math.floor(diffHours / 24)
    const remainingHours = diffHours % 24

    return diffDays > 0
      ? `${diffDays} day${diffDays !== 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`
      : `${diffHours} hour${diffHours !== 1 ? "s" : ""}`
  }

  // Replace the getStatusText function with this improved version
  const getStatusText = (ban) => {
    if (!ban.expiryDate) return "Permanent" // Handle permanent bans

    const now = new Date()
    const expiry = new Date(ban.expiryDate)

    // Add a small buffer (1 minute) to prevent edge cases
    if (expiry <= new Date(now.getTime() - 60000)) {
      return "Expired"
    }

    // Get the remaining time
    const timeRemaining = getRemainingTime(ban.expiryDate)

    // If getRemainingTime returns "Expired", just return "Expired" without the "Active -" prefix
    if (timeRemaining === "Expired") {
      return "Expired"
    }

    return `Active - ${timeRemaining} remaining`
  }

  // Get appeal status styling
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SCNavigation />

      <div className="container mx-auto max-w-4xl py-8 px-4 pt-32">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl tracking-tight">Account Ban History</h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={() => setShowHelp(!showHelp)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Help</span>
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-zinc-400 text-sm">View your account restrictions</p>
          </div>
          <Button className="bg-[#ff5757] hover:bg-[#ff5757]/90 text-white font-normal" size="sm">
            <MessageSquare className="h-4 w-4" />
            Contact Support
          </Button>
        </div>

        {showHelp && (
          <Card className="mb-6 border-zinc-800 bg-zinc-900/50 text-white">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 text-sm">
                <p>
                  <strong className="font-normal text-red-300">What are account restrictions?</strong> Account
                  restrictions are limitations placed on your account due to violations of our community guidelines or
                  terms of service.
                </p>
                <p>
                  <strong className="font-normal text-red-300">How do I appeal?</strong> For eligible restrictions, you
                  can submit an appeal by clicking the "Appeal" button. Our team will review your case and respond
                  within 48 hours.
                </p>
                <p>
                  <strong className="font-normal text-red-300">Need more help?</strong> Contact our support team using
                  the button above for assistance with your account status.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-2 border-4 border-t-[#ff5757] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-[#ff5757] border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-[#ff5757] border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-[#ff5757] border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-[#ff5757] font-mono text-sm tracking-wider">LOADING DATA</div>
          </div>
        ) : banData.length === 0 ? (
          <Card className="mb-6 border-[#57ff73]/20 bg-[#57ff73]/10 text-white">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="mt-0.5 shrink-0">
                <CircleCheck className="h-5 w-5 text-[#43b946]" />
              </div>
              <div>
                <h3 className="mb-1">Your account currently has no active restrictions</h3>
                <p className="text-xs text-zinc-300">
                  All features are fully available. Continue following our community guidelines to maintain
                  uninterrupted access.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {user?.isBanned && (
              <Card className="mb-6 border-[#ff5757]/20 bg-[#ff5757]/10 text-white">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="mt-0.5 shrink-0">
                    <AlertCircle className="h-5 w-5 text-[#ff5757]" />
                  </div>
                  <div>
                    <h3 className="mb-1">Your account currently has active restrictions</h3>
                    <p className="text-xs text-zinc-300">
                      Some features may be limited until these restrictions expire. Review the details below and follow
                      our community guidelines to avoid future restrictions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {banData.length > 0 ? (
                banData.map((ban) => (
                  <Card key={ban.caseId} className="overflow-hidden border-zinc-800 bg-zinc-900/70 text-white">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <CardDescription className="text-zinc-400 mt-1">
                            Account Restricted • Issued on {formatDate(ban.banDate)}
                          </CardDescription>
                        </div>

                            {ban.appealStatus === "none" && (getStatusText(ban) === "Permanent" || getStatusText(ban) !== "Expired") && (
  <Dialog>
    <DialogTrigger>
      <Button
        size="sm"
        variant="outline"
        className="border-[#ff5757] text-[#ff5757] bg-[#ff5757]/10 font-normal"
      >
        Appeal This Restriction
      </Button>
    </DialogTrigger>
    <DialogContent className="bg-[#141313] text-gray-200 border-none">
      <DialogHeader>
        <DialogTitle className="font-normal text-red-400">Appeal Restriction</DialogTitle>
        <DialogDescription>
          <textarea
            className="w-full h-24 rounded-md border border-red-900/50 bg-black/20 p-2 text-sm outline-none text-gray-200 placeholder:text-gray-300 placeholder:text-xs"
            placeholder="Explain why you believe this ban should be reconsidered..."
            value={appealText} // Bind state
            onChange={(e) => setAppealText(e.target.value)}
          />
          <Button
            className="bg-red-900 hover:bg-red-800 text-white font-normal text-[13px] w-full"
            size="sm"
            onClick={() => handleSubmitAppeal()}
          >
            Submit Appeal
          </Button>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
)}

                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h3 className="mb-1 text-sm text-zinc-400">Reason</h3>
                          <p className="text-sm text-gray-200">{ban.reason}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <h3 className="mb-1 text-sm text-zinc-400">Status</h3>
                            <div className="flex items-center gap-2">
                              {new Date(ban.expiryDate) > new Date() ? (
                                <Clock className="h-4 w-4 text-[#ff5757]" />
                              ) : (
                                <Calendar className="h-4 w-4 text-zinc-400" />
                              )}
                              <p className={`text-sm ${new Date(ban.expiryDate) > new Date() ? "text-[#ff5757]" : ""}`}>
                                {getStatusText(ban)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h3 className="mb-1 text-sm text-zinc-400">Appeal Status</h3>
                            <div className="text-sm flex items-center gap-1">
                              {ban.appealStatus && (
                                <span
                                  className={`flex items-center gap-1 ${
                                    ban.appealStatus === "approved"
                                      ? "text-green-400"
                                      : ban.appealStatus === "pending"
                                        ? "text-yellow-400"
                                        : ban.appealStatus === "rejected"
                                          ? "text-red-400"
                                          : "text-gray-400"
                                  }`}
                                >
                                  {ban.appealStatus === "approved" && <CheckCircle className="h-4 w-4" />}
                                  {ban.appealStatus === "pending" && <Clock className="h-4 w-4" />}
                                  {ban.appealStatus === "rejected" && <XCircle className="h-4 w-4" />}
                                  {ban.appealStatus === "none" && <Info className="h-4 w-4" />}
                                  {ban.appealStatus.charAt(0).toUpperCase() + ban.appealStatus.slice(1)}
                                </span>
                              )}
                            </div>
                            
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm text-zinc-400">Issued By</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm">
                              {ban.bannedByWho.firstName || "Unknown"}{" "}
                              {ban.bannedByWho.lastName ? ban.bannedByWho.lastName.charAt(0) + "." : ""}
                            </p>
                            
                          </div>
{ban.appealExplanation && 
                          <Dialog>
                          <DialogTrigger>
                            <p
                              className=" text-[#ff5757] text-xs cursor-pointer hover:underline"
                            >
                             Appeal Explanation
                            </p>
                          </DialogTrigger>
                          <DialogContent className="bg-[#141313] text-gray-200 border-none">
                            <DialogHeader>
                              <DialogTitle className="font-normal text-red-400">Appeal Explanation</DialogTitle>
                              <DialogDescription className="text-xs text-gray-300">
                                This is the explanation you provided for your un-ban request.
                              </DialogDescription>
                              <DialogDescription className="border-t border-[#ff5757]">
                                <div className="mt-2">{ban.appealExplanation}</div>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-800 bg-zinc-950 px-6 py-3 flex justify-between">
                      <div className="text-xs text-zinc-500">CASE ID : {ban.caseId}</div>
                      <Button size="sm" className="h-auto p-0 text-xs text-zinc-400 hover:text-white font-normal">
                        View Community Guidelines
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="border-zinc-800 bg-zinc-900 text-white">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Shield className="mb-4 h-12 w-12 text-green-400" />
                    <h3 className="mb-2 text-xl">Your account is in good standing</h3>
                    <p className="text-center text-zinc-400 max-w-md">
                      You have no current or past account restrictions. Keep following our community guidelines to
                      maintain your good standing.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        <div className="mt-8 space-y-4">
          <h2 className="text-lg">Frequently Asked Questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-zinc-800 bg-zinc-900 text-white">
              <CardHeader>
                <CardTitle className="text-base font-normal">How can I avoid restrictions?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300">
                Follow our community guidelines, be respectful to other user, and avoid using unauthorized actions or
                exploits.
              </CardContent>
              <CardFooter className="border-t border-zinc-800 pt-4">
                <Button size="sm" className="h-auto p-0 text-xs text-[#ff5757]">
                  Read Community Guidelines
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900 text-white">
              <CardHeader>
                <CardTitle className="text-base font-normal">What happens if I get multiple restrictions?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300">
                Multiple or repeated violations may result in longer restriction periods or permanent account
                suspension.
              </CardContent>
              <CardFooter className="border-t border-zinc-800 pt-4">
                <Button size="sm" className="h-auto p-0 text-xs text-[#ff5757]">
                  Read Penalty System
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <DefaultFooter />
    </div>
  )
}

