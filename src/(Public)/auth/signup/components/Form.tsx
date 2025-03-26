"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FloatingInput } from "@/components/ui/floating-input"
import axiosInstance from "@/lib/axiosInstance"
import { Loader } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { motion } from "framer-motion"

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

export default function SignupForm() {
  const [formData, setFormData] = useState<{ [key: string]: string }>({ gender: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const generateUsername = (firstName: string, lastName: string) => {
    const randomDigits = Math.floor(100 + Math.random() * 900);
    return `${firstName}${lastName[0]}${randomDigits}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = new Date(e.target.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }
    setFormData({
      ...formData,
      userBirthDate: e.target.value,
      userAge: age.toString(),
    });
  };

  const validateForm = () => {
    const { firstName, lastName, emailAddress, password, confirmPassword } = formData;
    if (!firstName || !lastName || !emailAddress || !password || !confirmPassword) {
      toast.error("All fields are required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
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
    if (!validateForm()) return;
    try {
      setLoading(true);
      const username = generateUsername(formData.firstName, formData.lastName);

      // Sign Up Request
      const signupRes = await axiosInstance.post('/auth/signup', { ...formData, username });
      if (signupRes.data.success === false) {
        setLoading(false);
        toast.error("An Error Occurred");
        return;
      }

      // Log In Automatically After Sign-Up
      const loginRes = await axiosInstance.post('/auth/login', {
        emailAddress: formData.emailAddress,
        password: formData.password
      });

      if (loginRes.status === 200) {
        const { token } = loginRes.data;
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setLoading(false);
        window.location.href = "/";
      } else {
        setLoading(false);
        toast.error("Login failed after sign-up. Please try logging in manually.");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response?.data?.message || "An Error Occurred");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <motion.form onSubmit={handleSubmit} initial="hidden" animate="visible">
        <motion.div variants={cardVariants}>
          <Card className="w-full max-w-sm space-y-4 p-6 bg-transparent border-none">
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-300">Create your account once, forever free!</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <motion.div className="space-y-2" variants={inputVariants}>
                  <FloatingInput label="First Name" id="firstName" type="text" value={formData.firstName || ""} onChange={handleChange} />
                </motion.div>
                <motion.div className="space-y-2" variants={inputVariants}>
                  <FloatingInput label="Last Name" id="lastName" type="text" value={formData.lastName || ""} onChange={handleChange} />
                </motion.div>
              </div>
              <motion.div className="space-y-2" variants={inputVariants}>
                <FloatingInput label="Email Address" id="emailAddress" type="email" value={formData.emailAddress || ""} onChange={handleChange} />
              </motion.div>
              <motion.div className="space-y-2" variants={inputVariants}>
                <FloatingInput label="Password" id="password" type="password" value={formData.password || ""} onChange={handleChange} />
              </motion.div>
              <motion.div className="space-y-2" variants={inputVariants}>
                <FloatingInput label="Repeat Password" id="confirmPassword" type="password" value={formData.confirmPassword || ""} onChange={handleChange} />
              </motion.div>
            </div>
            <motion.div variants={buttonVariants}>
              <Button className="w-full bg-gradient-to-tl from-[#ff078fa5] to-[#ff2941a5] border-[#ff575748] border-2 rounded-xl" disabled={loading} type="submit">
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </motion.div>
            <p className="text-xs text-gray-300 text-center">
              Already have an account? <Link to="/auth/login" className="text-red-500">Log in</Link>
            </p>
          </Card>
        </motion.div>
      </motion.form>
    </div>
  )
}
