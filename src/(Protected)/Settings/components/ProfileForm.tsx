"use client"

import { useContext, useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit, TriangleAlert, CheckCircle, Loader, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AuthContext } from '@/contexts/AuthContext';
import { uploadImageToFirebase } from '@/lib/firebaseUtils';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axiosInstance';
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
interface FormData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    bio: string;
    avatar: string;
}

export default function ProfileForm() {
    const [progress, setProgress] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const { user, setUser } = useContext(AuthContext) || {};
    const [formData, setFormData] = useState<FormData>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
        bio: user?.bio || '',
        avatar: user?.avatar || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/user/edit-profile', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
            });

            const { data } = response;

            if (response.status === 200) {
                setUser && setUser(data.user as any);
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                }, 3000);
            } else {
                toast.error("Session Expired! Please Refresh The Page.");
            }
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        setUploading(true);
    
        try {
            const url = await uploadImageToFirebase(file, setProgress, setUploading);
            const updatedUser = { ...user, avatar: url };
    
            // Update the user in the backend
            const response = await axiosInstance.post('/user/edit-profile', updatedUser, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
            });
    
            if (response.status === 200) {
                setUser && setUser(updatedUser as any);
                setFormData((prevData) => ({ ...prevData, avatar: url }));
                toast.success('Profile picture updated successfully');
            } else {
                toast.error('Failed to update profile picture on the server');
            }
        } catch (error) {
            toast.error('Failed to upload image');
            console.error('Image upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="pt-4">
        <motion.section
          className=""
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex flex-col gap-4 w-full"
            variants={itemVariants}
          >
            <motion.div className="" variants={itemVariants}>
            <div className="w-full">
      <div className="h-48 rounded-t-2xl bg-gray-300 relative">
        {/* Banner Upload Button */}
        <div className="absolute top-4 right-4">
          <input type="file" id="banner-input" className="hidden" accept="image/*" />
          <Button
            size="sm"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={() => document.getElementById("banner-input")?.click()}
          >
            <Upload className="h-4 w-4" />
            <span className="ml-2">Upload Banner</span>
          </Button>
        </div>

        {/* Profile Section */}
        <div className="absolute -bottom-16 left-8 flex items-end gap-4">
          {/* Avatar with Upload Button */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
              <img src={user?.avatar} alt="Profile" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0">
            <input 
                    type="file" 
                    id="file-input" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                   <Button size="sm" className="rounded-full bg-[#ff5757] hover:bg-[#ff5757] cursor-pointer font-normal" onClick={() => document.getElementById('file-input')?.click()} disabled={uploading}>
                      {uploading ? (
                        <Loader className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <span className='flex items-center gap-2 justify-center'><Upload className='h-5 w-5 text-white'/></span>
                      )}
                    </Button>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <Label className="text-xl font-normal capitalize">{user?.firstName} {user?.lastName}</Label>
            </div>
            <p className="text-sm text-gray-500">{user?.city || "Unknown"}, {user?.country || "Unknown"}</p>
          </div>
        </div>
      </div>
      <div className="h-16" />
    </div>
            </motion.div>
             
            <motion.div className=" pt-4" variants={itemVariants}>
                <div className='w-full flex items-start justify-between gap-2 flex-col md:flex-row'>
                  <Label className="flex items-center justify-between text-gray-800 font-normal text-base">Personal Information 
                        </Label>
              <Card className=" p-4 bg-[#ff57571e] border border-[#ff575733] shadow-none w-full md:w-md xl:w-2xl 3xl:w-6xl">
              <div className='flex items-center justify-between'>
                <p></p>
              <Button size="sm" className="bg-[#ff5757] font-normal hover:bg-[#ff5757] h-8" onClick={() => setIsEditing(!isEditing)}>
                      {uploading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className='flex items-center gap-2 justify-center text-gray-50'><Edit className='h-5 w-5'/>Edit</span>
                      )}
                    </Button>
              </div>
                <AnimatePresence initial={false}>
                  {isEditing ? (
                    <motion.div
                      key="inputs"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center gap-4 pt-2">
                        <div className="w-full">
                          <Label htmlFor="firstName" className="text-xs text-gray-900 font-normal">First Name</Label>
                          <Input className='h-9 px-4 py-3 transition-all duration-200 text-gray-600 bg-[#ffffff94] border-none outline-0 ring-0 outline-none' id="firstName" name="firstName" type="text" placeholder={user?.firstName || "Enter first name"} value={formData.firstName} onChange={handleChange} disabled={isLoading}/>
                        </div>
                        <div className="w-full">
                          <Label htmlFor="lastName" className="text-xs text-gray-900 font-normal">Last Name</Label>
                          <Input className='h-9 px-4 py-3 transition-all duration-200 text-gray-600 bg-[#ffffff94] border-none outline-0 ring-0' id="lastName" name="lastName" type="text" placeholder={user?.lastName || "Enter last name"} value={formData.lastName} onChange={handleChange} disabled={isLoading}/>
                        </div>
                      </div>
                      <Separator className="mt-4 bg-orange-300/25"/>
                      <p className='flex items-center gap-1 text-gray-500/80 text-xs pt-3'><TriangleAlert className='h-4 w-4'/>The following information's cannot be updated.</p>
                      <div className="w-full rounded-md mt-2">
                        <Label htmlFor="username" className="text-xs text-gray-900 font-normal">Username</Label>
                        <div className="relative">
                          <Input 
                            type="text" 
                            value={user?.username}
                            className='h-9 px-4 py-3 transition-all duration-200 text-gray-600 bg-[#ffffff94] border-none outline-0 ring-0 lowercase'
                            disabled
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-2 rounded-md ">
                        <div className="w-full">
                          <Label htmlFor="country" className="text-xs text-gray-900 font-normal">Country</Label>
                          <Input id="country" name="country" type="text" disabled value={user?.city || "Unknown"}   className='h-9 px-4 py-3 transition-all duration-200 text-gray-600 bg-[#ffffff94] border-none outline-0 ring-0'/>
                        </div>
                        <div className="w-full">
                          <Label htmlFor="city" className="text-xs text-gray-900 font-normal">City</Label>
                          <Input id="city" name="city" type="text" disabled value={user?.country || "Unknown"}   className='h-9 px-4 py-3 transition-all duration-200 text-gray-600 bg-[#ffffff94] border-none outline-0 ring-0'/>
                        </div>
                      </div>
                      <Separator className="mt-4 bg-orange-300/25"/>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="w-full">
                          <Label htmlFor="phoneNumber" className="text-xs text-gray-900 font-normal">Phone Number</Label>
                          <Input id="phoneNumber" name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} disabled={isLoading}   className='h-9 px-4 py-3 transition-all duration-200 text-gray-600 bg-[#ffffff94]  border-none outline-0 ring-0'/>
                        </div>
                      </div>
                      <div>
                        <Label className="flex items-center justify-between my-3 text-gray-900 font-normal text-xs">Bio</Label>
                        <Textarea className="outline-none mt-1
                        px-4 py-3 transition-all duration-200 text-gray-600 bg-[#ffffff94]  border-none outline-0 ring-0" placeholder="Enter your bio" name="bio" value={formData.bio} onChange={handleChange} disabled={isLoading}/>
                      </div>
                      <div className="w-full mt-3">
                        
                        {showSuccess ? (
          <Button className=" bg-green-500 font-normal text-gray-50 w-full h-8" size="sm" disabled>
          <CheckCircle className="mr-2 h-4 w-4" />
        Changes Saved Successfully
                  </Button>
      ) : (
        <Button className="w-full bg-[#ff5757] font-normal hover:bg-[#ff5757] text-gray-50 h-8" size="sm" onClick={handleSaveChanges} disabled={isLoading}>
                          {isLoading && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )} Save Changes
                        </Button>
      )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center gap-4 pt-2">
                        <div className="w-full">
                          <Label className="text-[14px] font-normal text-gray-900">First Name</Label>
                          <p className="text-sm font-normal flex justify-between text-gray-600/80 items-center">{user?.firstName}</p>
                        </div>
                        <div className="w-full">
                          <Label className="text-[14px] font-normal text-gray-900">Last Name</Label>
                          <p className="text-sm font-normal flex justify-between text-gray-600/80 items-center">{user?.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="w-full">
                          <Label className="text-[14px] font-normal text-gray-900">City</Label>
                          <p className="text-sm font-normal flex justify-between text-gray-600/80 items-center">{user?.city || "Unknown"}</p>
                        </div>
                        <div className="w-full">
                          <Label className="text-[14px] font-normal text-gray-900">Country</Label>
                          <p className="text-sm font-normal flex justify-between text-gray-600/80 items-center">{user?.country || "Unknown"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="w-full">
                          <Label className="text-[14px] font-normal text-gray-900">Phone Number</Label>
                          <p className="text-sm font-normal flex justify-between text-gray-600/80 items-center">{user?.phoneNumber || "Unknown"}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[14px] font-normal text-gray-900 mt-6">Bio</Label>
                        <p className="text-sm text-gray-600/80 mt-1">{user?.bio || "No Bio Provided"}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
                </div>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    )
}
