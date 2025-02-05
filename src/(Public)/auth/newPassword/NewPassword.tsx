import AuthBG from "@/assets/img/bg1.webp";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axiosInstance";
import { CheckCircle, Loader } from "lucide-react";
import { useState, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }
};

const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } }
};

const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.6 } }
};

export default function NewPassword() {
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();
    const [loading,setLoading] =useState(false);
    const { token } = useParams();
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await axiosInstance.post('/verifications/reset-password', {
          token,
          newPassword,
        });
        toast.success('Password successfully reset.');
        navigate('/auth/login');
      } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An error occurred. Please try again.');
        }
        setLoading(false);
      }
    };
  

    return (
        <div className="flex min-h-screen w-full bg-[#0c0c14] items-center justify-between py-4 relative flex-col">
            <img src={AuthBG} width={1920} height={1080} alt="logo" className="opacity-[0.08] absolute bottom-0 z-5  md:translate-y-0 w-full h-full object-cover" />
            <div></div>
            <div className="flex w-full z-10 items-center justify-center">
                <div className="w-full max-w-md">
<div className="flex flex-1 items-center justify-center p-6">
      <motion.div
              initial="hidden"
              animate="visible">
          <motion.div variants={cardVariants}>
          <Card className="w-full max-w-sm space-y-4 p-6 bg-transparent border-none shadow-none">
            <div className="space-y-2 text-center">
            <h1 className="text-3xl text-gray-300 font-bold tracking-wide uppercase logofont">Veyastro</h1>
              <p className="text-sm text-gray-300">Please enter your new password!</p>
            <div className="space-y-4">
              <motion.div variants={inputVariants} className=" flex justify-center gap-2 items-center">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-xs">
                                    <div className="relative">
                                        <FloatingInput disabled={loading} label="New Password" id="newPassword" type="password" onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />
                                    </div>
                                    <div>
                                        <motion.div variants={buttonVariants}>
            <Button className="text-gray-300 w-full font-normal bg-gradient-to-tl from-[#93a9ffc1] to-[#6b63ffc7] border-[#9c97ff] border-2 rounded-xl hover:bg-[#9c97ff] duration-200" disabled={loading} type="submit">
            {loading && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
              Change Password
            </Button>
            </motion.div>
                                    </div>
                                </form>
              </motion.div>
            </div>
            </div>
          </Card>
          </motion.div>
      </motion.div>
    </div>

                </div>
            </div>
            <div className="text-gray-500 z-10 text-xs max-w-sm text-center">You acknowledge that you read, and agree to our
                <Link to="/legal/terms-of-use" className="text-gray-300"> Terms of Use</Link> and our <Link to="/legal/privacy-policy" className="text-gray-300">Privacy Policy</Link>
            </div>
        </div>
    );
}