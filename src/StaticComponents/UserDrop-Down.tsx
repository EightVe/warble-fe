import React from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { LifeBuoy, Lock, LogOut, Settings } from 'lucide-react'
export default function UserDropDown({user, logout}) {
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
    <button
              className="flex items-center cursor-pointer justify-center h-10 w-10 rounded-md"
            >
                <Avatar className='h-8 w-8'>
      <AvatarImage src={user.avatar} />
      <AvatarFallback className='bg-gray-50'></AvatarFallback>
    </Avatar>
            </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]  bg-black from-[#6e1b1b00] via-[#000000] to-[#220303] border-[#ff575737] mr-2 text-white">
      <DropdownMenuLabel className='font-medium'>Hi, {user?.firstName}!</DropdownMenuLabel>
      <DropdownMenuSeparator className='bg-[#ff575737]' />
        <Button className='flex items-center justify-between w-full px-2 py-0 h-8 font-normal text-sm hover:bg-[#ff575737]'>
        Settings <Settings className='h-4 w-4'/>
        </Button>
      <DropdownMenuSeparator className='bg-[#ff575737]' />
      <Button className='flex items-center justify-between w-full px-2 py-0 h-8 font-normal text-sm hover:bg-[#ff575737]'>
        Security Center <Lock className='h-4 w-4'/>
        </Button>
        <Button className='flex items-center justify-between w-full px-2 py-0 h-8 font-normal text-sm hover:bg-[#ff575737]'>
        Support <LifeBuoy className='h-4 w-4'/>
        </Button>
      <DropdownMenuSeparator className='bg-[#ff575737]' />
      <Button className='flex items-center justify-between w-full px-2 py-0 h-8 font-normal text-sm hover:bg-[#ff575737]' onClick={()=>logout()}>
        Log out <LogOut className='h-4 w-4'/>
        </Button>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}
