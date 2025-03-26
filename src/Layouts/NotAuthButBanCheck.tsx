import { useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader, Loader2 } from 'lucide-react';
import AuthBG from "@/assets/img/mainLogo.png";
import { useNavigate } from 'react-router-dom';
import BanStatusPage from '@/lib/ban-status-page';
const NotAuthButBanCheck = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useContext(AuthContext) || {};
  if (user?.isBanned) return <BanStatusPage />;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 top-0">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
         
          <div className="absolute inset-2 border-4 border-t-[#ff5757] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-r-[#ff5757] border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
          <div className="absolute inset-6 border-4 border-b-[#ff5757] border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
          <div className="absolute inset-8 border-4 border-l-[#ff5757] border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
        </div>
        <div className="mt-4 text-[#ff5757] font-mono text-sm tracking-wider">LOADING</div>
        <div className=" text-[#ff5757] font-mono text-[10px] tracking-wider animate-pulse">WARBLE</div>
      </div>
    </div>
    );
  }

  return <>{children}</>;
};

export default NotAuthButBanCheck;
