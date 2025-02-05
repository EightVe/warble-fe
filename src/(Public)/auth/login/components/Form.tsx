"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FloatingInput } from "@/components/ui/floating-input"
// import { Input } from "@/components/ui/input"
import { AuthContext } from "@/contexts/AuthContext"
import axiosInstance from "@/lib/axiosInstance"
import { motion } from 'framer-motion';
import { useContext, useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Loader } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Link } from "react-router-dom"

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

export default function Form() {
  const [formData, setFormData] = useState<{ emailAddress: string; password: string; otp: string; userId: string }>({ emailAddress: '', password: '', otp: '', userId: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(15);
  const authContext = useContext(AuthContext);
  const setUser = authContext?.setUser;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Use this hook to get query params
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length > 1) return;

    const newOtp = formData.otp.split('');
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp.join('') });

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (newOtp.join('').length === 6) {
      const customEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleOtpSubmit(customEvent);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (paste.length === 6) {
      setFormData({ ...formData, otp: paste });
      otpRefs.current.forEach((ref, index) => {
        if (ref) ref.value = paste[index];
      });
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    return password !== '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(formData.emailAddress)) {
      toast.error("Invalid email address");
      return;
    }
    if (!validatePassword(formData.password)) {
      toast.error("Please provide a valid password");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      if (response.status === 200 && response.data.twoFactorEnabled) {
        setOtpSent(true);
        setLoading(false);
        toast.success("OTP sent to your email");
        const userIdResponse = await axiosInstance.post('/auth/user-by-email', { emailAddress: formData.emailAddress });
        if (userIdResponse.status === 200) {
          setFormData({ ...formData, userId: userIdResponse.data.userId });
        }
      } else {
        const user = response.data.user;
        if (setUser) {
          setUser(user);
        }
        const { token } = response.data;
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setLoading(false);
        navigate(redirectTo);
        toast.success("Welcome Back!");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response?.data?.message || "An Error Occurred");
    }
  };
  const handleOTPResend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { emailAddress: formData.emailAddress, password: formData.password });
      if (response.status === 200) {
        setOtpSent(true);
        setLoading(false);
        setResendTimer(15);
        toast.success("OTP resent to your email");
        const userIdResponse = await axiosInstance.post('/auth/user-by-email', { emailAddress: formData.emailAddress });
        if (userIdResponse.status === 200) {
          setFormData({ ...formData, userId: userIdResponse.data.userId });
        }
        setResendTimer(15);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response?.data?.message || "An Error Occurred");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { userId: formData.userId, otp: formData.otp });
      const { token, user } = response.data;
      if (setUser) {
        setUser(user);
      }
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setLoading(false);
      navigate(redirectTo);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response?.data?.message || "An Error Occurred");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <motion.form onSubmit={otpSent ? handleOtpSubmit : handleSubmit}
              initial="hidden"
              animate="visible">
        {!otpSent ? (
        <motion.div variants={cardVariants}>
          <Card className="w-full max-w-sm space-y-4 p-6 bg-transparent border-none">
            <div className="space-y-2 text-center">
            <h1 className="text-3xl text-gray-300 font-bold tracking-wide uppercase logofont">Veyastro</h1>
              <p className="text-sm text-gray-300">Fill the informations bellow to log into your account</p>
            </div>
            <div className="space-y-4">
                <motion.div className="space-y-2" variants={inputVariants}>
                <FloatingInput
                  disabled={loading}
                  label="Email Address"
                  id="emailAddress"
                  type="email"
                  name="emailAddress"
                  placeholder=" "
                  value={formData.emailAddress || ""}
                  onChange={handleChange}
                />
              </motion.div>
                <motion.div className="space-y-2" variants={inputVariants}>
                <FloatingInput
                  disabled={loading}
                  label="password"
                  id="password"
                  type="password"
                  name="password"
                  placeholder=" "
                  value={formData.password || ""}
                  onChange={handleChange}
                />
                <Link to="/auth/password-reset" className="text-[13px] pb-0 w-full flex items-center justify-end bg-gradient-to-tl from-[#93a9ff] to-[#6b63ffc7] hover:bg-[#9c97ff] text-transparent bg-clip-text">Forgot Password?</Link>
              </motion.div>
            </div>
             <motion.div variants={buttonVariants}>
            <Button className="w-full text-gray-300 font-normal bg-gradient-to-tl from-[#93a9ffc1] to-[#6b63ffc7] border-[#9c97ff] border-2 rounded-xl hover:bg-[#9c97ff] duration-200" disabled={loading} type="submit">
              {loading && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
              Log In
            </Button>
            </motion.div>
            <div className="relative">
              <motion.div variants={buttonVariants} className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#5a617a86]" />
              </motion.div>
              <div className="relative flex justify-center text-xs uppercase">

              </div>
            </div>
                        <motion.div variants={buttonVariants}>
            <div className="flex items-center justify-center gap-4">
            <Button variant="outline" className="gap-2 font-normal bg-[#5a617a2a] border-[#5a617a6e] border rounded-xl hover:bg-[#5a617a6e] hover:text-gray-300 w-full text-gray-300" disabled={loading}>
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Log in with Google
        </Button>
            </div>
            </motion.div>
            <div className="relative">
              <motion.div variants={buttonVariants} className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#5a617a86]" />
              </motion.div>
            </div>
            <p className="text-xs text-gray-300 text-center pt-2">
              Don't have an account? <Link to="/auth/signup" className="bg-gradient-to-tl from-[#93a9ff] to-[#6b63ffc7] hover:bg-[#9c97ff] text-transparent bg-clip-text">Sign Up</Link>
            </p>
          </Card>
          </motion.div>
        ) : (
          <motion.div variants={cardVariants}>
          <Card className="w-full max-w-sm space-y-4 p-6 bg-transparent border-none">
            <div className="space-y-2 text-center">
            <h1 className="text-3xl text-gray-300 font-bold tracking-wide uppercase logofont">Veyastro</h1>
              <p className="text-sm text-gray-300">It seems like two factor authentication is enabled! please enter the code sent to your email address.</p>
            <div className="space-y-4">
              <motion.div variants={inputVariants} className=" flex justify-center gap-2 items-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    disabled={loading}
                    id={`otp-${index}`}
                    name={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    className="w-10 h-10 text-center rounded-xl transition-all duration-200 text-gray-300 bg-[#5a617a2a] outline-none"
                    onChange={(e) => handleOtpChange(e, index)}
                    onPaste={handleOtpPaste}
                    aria-label={`OTP ${index + 1}`}
                  />
                ))}
              </motion.div>
            </div>
            </div>
            <motion.div variants={buttonVariants}>
            <Button className="text-gray-300 w-full font-normal bg-gradient-to-tl from-[#93a9ffc1] to-[#6b63ffc7] border-[#9c97ff] border-2 rounded-xl hover:bg-[#9c97ff] duration-200" disabled={loading} type="submit">
            {loading && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
            </motion.div>
            <div className="relative">
              <motion.div variants={buttonVariants} className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#5a617a86]" />
              </motion.div>
            </div>
            <p className="text-xs text-gray-300 text-center pt-2 flex items-center justify-center gap-1"> 
              Didn't receive code? {resendTimer > 0 ? (
                <span className="bg-gradient-to-tl from-[#93a9ff] to-[#6b63ffc7] hover:bg-[#9c97ff] text-transparent bg-clip-text">Resend in {resendTimer}s</span>
              ) : (
                <button onClick={(e) => handleOTPResend(e)} className="bg-gradient-to-tl from-[#93a9ff] to-[#6b63ffc7] hover:bg-[#9c97ff] text-transparent bg-clip-text">Resend</button>
              )}
            </p>
          </Card>
          </motion.div>
        )}
      </motion.form>
    </div>
  )
}