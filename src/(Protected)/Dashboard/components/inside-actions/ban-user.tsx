import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axiosInstance';
import { AlertTriangle, Ban, X } from 'lucide-react';
import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const BAN_REASONS = [
  "Harassment",
  "Hate Speech",
  "Spamming",
  "Inappropriate Behavior",
  "Impersonation",
  "Other",
];

export default function BanUser({ _id, onRefresh, isBanned, name }) {
  const { user } = useContext(AuthContext) || {};
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [expiryDuration, setExpiryDuration] = useState(null);
  const [expiryType, setExpiryType] = useState("permanent");
  const [banInfo, setBanInfo] = useState(null);

  useEffect(() => {
    if (isBanned) {
      axiosInstance.get(`/user/ban-info/${_id}`)
        .then(res => setBanInfo(res.data))
        .catch(() => toast.error("Failed to fetch ban details."));
    }
  }, [isBanned, _id]);

  const handleToggleBan = async () => {
    if (!isBanned && selectedReasons.length === 0) {
      toast.error("Please select at least one ban reason.");
      return;
    }
  
    setIsLoading(true);
  
    // Convert expiry duration to correct units
    let durationInSeconds = null;
    if (expiryType !== "permanent" && expiryDuration > 0) {
      if (expiryType === "seconds") durationInSeconds = expiryDuration;
      if (expiryType === "minutes") durationInSeconds = expiryDuration * 60;
      if (expiryType === "hours") durationInSeconds = expiryDuration * 60 * 60;
      if (expiryType === "days") durationInSeconds = expiryDuration * 60 * 60 * 24;
    }
  
    try {
      const response = await axiosInstance.put(`/dash/ban-user/${_id}`, {
        isBanned: !isBanned, // Toggle status
        bannedByWho: user?._id, // Admin ID
        reason: isBanned ? "" : selectedReasons.join(", "),
        expiryDuration: expiryType === "permanent" ? null : durationInSeconds,
        expiryType,
      });
  
      if (response.status === 200) {
        toast.success(isBanned ? "User unbanned successfully." : "User banned successfully.");
        setShowBanDialog(false);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      toast.error("Failed to update ban status.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <>
      <Button
        size="sm"
         variant="outline"
        onClick={() => setShowBanDialog(true)}
        className={`w-full ${isBanned ? "justify-start border-green-800 bg-green-900/70 hover:bg-green-800 transition-all duration-300 font-normal" : "justify-start border-red-800 bg-red-900/70 hover:bg-red-800 transition-all duration-300 font-normal"}`}
      >
        {isBanned ? (
          <>
            <Ban className="h-4 w-4" /> Unban User
          </>
        ) : (
          <>
            <Ban className="h-4 w-4" /> Ban User
          </>
        )}
      </Button>
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="bg-[#171616] text-gray-200 border-none">
          <DialogHeader>
            <DialogTitle className="font-normal text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#ff5757]" /> {isBanned ? "Unban User" : "Ban User"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>Are you sure you want to {isBanned ? "unban" : "ban"} {name}?</p>

            {isBanned && banInfo ? (
              <div className="mt-3 text-sm text-gray-200">
                <p><strong className='font-normal text-red-400'>Reason:</strong> {banInfo.reason}</p>
                <p><strong className='font-normal text-red-400'>Case ID:</strong> {banInfo.caseId}</p>
                <p><strong className='font-normal text-red-400'>Expiry:</strong> {banInfo.expiryDate ? new Date(banInfo.expiryDate).toLocaleString() : "Permanent"}</p>
                <p className='capitalize'><strong className='font-normal text-red-400'>Appeal Status:</strong> {banInfo.appealStatus}</p>
                <p><strong className='font-normal text-red-400'>Appeal Explanation:</strong> {banInfo.appealExplanation}</p>
              </div>
            ) : !isBanned ? (
              <div className="mt-4">
                <label className="text-sm text-red-400">Select Ban Reasons:</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {BAN_REASONS.map((reason) => (
                    <label key={reason} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        value={reason}
                        checked={selectedReasons.includes(reason)}
                        onChange={(e) =>
                          setSelectedReasons(e.target.checked
                            ? [...selectedReasons, reason]
                            : selectedReasons.filter((r) => r !== reason))
                        }
                        className="form-checkbox h-4 w-4 text-red-500 border-gray-400"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <label className="block mt-4 text-sm text-red-400">Ban Duration:</label>
                <select
                  className="w-full p-2 mt-2 bg-black border border-gray-600 rounded-md text-sm"
                  value={expiryType}
                  onChange={(e) => setExpiryType(e.target.value)}
                >
                  <option value="permanent">Permanent</option>
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>

                {expiryType !== "permanent" && (
                  <input
                    type="number"
                    className="w-full p-2 mt-2 bg-black border border-gray-600 rounded-md text-sm"
                    placeholder={`Enter number of ${expiryType}`}
                    value={expiryDuration || ""}
                    onChange={(e) => setExpiryDuration(Number(e.target.value))}
                  />
                )}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button onClick={handleToggleBan} className="bg-red-600 hover:bg-red-700 font-normal" disabled={isLoading}>
              {isLoading ? "Processing..." : isBanned ? "Unban" : "Confirm Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
