import React from "react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import { TriangleAlert } from "lucide-react";

interface ForceOpenNotificationProps {
  _id: string;
  title: string;
  description: string;
  AdminAnnouncement?: string;
  onClose: (id: string) => void; // ✅ Explicitly pass `id` for clarity
}

const ForceOpenNotification: React.FC<ForceOpenNotificationProps> = ({ _id, title, description, AdminAnnouncement, onClose }) => {
  const handleMarkAsRead = async () => {
    try {
      await axiosInstance.put(`/notifications/${_id}/markForceAsRead`);
      onClose(_id); // ✅ Pass `id` instead of calling `onClose()` directly
    } catch (error) {
      console.error("❌ Error marking force-open notification as read:", error);
    }
  };

  return (
    <div className="px-4">
      <div className="">

      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
              <svg className="size-6 text-[#ff5757]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-base text-[#ff5757]" id="modal-title">Comment Removed</h3>
              <div className="">
              <p className="text-sm text-gray-500">It seems that <span className="lowercase">{description}</span> due to violation in our policy and community guildlines. If you believe this action was taken by mistake, you may appeal.</p>
              </div>
            </div>
            
          </div>
        </div>
        <div className="bg-gray-50 text-start px-4 py-3 sm:flex sm:flex-col sm:px-6">
          <p className="text-[13px] text-gray-700">Comment Details</p>
          <div className="text-gray-500 text-[13px]">
            "{"ewqe"}"
          </div>
          <div className="text-gray-500 text-xs">
            Posted On : 13/21/24
          </div>
        </div>
        <div className="bg-gray-50 text-start px-4 py-3 sm:flex sm:flex-col sm:px-6 mt-2">
          <p className="text-[13px] text-gray-700">Violations</p>
          <div className="text-red-300 text-[13px]">
          Hate Speech, Profanity and Inappropriate Language.
          </div>
        </div>
        <div className="bg-white px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button onClick={handleMarkAsRead} type="button" className="transition-all duration-150 inline-flex w-full justify-center rounded-md bg-[#ff5757] px-3 py-2 text-sm text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto cursor-pointer">OK</button>
          <button type="button" className="transition-all duration-150 mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm text-gray-900 ring-1 ring-gray-300 cursor-pointer ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto">Appeal</button>
        </div>
      </div>

      </div>
    </div>
  );
};

export default ForceOpenNotification;
