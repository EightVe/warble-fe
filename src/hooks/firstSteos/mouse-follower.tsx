"use client";

import { useEffect, useState } from "react";

export function MouseFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div 
        className="fixed w-[300px] h-[300px] rounded-full pointer-events-none z-0 opacity-50 blur-[80px]"
        style={{
          background: "radial-gradient(circle, rgba(255,87,87,0.8) 0%, rgba(255,87,87,0) 70%)",
          left: position.x - 150,
          top: position.y - 150,
          transition: "left 0.5s cubic-bezier(0.23, 1, 0.32, 1), top 0.5s cubic-bezier(0.23, 1, 0.32, 1)"
        }}
      />
    </>
  );
}
