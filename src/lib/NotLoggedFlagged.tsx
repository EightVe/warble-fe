import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ImageLogo from '@/assets/img/mainLogo.png';

export default function NotLoggedFlagged({ triggerElement, children }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Disable body scroll when modal is visible
        document.body.style.overflow = isVisible ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isVisible]);

    return (
        <>
            <div onClick={() => setIsVisible(true)} className="cursor-pointer">
                {triggerElement}
            </div>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeIn" }}
                        className="fixed inset-0 z-[99999999999999] flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="relative mb-4 p-4 border border-[#2c2b2b] bg-[#1a1717] w-full md:max-w-2xl mx-4 rounded-2xl pt-6 pb-0"
                        >
                            <button 
                                className="absolute top-4 right-4 text-gray-200 hover:bg-[#eaecef] hover:text-black p-2 rounded-full transition-all duration-150"
                                onClick={() => setIsVisible(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="w-full max-w-md mx-auto p-6 space-y-6">
                                {/* Icon */}
                                <div className="flex justify-center">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center animate-bounce">
                                        <img src={ImageLogo} className="h-8 w-8" alt="Logo" />
                                    </div>
                                </div>

                                {/* Heading */}
                                <div className="text-center space-y-1">
                                    <h2 className="text-xl text-gray-200 leading-tight tracking-tighter">
                                        Join the Warble Experience
                                    </h2>
                                    <p className="text-sm text-gray-300">
                                        Sign in to connect, chat, and explore endless conversations with ease.
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                                    <Link to="/auth/signup" className="w-full">
                                        <Button className="w-full h-11 bg-red-400 hover:bg-red-400/50 font-normal rounded-full">
                                            Sign in
                                        </Button>
                                    </Link>
                                    <div className="bg-red-400 h-2 w-2 rounded-full px-1 hidden md:block animate-bounce"></div>
                                    <Link to="/auth/login" className="w-full">
                                        <Button className="w-full h-11 bg-red-400 hover:bg-red-400/50 font-normal rounded-full">
                                            Log in
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}