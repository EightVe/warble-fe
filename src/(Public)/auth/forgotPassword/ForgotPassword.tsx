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
      <div className="flex min-h-screen w-full bg-[#110e0e] items-center justify-between py-4 relative flex-col overflow-hidden">
      <div className="glowing-div absolute top-32 right-64 opacity-35 lg:opacity-15 h-96 rotate-45 inset-0"></div>
    <div className="glowing-div absolute top-0 h-96 opacity-35 lg:opacity-15 inset-0"></div>
    <div className="glowing-div absolute bottom-0 left-36 opacity-35 lg:opacity-15 h-96 rotate-12 inset-0"></div>
<div className="flex items-center"><p className="logofont text-[#ff7474] text-2xl">warble.</p></div>
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
            <CheckCircle className='text-green-300 h-10 w-10'/>
            <p className='text-gray-400 text-xs'>A reset link has been sent to your email please check your inbox and your spam folder.</p>
          </div>
        </Card>
        </motion.div>
        ) : (
          <motion.div variants={cardVariants}>
          <Card className="w-full max-w-sm space-y-4 p-6 bg-transparent border-none shadow-none">
            <div className="space-y-2 text-center">
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
            <Button className="w-full text-gray-300 font-normal bg-gradient-to-tl from-[#ff078fa5] to-[#ff2941a5] border-[#ff575748] border-2 rounded-xl hover:bg-[#ff575769] duration-200" disabled={loading} type="submit">
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
                          You remembered it? <Link to="/auth/login" className="bg-gradient-to-tl from-[#ff5757] to-[#ff5757] hover:bg-[#ff5757] text-transparent bg-clip-text">Log In instead</Link>
                        </p>
          </Card>
          </motion.div>
        )}
      </motion.div>
    </div>

                </div>
            </div>
            <div className="text-gray-300 z-10 text-xs max-w-sm text-center">You acknowledge that you read, and agree to our 
        <Link to="/legal/terms-of-use" className="text-[#ff7474]"> Terms of Use</Link> and our <Link to="/legal/privacy-policy" className="text-[#ff7474]">Privacy Policy</Link>
      </div>
        </div>
    );
}