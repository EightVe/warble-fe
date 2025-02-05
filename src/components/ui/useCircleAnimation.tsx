import { useState } from "react";
import { createPortal } from "react-dom";
import CircleAnimation from "./CircleAnimation"; // Import the component

export const useCircleAnimation = () => {
  const [animation, setAnimation] = useState<{ type: "success" | "error" ; text: string } | null>(null);

  const triggerAnimation = (type: "success" | "error", text: string) => {
    setAnimation({ type, text });

    // Remove animation after 3 seconds
    setTimeout(() => {
      setAnimation(null);
    }, 3000);
  };

  return {
    triggerAnimation,
    AnimationComponent: animation
      ? createPortal(
          <div className="fixed top-0 z-[200] backdrop-blur-2xl h-screen w-full flex items-center justify-center bg-black/20">
            <CircleAnimation type={animation.type} text={animation.text} />
          </div>,
          document.body
        )
      : null,
  };
};
