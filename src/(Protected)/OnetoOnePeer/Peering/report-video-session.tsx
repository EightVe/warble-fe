"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { uploadImageToFirebase } from "@/lib/firebaseUtils"
import { AlertTriangle, Camera, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import axiosInstance from "@/lib/axiosInstance"

interface ReportVideoSessionProps {
  isOpen: boolean
  onClose: () => void
  reportedUser: any
  reportedByWho: any
  remoteVideoRef: React.RefObject<HTMLVideoElement>
}

export default function ReportVideoSession({
  isOpen,
  onClose,
  reportedUser,
  reportedByWho,
  remoteVideoRef,
}: ReportVideoSessionProps) {
  const [severity, setSeverity] = useState("medium")
  const [reason, setReason] = useState("inappropriate")
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasAutoScreenshot, setHasAutoScreenshot] = useState(false)

  const reportTypes = [
    { value: "inappropriate", label: "Inappropriate Content", defaultSeverity: "low" },
    { value: "harassment", label: "Harassment", defaultSeverity: "medium" },
    { value: "spam", label: "Spam", defaultSeverity: "low" },
    { value: "underage", label: "Underage User", defaultSeverity: "high" },
    { value: "other", label: "Other", defaultSeverity: "medium" },
  ]

  // Update severity automatically when report type changes
  useEffect(() => {
    const selectedType = reportTypes.find((item) => item.value === reason)
    if (selectedType) {
      setSeverity(selectedType.defaultSeverity)
    }
  }, [reason])

  // Automatically take screenshot when dialog opens
  useEffect(() => {
    if (isOpen && !hasAutoScreenshot && !screenshot && remoteVideoRef.current) {
      // Small delay to ensure video is ready
      const timer = setTimeout(() => {
        takeScreenshot()
        setHasAutoScreenshot(true)
      }, 500)

      return () => clearTimeout(timer)
    }

    // Reset the flag when dialog closes
    if (!isOpen) {
      setHasAutoScreenshot(false)
    }
  }, [isOpen, hasAutoScreenshot, screenshot])

  const takeScreenshot = async () => {
    if (!remoteVideoRef.current || !canvasRef.current) return

    setIsTakingScreenshot(true)

    try {
      const video = remoteVideoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame on the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob as Blob)
          },
          "image/jpeg",
          0.85,
        )
      })

      // Create a File object from the blob
      const file = new File([blob], "report-screenshot.jpg", { type: "image/jpeg" })

      // Upload to Firebase
      const url = await uploadImageToFirebase(file, setUploadProgress, setIsTakingScreenshot)
      setScreenshot(url)
      toast.success(hasAutoScreenshot ? "Screenshot captured automatically" : "Screenshot captured successfully")
    } catch (error) {
      console.error("Error taking screenshot:", error)
      toast.error("Failed to capture screenshot")
    } finally {
      setIsTakingScreenshot(false)
    }
  }

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please provide a reason for the report")
      return
    }

    setIsSubmitting(true)

    try {
      const reportData = {
        reportedUser,
        reportedByWho,
        reason,
        screenshot,
        severity,
        type: "videosession",
      }

      const response = await axiosInstance.post("/report/submit-report", reportData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.status === 201) {
        toast.success("Report submitted successfully")
        onClose()
      } else {
        throw new Error("Failed to submit report")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      toast.error("Failed to submit report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#110e0e] border-[#252525] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white font-normal text-sm">
            <AlertTriangle className="h-4 w-4 text-[#ff5757]" />
            Report User

          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="report-type" className="text-white font-normal">
              Reason
              
            </Label>
<div className="flex items-center gap-4">
<Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="report-type" className="bg-[#1f1f1f] border-[#252525] text-white text-xs cursor-pointer">
                <SelectValue placeholder="Select type of report" />
              </SelectTrigger>
              <SelectContent className="bg-[#363636] border-[#252525] text-white text-xs">
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs cursor-pointer hover:bg-[#00000075]">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 text-xs capitalize">
  <div 
    className={`h-1.5 w-1.5 rounded-full ${
      severity === "low" ? "bg-[#5795ff]" : 
      severity === "medium" ? "bg-[#ffad33]" : 
      "bg-[#ff5757]"
    }`}
  ></div>
  {severity}
</div>
</div>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label className="text-white font-normal text-sm">Screenshot</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={takeScreenshot}
                disabled={isTakingScreenshot}
                className="bg-[#1f1f1f] font-normal text-[13px] border-[#252525] text-white hover:bg-[#252525] hover:text-[#ff5757]"
              >
                {isTakingScreenshot ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : "Capturing..."}
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Capture
                  </>
                )}
              </Button>
            </div>

            <div className="relative mt-2 rounded-md overflow-hidden bg-[#1f1f1f] border border-[#252525] aspect-video flex items-center justify-center">
              {screenshot ? (
                <>
                  <img
                    src={screenshot || "/placeholder.svg"}
                    alt="Screenshot"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={() => setScreenshot(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <div className="text-gray-400 text-sm text-center p-4">
                  {isTakingScreenshot ? "Processing..." : "No screenshot captured yet"}
                </div>
              )}
            </div>

            {/* Hidden canvas for taking screenshots */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white font-normal">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="sm"
            className="bg-[#ff5757] text-white hover:bg-[#ff5757]/80 font-normal"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

