"use client";

import { useState, useEffect, useContext } from "react";
import { CheckCircle, Clock, Info, ShieldAlert, ShieldX, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthContext } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import CustomLink from "@/hooks/useLink";

export default function BanStatusPage() {
  const { user, loading } = useContext(AuthContext); 
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [banData, setBanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appealText, setAppealText] = useState("");
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    axiosInstance
      .get(`/user/ban-info/${user._id}`)
      .then((res) => {
        setBanData(res.data);
        updateRemainingTime(res.data.expiryDate);
      })
      .catch((err) => {
        console.error("Error fetching ban info:", err);
      })
      .finally(() => setIsLoading(false));

    // Update remaining time every second
    const interval = setInterval(() => {
      if (banData?.expiryDate) {
        updateRemainingTime(banData.expiryDate);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, banData?.expiryDate]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Permanent";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Calculate Remaining Time
  const updateRemainingTime = (expiryDate) => {
    if (!expiryDate) {
      setRemainingTime("Permanent");
      return;
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;

    if (diffTime <= 0) {
      setRemainingTime("Expired");
      return;
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    setRemainingTime(`${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
  };

  // Submit Appeal
  const handleSubmitAppeal = async () => {
    if (!appealText.trim()) {
      toast.error("Please provide a reason for your appeal.");
      return;
    }
  
    try {
      const response = await axiosInstance.put(`/user/appeal-ban/${user._id}`, {
        appealExplanation: appealText,
      });
  
      if (response.status === 200) {
        toast.success("Appeal submitted successfully.");
        setShowAppealForm(false);
        setBanData((prev) => ({ ...prev, appealStatus: "pending" }));
      }
    } catch (error) {
      toast.error("Failed to submit appeal.");
      console.error("Error submitting appeal:", error);
    }
  };
  
  if (!banData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060404] p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="border-red-400/30 bg-black shadow-[0_0_15px_rgba(255,0,0,0.1)]">
          <CardHeader className="border-b border-red-900/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-red-400 font-normal">Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-500/50 bg-black/50">
                <ShieldX className="h-12 w-12 text-red-500" />
                <div className="absolute inset-0 rounded-full border border-red-500/20 shadow-[0_0_10px_rgba(255,0,0,0.3)]" />
              </div>
            </div>
          <p className="text-gray-200 text-center text-xs">An Error Accured While Checking Your Ban Status <br/>Plese contact us at <span className="text-red-300">support@warble.chat</span> for further information</p>
          
          </CardContent>
        </Card>
      </div>
    </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060404] p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl tracking-tighter text-red-400">Account Restricted</h1>
          <p className="mt-2 text-gray-200 text-sm">Hello {banData.bannedUser.firstName}, Your account has been temporarily suspended</p>
        </div>

          <Card className="border-red-400/30 bg-black shadow-[0_0_15px_rgba(255,0,0,0.1)]">
          <CardHeader className="border-b border-red-900/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-red-400 font-normal">Ban Status</CardTitle>
            </div>
            <CardDescription className="text-gray-200 text-xs">Case ID: {banData.caseId}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-500/50 bg-black/50">
                <ShieldAlert className="h-12 w-12 text-red-500" />
                <div className="absolute inset-0 rounded-full border border-red-500/20 shadow-[0_0_10px_rgba(255,0,0,0.3)]" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1 text-gray-200">
                <div className="text-xs text-red-400">REASON</div>
                <div className="text-sm">{banData.reason}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-gray-200">
                <div className="text-xs text-red-400">BANNED BY</div>
                <div className="text-sm">
                  {banData.bannedByWho.firstName || "Unknown"} {banData.bannedByWho.lastName ? banData.bannedByWho.lastName.charAt(0) + "." : ""}
                </div>
              </div>
              <div className="space-y-1 text-gray-200">
                <div className="text-xs text-red-400 uppercase">Appeal Status</div>
                <div className="text-sm flex items-center gap-1">
                {banData.appealStatus && (
  <span className={`flex items-center gap-1 ${
    banData.appealStatus === "approved" ? "text-green-400" :
    banData.appealStatus === "pending" ? "text-yellow-400" :
    banData.appealStatus === "rejected" ? "text-red-400" :
    "text-gray-400"
  }`}>
    {banData.appealStatus === "approved" && <CheckCircle className="h-4 w-4" />}
    {banData.appealStatus === "pending" && <Clock className="h-4 w-4" />}
    {banData.appealStatus === "rejected" && <XCircle className="h-4 w-4" />}
    {banData.appealStatus === "none" && <Info className="h-4 w-4" />}
    {banData.appealStatus.charAt(0).toUpperCase() + banData.appealStatus.slice(1)}
  </span>
)}

</div>

              </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-gray-200">
                  <div className="text-xs text-red-400">BAN DATE</div>
                  <div className="text-sm">{formatDate(banData.banDate)}</div>
                </div>
                <div className="space-y-1 text-gray-200">
                  <div className="text-xs text-red-400">EXPIRY</div>
                  <div className="text-sm flex items-center gap-1">
                    {banData.expiryDate ? formatDate(banData.expiryDate) : "Permanent"}
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-red-950/30 p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-400" />
                  <div className="text-sm text-red-400">{remainingTime}</div>
                </div>
              </div>
            </div>
          </CardContent>
          <Separator className="bg-red-900/20" />
          {banData.appealStatus ==="none" ? 
          <CardFooter className="flex flex-col gap-4 pt-6">
            {!showAppealForm  ? (
              <>
               <p className="text-gray-200 text-xs">If you believe this decision was made in error or by mistake, you may submit an appeal. Please note that the appeal process takes time as our administration carefully reviews each case.</p>
              <Button className="bg-red-900 hover:bg-red-800 text-white font-normal text-[13px]" size="sm"                    onClick={() => setShowAppealForm(true)}>
              Appeal Decision
            </Button>
             </>
            ) : (
              <div className="space-y-4 w-full">
                <textarea
                  className="w-full h-24 rounded-md border border-red-900/50 bg-black/80 p-2 text-sm outline-none text-gray-200 placeholder:text-gray-300 placeholder:text-xs"
                  placeholder="Explain why you believe this ban should be reconsidered..."
                  value={appealText} // Bind state
                  onChange={(e) => setAppealText(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-900/50 bg-[#252525]/15 hover:bg-red-950/50 text-gray-200 font-normal"
                    onClick={() => setShowAppealForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-red-900 hover:bg-red-800 text-white font-normal text-[13px] flex-1" size="sm" onClick={() => handleSubmitAppeal()}>
             Submit Appeal
            </Button>
                </div>
              </div>
            )}
            <div className="text-center text-xs text-gray-200">
              For additional assistance, contact support at <span className="text-red-200">support@warble.chat</span>
            </div>
          </CardFooter> 
          :
          <CardFooter className="flex flex-col gap-4 pt-6">
             <p className="text-gray-200 text-xs">You've appealed for this restriction already, you can see further informations in the Ban History page.</p>
           <CustomLink href="/security-center/view-ban-history">
            <Button className="bg-red-900 hover:bg-red-800 text-white font-normal text-[13px]" size="sm">
            View Details
          </Button>
           </CustomLink>

          <div className="text-center text-xs text-gray-200">
            For additional assistance, contact support at <span className="text-red-200">support@warble.chat</span>
          </div>
        </CardFooter>
          }
        </Card>        
      </div>
    </div>
  );
}
