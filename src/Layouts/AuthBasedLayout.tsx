import { useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import AuthBG from "@/assets/img/bg7.webp";
import { useNavigate } from 'react-router-dom';
const AuthBasedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isGettingUserInfo, isRefreshingToken } = useContext(AuthContext) || {};
  const router = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Get the current URL and append it to the login URL
        const currentPath = window.location.pathname;
        router(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
        toast.error('Unauthorized, Please Log In.');
      }
    }
  }, [user, loading, router]);

  if (loading || isGettingUserInfo || isRefreshingToken || !user) {
    let message = 'Getting things ready...';
    if (isGettingUserInfo) {
      message = 'Validating Informations...';
    } else if (isRefreshingToken) {
      message = 'Refreshing Tokens...';
    }

    return (
      <div className="h-screen w-full fixed overflow-hidden z-50 top-0 flex gap-2 justify-center items-center bg-[#0c0c14]">
        <Loader className="h-6 w-6 animate-spin text-white" />
        <p className='text-gray-200 text-xs'>{message}</p>
        <img 
          src={AuthBG} 
          alt="logo" 
          className="object-cover opacity-[0.05] absolute inset-0 -z-5 "
        />
        <div className="glowing-div absolute top-32 right-64 opacity-35 lg:opacity-15 h-96 rotate-45"></div>
        <div className="glowing-div absolute top-0 h-96 opacity-35 lg:opacity-15"></div>
        <div className="glowing-div absolute bottom-0 left-36 opacity-35 lg:opacity-15 h-96 rotate-12"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthBasedLayout;
