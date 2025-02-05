"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string; // Add id as a required prop
}

export function FloatingInput({ label, className, type, value, onChange, id, ...props }: FloatingInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const shouldFloat = isFocused || value.length > 0;

  return (
    <div className="relative">
      <input
        {...props}
        id={id}
        type={type}
        className={cn(
          "w-full h-13 px-4 pt-6 pb-2 rounded-xl transition-all duration-200 text-gray-300 bg-[#5a617a2a] outline-none",
          shouldFloat ? "pt-6" : "pt-4",
          className,
        )}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
            />
      <AnimatePresence>
        <motion.label
          htmlFor={id}
          className={cn(
            "absolute left-4 pointer-events-none text-gray-300 capitalize",
            shouldFloat ? "text-xs " : "text-[14px]",
          )}
          initial={{ y: 16, scale: 1, opacity: 0.7 }}
          animate={{
            y: shouldFloat ? 7 : 12,
            scale: shouldFloat ? 1 : 1,
            opacity: shouldFloat ? 1 : 0.7,
          }}
          transition={{
            duration: 0.1,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {label}
        </motion.label>
      </AnimatePresence>
    </div>
  )
}