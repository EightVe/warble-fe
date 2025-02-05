import React, { useContext, useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Circle, CircleX, Delete, Edit, Loader, Trash2, TriangleAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CustomLink from '@/hooks/useLink';
import { AuthContext } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from 'sonner';
import axiosInstance from '@/lib/axiosInstance';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delayChildren: 0.3, staggerChildren: 0.2 } },
};

const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface FormData {
    emailAddress: string;
    currentPassword: string;
    newPassword: string;
}

export default function AccountForm() {
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [formData, setFormData] = useState<FormData>({ emailAddress: '', currentPassword: '', newPassword: '' });
    const [loading, setLoading] = useState(false);
    const { user, setUser, logout } = useContext(AuthContext) || {};
    const [showSuccess, setShowSuccess] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            // Validate email format
            if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
                toast.error('Invalid email format');
                setLoading(false);
                return;
            }

            const response = await axiosInstance.post('/user/edit-account', {
                emailAddress: formData.emailAddress || user?.emailAddress,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            setUser && setUser(response.data.user as any);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'An error occurred');
        }
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await axiosInstance.post('/user/delete-account');
            toast.success('Account deleted successfully');
            logout && logout(); // Perform logout after account deletion
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'An error occurred');
        }
        setDeleting(false);
    };

    return (
        <div className="">
            <motion.section className="pt-4" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div className="flex flex-col gap-4 justify-center items-center w-full" variants={itemVariants}>
                    <motion.div className="w-full" variants={itemVariants}>
                        <Label htmlFor="email" className='text-gray-900 font-normal'>Email Address</Label>
                        <AnimatePresence initial={false}>
                            {isEditingEmail ? (
                                <motion.div
                                    key="input"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <Input
                                        id="emailAddress"
                                        name="emailAddress"
                                        type="email"
                                        placeholder="Email Address"
                                        value={formData.emailAddress}
                                        onChange={handleChange}
                                        className='outline-0 w-full md:w-1/2 xl:w-1/3 text-sm border-t border-b border-l-0 border-r-0 rounded-none border-[#ff575740] bg-[#ff575727] text-gray-600'
                                    />
                                    <Button type="button" size="sm" className="bg-[#ff5757] h-8 hover:bg-[#ff5757] cursor-pointer font-normal text-gray-50" onClick={() => setIsEditingEmail(false)}>
                                        <CircleX />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="text"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <p className="text-sm flex justify-between text-gray-600 items-center">
                                        {user?.emailAddress ? obfuscateEmail(user.emailAddress) : 'No email available'}{' '}
                                        <Button type="button" size="sm" className="bg-[#ff5757] h-8 hover:bg-[#ff5757] cursor-pointer font-normal text-gray-50" onClick={() => setIsEditingEmail(true)}>
                                        <Edit />
                                        </Button>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <motion.div className="w-full" variants={itemVariants}>
                        <div>
                            <Label className='font-normal'>Password</Label>
                            <p className="text-gray-500 text-[13px]">Modify your current password</p>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <div className="w-full">
                                <Label htmlFor="currentPassword" className="text-xs font-normal">
                                    Current Password
                                </Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    placeholder="Current Password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className='outline-0 w-full text-sm  border-t border-b border-l-0 border-r-0 rounded-none border-[#ff575740] bg-[#ff575727] text-gray-600'
                                />
                            </div>
                            <div className="w-full">
                                <Label htmlFor="newPassword" className="text-xs font-normal">
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="New Password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className='outline-0 w-full text-sm  border-t border-b border-l-0 border-r-0 rounded-none border-[#ff575740] bg-[#ff575727] text-gray-600'
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="w-full" variants={itemVariants}>
                        {showSuccess ? (
                                                        <div className='w-full flex items-center justify-end'>
          <Button className=" bg-green-500 font-normal h-8 text-gray-50" size="sm" disabled>
          <CheckCircle className="mr-2 h-4 w-4" />
        Changes Saved Successfully
                  </Button>
                  </div>
                        ) : (
                            <div className='w-full flex items-center justify-end'>
                                <Button className="bg-[#ff5757] hover:bg-[#ff5757] cursor-pointer h-8 font-normal text-gray-50" size="sm" onClick={handleSaveChanges} disabled={loading}>
                                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                            </Button>
                            </div>
                        )}
                    </motion.div>
                    <motion.div className="w-full" variants={itemVariants}>
                        <Label className="flex items-center gap-1 font-normal">
                            <TriangleAlert className="text-red-400 h-4 w-4" /> Delete Account
                        </Label>
                        <p className="text-gray-500 text-xs">Once you delete your account we can't bring it back!</p>
                        <Dialog>
                                <div className='w-full flex items-center justify-end'>
                            <DialogTrigger>
                                <Button size="sm" className="bg-red-400 text-white cursor-pointer font-normal h-8">
                                   <Trash2 /> Delete Account
                                </Button>
                            </DialogTrigger>
                                </div>
                            <DialogContent className="sm:max-w-[425px] bg-gray-50 border-none">
                                <DialogHeader>
                                    <DialogTitle className='text-gray-900 font-normal'>Are you absolutely sure?</DialogTitle>
                                    <DialogDescription className='text-[13px] text-gray-600'>
                                        Once you delete your account we won't be able to bring it back again!
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <div className="w-full flex items-center justify-center">
                                        <Button size="sm" className='bg-red-400 text-white font-normal h-8' onClick={handleDeleteAccount} disabled={deleting}>
                                            {deleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                            Confirm & Delete
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                </motion.div>
            </motion.section>
        </div>
    );
}
const obfuscateEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    const [domainName, domainExtension] = domain.split('.');
    return `${localPart.slice(0, 7)}*****@${domainName.slice(0, 2)}***.${domainExtension.slice(0, 2)}*`;
};