"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function AnimatedWLogo() {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Start animation after component mounts
    setIsAnimating(true)

    // Set up animation loop
    const interval = setInterval(() => {
      setIsAnimating(false)
      setTimeout(() => setIsAnimating(true), 300)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  // SVG path for W shape
  const wPath = "M10,10 L30,90 L50,30 L70,90 L90,10"

  // Animation variants for the path drawing
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.5 },
      },
    },
  }

  // Animation variants for the glow effect
  const glowVariants = {
    dim: { filter: "drop-shadow(0 0 2px #ff5757) drop-shadow(0 0 5px #ff5757)" },
    bright: {
      filter: "drop-shadow(0 0 5px #ff5757) drop-shadow(0 0 10px #ff5757) drop-shadow(0 0 15px #ff5757)",
      transition: { duration: 1, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
  }

  // Animation variants for the background lines
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom: number) => ({
      pathLength: 1,
      opacity: [0, 0.5, 0.2],
      transition: {
        pathLength: { duration: 2, delay: custom * 0.3, ease: "easeInOut" },
        opacity: { duration: 2, delay: custom * 0.3, times: [0, 0.5, 1] },
      },
    }),
  }

  return (
    <div className="w-full h-full lg:flex items-center justify-center flex-col hidden">
      {/* 
        SIZE ADJUSTMENT:
        - Change the w-24 and h-24 classes for small screens
        - Change the md:w-32 and md:h-32 classes for medium screens
        - Change the lg:w-64 and lg:h-64 classes for large screens
      */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-64 lg:h-64">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          initial="dim"
          animate={isAnimating ? "bright" : "dim"}
          variants={glowVariants}
        >
          {/* Background grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.line
              key={`h-line-${i}`}
              x1="0"
              y1={20 * i + 10}
              x2="100"
              y2={20 * i + 10}
              stroke="#ff5757"
              strokeWidth="0.5"
              strokeDasharray="5,5"
              initial="hidden"
              animate={isAnimating ? "visible" : "hidden"}
              variants={lineVariants}
              custom={i}
              strokeOpacity="0.3"
            />
          ))}

          {Array.from({ length: 5 }).map((_, i) => (
            <motion.line
              key={`v-line-${i}`}
              x1={20 * i + 10}
              y1="0"
              x2={20 * i + 10}
              y2="100"
              stroke="#ff5757"
              strokeWidth="0.5"
              strokeDasharray="5,5"
              initial="hidden"
              animate={isAnimating ? "visible" : "hidden"}
              variants={lineVariants}
              custom={i}
              strokeOpacity="0.3"
            />
          ))}

          {/* 
            STROKE WIDTH ADJUSTMENT:
            - Increase or decrease the strokeWidth values below to make the W thicker or thinner
          */}
          {/* The main W path */}
          <motion.path
            d={wPath}
            fill="none"
            stroke="#ff5757"
            strokeWidth="3"
            initial="hidden"
            animate={isAnimating ? "visible" : "hidden"}
            variants={pathVariants}
          />

          {/* Glow effect path */}
          <motion.path
            d={wPath}
            fill="none"
            stroke="#ff5757"
            strokeWidth="1.5"
            initial="hidden"
            animate={isAnimating ? "visible" : "hidden"}
            variants={pathVariants}
          />

          {/* 
            PARTICLE SIZE ADJUSTMENT:
            - Change the r="2" value below to make the particles larger or smaller
          */}
          {/* Particles along the path */}
          {[0.2, 0.4, 0.6, 0.8].map((offset, i) => (
            <motion.circle
              key={`particle-${i}`}
              cx="0"
              cy="0"
              r="2"
              fill="#ff5757"
              initial={{ opacity: 0 }}
              animate={
                isAnimating
                  ? {
                      opacity: [0, 1, 0],
                      offsetDistance: [`${offset * 100}%`, "100%"],
                    }
                  : { opacity: 0 }
              }
              transition={{
                duration: 2 * (1 - offset),
                delay: 2 * offset,
                ease: "linear",
              }}
              style={{ offsetPath: `path('${wPath}')` }}
            />
          ))}
        </motion.svg>
      </div>
      <p className="text-[#b1b1b1] text-center text-[12px] pt-4 w-full">In order to start please click start matching.<br/> Remember you can report anyone at any time.<br/> We wish you a good "warbling".</p>
    </div>
  )
}

