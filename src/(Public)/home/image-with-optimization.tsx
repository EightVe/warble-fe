"use client"

import { useState, useEffect } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  placeholderColor?: string
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  placeholderColor = "bg-gray-300",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  useEffect(() => {
    // Reset loading state when src changes
    setIsLoaded(false)

    // Create optimized image URL if dimensions are provided
    const optimizedSrc = src

    // If you have an image optimization service, you could use it here
    // Example: if width and height are provided, you could use them to request a resized image
    // optimizedSrc = `https://your-image-service.com/resize?url=${encodeURIComponent(src)}&width=${width}&height=${height}`

    // Preload the image
    const img = new Image()
    img.src = optimizedSrc
    img.onload = () => {
      setImgSrc(optimizedSrc)
      setIsLoaded(true)
    }
    img.onerror = () => {
      console.error(`Failed to load image: ${optimizedSrc}`)
      setIsLoaded(false)
    }

    return () => {
      // Clean up
      img.onload = null
      img.onerror = null
    }
  }, [src, width, height])

  return (
    <>
      {/* Placeholder shown while loading */}
      <div
        className={`${className} ${placeholderColor} ${isLoaded ? "hidden" : "block"}`}
        style={{ height: "100%", width: "100%" }}
        aria-hidden="true"
      />

      {/* Actual image (hidden until loaded) */}
      {imgSrc && (
        <img
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          className={`${className} ${isLoaded ? "block" : "hidden"}`}
          loading="lazy"
          width={width}
          height={height}
        />
      )}
    </>
  )
}

