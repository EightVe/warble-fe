
import React, { useEffect } from 'react'
import CircleAnimation from '@/components/ui/CircleAnimation'
import Header from '../Feed/components/header'
import LeftSidebar from '../Feed/components/left-sidebar'
import SettingsNavigation from './components/SettingsNavigation'
import ProfileForm from './components/ProfileForm'
import { Separator } from '@radix-ui/react-separator'
import RightSidebar from '../Feed/components/right-sidebar'
import MobileNavigation from '../Feed/components/mobile-navigation'
export default function ProfileSettings() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      <Header />
      <div className="flex overflow-hidden xl:justify-center md:justify-center 2xl:justify-between">
        <LeftSidebar />
        <main className="w-full">
        <div className='space-y-1 pt-4 px-4 md:px-10'>
        <div className='text-xl text-gray-600'>Settings</div>
        <div className='text-xs text-gray-400'>Update your profile and privacy settings</div>
        <Separator className='bg-gray-300 h-[1px] rounded-full' />
        <SettingsNavigation />
        <ProfileForm />
      </div>
        </main>
        <RightSidebar />
      </div>
      <MobileNavigation />
    </div>
  )
}
