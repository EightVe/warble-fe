"use client"

import { useState, useEffect } from "react"

interface ImageWithLoadingProps {
  src: string
  alt: string
  className?: string
  placeholderColor?: string
}

export default function ImageWithLoading({
  src,
  alt,
  className = "",
  placeholderColor = "bg-gray-300/20",
}: ImageWithLoadingProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  useEffect(() => {
    // Reset loading state when src changes
    setIsLoaded(false)

    // Preload the image
    const img = new Image()
    img.src = src
    img.onload = () => {
      setImgSrc(src)
      setIsLoaded(true)
    }
    img.onerror = () => {
      // If image fails to load, show placeholder
      console.error(`Failed to load image: ${src}`)
      setIsLoaded(false)
    }

    return () => {
      // Clean up
      img.onload = null
      img.onerror = null
    }
  }, [src])

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
        />
      )}
    </>
  )
}

