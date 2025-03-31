import { useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader, Loader2 } from 'lucide-react';
import AuthBG from "@/assets/img/mainLogo.png";
import { useNavigate } from 'react-router-dom';
import BanStatusPage from '@/lib/ban-status-page';
import { motion } from "framer-motion";
import Logo from "@/assets/img/mainLogo.png"
const AuthBasedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isGettingUserInfo, isRefreshingToken } = useContext(AuthContext) || {};
  const router = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login and retain the current path for post-login navigation
        const currentPath = window.location.pathname;
        router(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
        toast.error('Unauthorized, Please Log In.');
      }
    }
  }, [user, loading, router]);
  if (user?.isBanned) return <BanStatusPage />;

  if (loading || isGettingUserInfo || isRefreshingToken || !user) {
    let message = 'INITIALIZING';
    if (isGettingUserInfo) {
      message = 'VALIDATING';
    } else if (isRefreshingToken) {
      message = 'R-TOKENS';
    }
    return (
<div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 top-0">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-1">
            <div className="h-7 w-7 rounded-lg bg-[#ff575748] flex items-center justify-center">
             <img src={Logo} loading="lazy" alt="Warble Logo" />
            </div>
            <span className="text-gray-200 font-medium text-base tracking-tighter leading-tight logofont">Warble.</span>
          </div>
        {/* LinkedIn-style Bar */}
        <div className="relative w-22 h-[3.5px] bg-zinc-300/30 mt-4 overflow-hidden rounded-full">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#ff5757] w-1/2 rounded-full"
            animate={{
              x: ["0%", "100%"],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.7,
              ease: "easeInOut",
            }}
          />
        </div>
        <p className='text-gray-400/80 text-xs pt-2'>{message}</p>
      </div>
    </div>
    );
  }

  return <>{children}</>;
};

export default AuthBasedLayout;
