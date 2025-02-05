import AuthBG from "@/assets/img/bg1.webp";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axiosInstance";
import { CheckCircle, Loader } from "lucide-react";
import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
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

export default function ForgotPassword() {
    const [emailAddress, setEmailAddress] = useState<string>('');
    const [emailAddressSent, setEmailAddressSent] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const data = { emailAddress };
        setLoading(true);
        try {
            const response = await axiosInstance.post('/verifications/forgot-password', data);

            if (response.status === 200) {
                setEmailAddressSent(true);
                setLoading(false);
            } else {
                toast.error(response.data.message);
                setLoading(false);
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
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
        {emailAddressSent ? (
        <motion.div variants={cardVariants}>
        <Card className="w-full max-w-sm space-y-4 p-6 bg-transparent border-none shadow-none">
          <div className="space-y-2 text-center flex flex-col items-center">
          <h1 className="text-3xl text-gray-300 font-bold tracking-wide uppercase logofont">Veyastro</h1>
            <CheckCircle className='text-indigo-300 h-10 w-10'/>
            <p className='text-gray-400 text-xs'>A reset link has been sent to your email please check your inbox and your spam folder.</p>
          </div>
        </Card>
        </motion.div>
        ) : (
          <motion.div variants={cardVariants}>
          <Card className="w-full max-w-sm space-y-4 p-6 bg-transparent border-none shadow-none">
            <div className="space-y-2 text-center">
            <h1 className="text-3xl text-gray-300 font-bold tracking-wide uppercase logofont">Veyastro</h1>
              <p className="text-sm text-gray-300">Forgot your password? No worries, we got you! <br/> Enter your email address to reset your password</p>
            <div className="space-y-4">
              <motion.div variants={inputVariants} className=" flex justify-center gap-2 items-center">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-xs">
                                    <div className="relative">
                                        <FloatingInput label="Email Address" id="emailAddress" type="email" className="" value={emailAddress} disabled={loading}
                                            onChange={(e) => setEmailAddress(e.target.value)} />
                                    </div>
                                    <div>
                                        <motion.div variants={buttonVariants}>
            <Button className="text-gray-300 w-full font-normal bg-gradient-to-tl from-[#93a9ffc1] to-[#6b63ffc7] border-[#9c97ff] border-2 rounded-xl hover:bg-[#9c97ff] duration-200" disabled={loading} type="submit">
            {loading && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
              Send Reset Link
            </Button>
            </motion.div>
                                    </div>
                                </form>
              </motion.div>
            </div>
            </div>
                        <div className="relative">
                          <motion.div variants={buttonVariants} className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#5a617a86]" />
                          </motion.div>
                        </div>
                        <p className="text-xs text-gray-300 text-center pt-2">
                          You remembered it? <Link to="/auth/login" className="bg-gradient-to-tl from-[#93a9ff] to-[#6b63ffc7] hover:bg-[#9c97ff] text-transparent bg-clip-text">Log In instead</Link>
                        </p>
          </Card>
          </motion.div>
        )}
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