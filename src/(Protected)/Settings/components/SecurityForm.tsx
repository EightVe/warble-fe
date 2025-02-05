import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { AuthContext } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: {
      delayChildren: 0.3, staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
export default function SecurityForm() {
    const { user } = useContext(AuthContext) || {};
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
    useEffect(() => {
      setTwoFactorEnabled(user?.twoFactorEnabled);
    }, [user]);
  
    const handleToggleTwoFac = async () => {
      const loadingToastId = toast.loading('Processing...');
      try {
        const endpoint = twoFactorEnabled ? '/user/disable-twofac' : '/user/enable-twofac';
        const response = await axiosInstance.post(endpoint, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
  
        setTwoFactorEnabled(!twoFactorEnabled);
        window.location.reload();
      } catch (error) {
        toast.error('Session expired please refresh the page.', {
          id: loadingToastId,
        });
        console.error('Error toggling 2FA:', error);
      }
    };
  return (
    <div className=" pt-4">
      <motion.section
        className=""
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex flex-col gap-4 justify-center items-center w-full"
          variants={itemVariants}
        > 
          <motion.div className="w-full" variants={itemVariants}>
            <div className='flex justify-between items-center'>
              <div>
                <Label className='font-normal text-gray-600'>Two-factor authentication</Label>
                <p className="text-gray-500 text-[13px] w-[80%] md:w-full">We send you an OTP code to your email address each time you log in</p>
              </div>
              <div 
                className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-gray-300 rounded-full ${twoFactorEnabled ? 'bg-green-500' : ''}`}
                onClick={handleToggleTwoFac}
              >
                <span 
                  className={`absolute left-0 w-6 h-6 transition-transform transform bg-white rounded-full shadow ${twoFactorEnabled ? 'translate-x-6' : ''}`}
                ></span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  )
}
