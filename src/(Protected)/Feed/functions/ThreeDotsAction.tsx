import React, { useContext } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Copy, Edit, EllipsisVertical, Facebook, Flag, FlagIcon, Instagram, Share2, Trash2, Twitter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AuthContext } from '@/contexts/AuthContext'
interface ThreeDotsActionProps {
    PostId: any;
  }
export default function ThreeDotsAction({ PostId }:ThreeDotsActionProps) {
    const {user} = useContext(AuthContext) || {};
    const postUrl = `http://localhost:5173/post/dtls/${PostId?.postUID}`

    const handleShare = (platform: string) => {
        const url = `${postUrl}?src_origin=${platform}`
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Copied to clipboard!')
        })
    }

    const handleCopyLink = () => {
        const url = `${postUrl}?src_origin=source`
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Copied to clipboard!')
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className='cursor-pointer'><EllipsisVertical className='h-5 w-5 text-[#ff5757] rotate-90' /></DropdownMenuTrigger>
            <DropdownMenuContent className='bg-[#fefefe] text-gray-700 mr-4 px-0 shadow-xs border border-gray-200 flex flex-col'>
            {user?._id === PostId?.postOwner?._id && 
                <>
                <div className='flex items-center gap-2 px-3 py-2 text-sm cursor-pointer group transition-all duration-150 my-1 tracking-tight'>
                    <Edit className='h-3.5 w-3.5 group-hover:text-[#ff5757] transition-all duration-100' /> Edit
                </div>
                <Dialog>
                    <DialogTrigger>
                    <div className='flex items-center gap-2 px-3 py-2 text-sm cursor-pointer group transition-all duration-150 my-1 tracking-tight'>
                    <Trash2 className='w-3.5 h-3.5 group-hover:text-[#ff5757] transition-all duration-100' /> Delete
                </div>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-50 border-0">
                        <DialogHeader>
                            <DialogTitle className='tracking-tight font-medium'>Are you sure?</DialogTitle>
                            <DialogDescription>
                            Once you delete your post you won't be able to retrieve it again.
                            </DialogDescription>
                           <div className='w-full flex items-center justify-center pt-3'>
                           <Button className=" sm:w-auto whitespace-nowrap bg-gradient-to-tr from-[#ff2941] to-[#ff078e] h-8 font-normal text-white text-[13px]" size="sm" onClick={handleCopyLink}><Trash2 /> Delete</Button>
                           </div>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                </>
                                 }
                <Dialog>
                    <DialogTrigger>
                    <div className='flex items-center gap-2 px-3 py-2 text-sm cursor-pointer group transition-all duration-150 my-1 tracking-tight'>
                    <Flag className='h-3.5 w-3.5 group-hover:text-[#ff5757] transition-all duration-100' /> Report
                </div>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-50 border-0">
                        <DialogHeader>
                            <DialogTitle className='tracking-tight font-medium'>Report <span className='capitalize'>{PostId.postOwner.firstName}</span>'s post</DialogTitle>
                            <DialogDescription>
                                What's the reason for your report.
                            </DialogDescription>
                            <RadioGroup defaultValue="comfortable" className='py-2'>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="55" id="r1" className='cursor-pointer border-[#ff078e] text-[#ff078e]'/>
        <Label htmlFor="r1" className='cursor-pointer font-normal'>Innapropriate Post</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="15" id="r2" className='cursor-pointer border-[#ff078e] text-[#ff078e]'/>
        <Label htmlFor="r2" className='cursor-pointer font-normal'>Sexual Content</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="123" id="r3" className='cursor-pointer border-[#ff078e] text-[#ff078e]'/>
        <Label htmlFor="r3" className='cursor-pointer font-normal'>Harrasment</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="ewq" id="r4" className='cursor-pointer border-[#ff078e] text-[#ff078e]'/>
        <Label htmlFor="r4" className='cursor-pointer font-normal'>Other</Label>
      </div>
    </RadioGroup>
                           <div className='w-full flex items-center justify-center pt-3'>
                           <Button className=" sm:w-auto whitespace-nowrap bg-gradient-to-tr from-[#ff2941] to-[#ff078e] h-8 font-normal text-white text-[13px]" size="sm" onClick={handleCopyLink}><FlagIcon /> Report</Button>
                           </div>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger>
                        <div className='flex items-center gap-2 px-3 py-2 text-sm cursor-pointer group transition-all duration-150 my-1 tracking-tight'>
                            <Share2 className='h-3.5 w-3.5 group-hover:text-[#ff5757] transition-all duration-100' /> Share
                        </div>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-50 border-0">
                        <DialogHeader>
                            <DialogTitle className='tracking-tight font-medium'>Share <span className='capitalize'>{PostId.postOwner.firstName}</span>'s post 🎉</DialogTitle>
                            <DialogDescription>
                                Choose a platform to share on!
                            </DialogDescription>
                            <div className='flex gap-2 items-center justify-center'>
                                <Button size="sm" onClick={() => handleShare('ins')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
</svg></Button>
                                <Button size="sm" onClick={() => handleShare('fac')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
</svg></Button>
                                <Button size="sm" onClick={() => handleShare('twi')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
</svg></Button>
                                <Button size="sm" onClick={() => handleShare('dis')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-discord" viewBox="0 0 16 16">
  <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
</svg></Button>
                                <Button size="sm" onClick={() => handleShare('red')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-reddit" viewBox="0 0 16 16">
  <path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"/>
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"/>
</svg></Button>
                            </div>
                           <div className='w-full flex items-center justify-center pt-3'>
                           <Button className=" sm:w-auto whitespace-nowrap bg-gradient-to-tr from-[#ff2941] to-[#ff078e] h-8 font-normal text-white text-[13px]" size="sm" onClick={handleCopyLink}><Copy /> Copy Link</Button>
                           </div>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
