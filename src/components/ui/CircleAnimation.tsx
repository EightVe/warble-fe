import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface CircleAnimationProps {
  type: "success" | "error";
  text: string;
}

const CircleAnimation = ({ type, text }: CircleAnimationProps) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
    }, 650); // Matches stroke animation duration

    return () => clearTimeout(timer);
  }, []);

  // Define colors based on type
  const color = type === "success" ? "#22c55e" : "#ff4d4d"; // Green or Red
  const Icon = type === "success" ? Check : X; // Check or X icon

  return (
    <motion.div className="flex flex-col items-center justify-center bg-[#fafafb] pt-6 rounded-2xl w-72"
    initial={{ scale: 0.5, opacity:0, visibility: "hidden" }}
    animate={{ scale: 1, opacity:1, visibility: "visible" }}
    transition={{ duration: 0.2, ease: "easeIn",}}>
      {/* Circle Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* SVG Circle Animation */}
        <svg className="w-18 h-18" viewBox="0 0 100 100">
          {/* Background Circle (Static) */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="#ccc" strokeWidth="5" opacity="0.3" />

          {/* Animated Circle (Progress) */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color} // Dynamic stroke color
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="251.2" // Full circumference: 2 * π * r
            strokeDashoffset="251.2"
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
          />
        </svg>

        {/* Icon Appears After Animation */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut", delay: 0.1 }}
            className="absolute flex items-center justify-center"
          >
            <Icon className={`w-9 h-9 ${type === "success" ? "text-green-500" : "text-red-500"}`} />
          </motion.div>
        )}
      </div>

      {/* Text Section with Reserved Space */}
      <div className="flex flex-col items-center text-center">
        {/* Custom Text Message */}
        <motion.p
          initial={{ opacity: 0, y: 20, visibility: "hidden" }}
          animate={{ opacity: 1, y: 0, visibility: "visible" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
          className={`text-sm mt-1 px-4 pb-6  ${type === "success" ? "text-gray-600" : "text-gray-600"}`}
        >
          {text}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default CircleAnimation;
