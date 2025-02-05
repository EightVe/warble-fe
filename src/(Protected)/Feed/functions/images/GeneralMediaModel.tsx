import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface GeneralMediaModalProps {
  selectedMedia: string | null;
  selectedPostMedia: string[]; // ✅ Only media from the clicked post
  onClose: () => void;
  onSelectMedia: (media: string) => void;
}

const GeneralMediaModal: React.FC<GeneralMediaModalProps> = ({ selectedMedia, selectedPostMedia, onClose, onSelectMedia }) => {
  const [mainMediaLoaded, setMainMediaLoaded] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    setMainMediaLoaded(false);
  }, [selectedMedia]);

  if (!selectedMedia) return null;

  return (
    <div className="fixed inset-0 bg-black/25 flex flex-col items-center justify-center z-50">
      {/* ✅ Close Button */}
      <button className="absolute top-4 right-4 text-gray-900 cursor-pointer bg-gray-50 p-2 rounded-full" onClick={onClose}>
        <X size={28} />
      </button>

      <div className="relative w-full max-w-4xl p-4 flex flex-col items-center">
        {/* ✅ Main Media Loader */}
        {!mainMediaLoaded && (
          <div className="w-full max-h-[500px] max-w-[900px] bg-gray-300 animate-pulse rounded-2xl"></div>
        )}

        {/* ✅ Main Media */}
        {selectedMedia.includes(".mp4") ? (
          <video
            controls
            className={`w-full max-h-[500px] max-w-[900px] rounded-2xl transition-opacity duration-300 ${
              mainMediaLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoadedData={() => setMainMediaLoaded(true)}
          >
            <source src={selectedMedia} type="video/mp4" />
          </video>
        ) : (
          <img
            src={selectedMedia}
            className={`w-full max-h-[500px] max-w-[900px] rounded-2xl object-contain transition-opacity duration-300 ${
              mainMediaLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setMainMediaLoaded(true)}
          />
        )}

        {/* ✅ Thumbnails Only for Selected Post */}
        {selectedPostMedia.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {selectedPostMedia.map((media, index) => (
              <div
                key={index}
                className={`w-20 h-20 cursor-pointer border-2 ${
                  selectedMedia === media ? "border-[#ff5757]" : "border-transparent"
                } rounded-lg relative`}
                onClick={() => onSelectMedia(media)}
              >
                {/* ✅ Thumbnail Loader */}
                {!thumbnailLoaded[index] && (
                  <div className="absolute inset-0 w-full h-full bg-gray-300 animate-pulse rounded-lg"></div>
                )}

                {/* ✅ Thumbnail Media */}
                {media.includes(".mp4") ? (
                  <video
                    className={`w-full h-full rounded-lg object-cover transition-opacity duration-300 ${
                      thumbnailLoaded[index] ? "opacity-100" : "opacity-0"
                    }`}
                    onLoadedData={() => setThumbnailLoaded((prev) => ({ ...prev, [index]: true }))}
                  >
                    <source src={media} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={media}
                    className={`w-full h-full rounded-lg object-cover transition-opacity duration-300 ${
                      thumbnailLoaded[index] ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setThumbnailLoaded((prev) => ({ ...prev, [index]: true }))}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralMediaModal;
