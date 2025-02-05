import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FloatingInput } from "@/components/ui/floating-input"
import axiosInstance from "@/lib/axiosInstance";
import { Loader, Star, StarIcon } from "lucide-react";
import { useState } from "react"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const generateUsername = (firstName: string, lastName: string) => {
    const randomDigits = Math.floor(100 + Math.random() * 900); // Generates a 3-digit number
    return `${firstName}${lastName[0]}${randomDigits}`;
  };

  const validateForm = () => {
    const { firstName, lastName, emailAddress, password, confirmPassword } = formData;
    console.log(formData);
    if (!firstName || !lastName || !emailAddress || !password || !confirmPassword) {
      toast.error("All fields are required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      toast.error("Invalid email address");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    if (!validateForm()) return;

    try {
      setLoading(true);
      const username = generateUsername(formData.firstName, formData.lastName);
      const res = await axiosInstance.post('/auth/signup', {
        ...formData,
        username,
      });
      const data = res.data;
      if (data.success === false) {
        setLoading(false);
        toast.error("An Error Occurred");
        return;
      }
      setLoading(false);
      toast.success("Success!");
      navigate('/auth/login');
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <motion.form 
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <Card className="w-full max-w-sm space-y-4 p-6 bg-transparent border-none">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl text-gray-300 font-bold tracking-wider logofont">Veyastro
              </h1>
              <p className="text-sm text-gray-300">Create your account once, forever free!</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <motion.div className="space-y-2" variants={inputVariants}>
                  <FloatingInput
                    disabled={loading}
                    label="First Name"
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder=" "
                    value={formData.firstName || ""}
                    onChange={handleChange}
                  />
                </motion.div>
                <motion.div className="space-y-2" variants={inputVariants}>
                  <FloatingInput
                    disabled={loading}
                    label="Last Name"
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder=" "
                    value={formData.lastName || ""}
                    onChange={handleChange}
                  />
                </motion.div>
              </div>
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
                  label="Password"
                  id="password"
                  type="password"
                  name="password"
                  placeholder=" "
                  value={formData.password || ""}
                  onChange={handleChange}
                />
              </motion.div>
              <motion.div className="space-y-2" variants={inputVariants}>
                <FloatingInput
                  disabled={loading}
                  label="Repeat Password"
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder=" "
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                />
              </motion.div>
            </div>
            <motion.div variants={buttonVariants}>
              <Button className="text-gray-300 w-full font-normal bg-gradient-to-tl from-[#93a9ffc1] to-[#6b63ffc7] border-[#9c97ff] border-2 rounded-xl hover:bg-[#9c97ff] duration-200" disabled={loading} type="submit">
                {loading && (
                  <Loader className="h-4 w-4 animate-spin" />
                )}
                Sign Up
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
                Sign up with Google
              </Button>
            </motion.div>
            <div className="relative">
              <motion.div variants={buttonVariants} className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#5a617a86]" />
              </motion.div>
              <div className="relative flex justify-center text-xs uppercase">
              </div>
            </div>
            <p className="text-xs text-gray-300 text-center">Already have an account?{" "} <Link to="/auth/login" className="bg-gradient-to-tl from-[#93a9ff] to-[#6b63ffc7] hover:bg-[#9c97ff] text-transparent bg-clip-text">Log in</Link> </p>
          </Card>
        </motion.div>
      </motion.form>
    </div>
  )
}