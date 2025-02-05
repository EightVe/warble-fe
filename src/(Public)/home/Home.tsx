import React from 'react'
import logo from '@/assets/img/mainLogo.png'
export default function Home() {
  return (
    <div className='h-screen w-full flex items-center justify-between flex-col py-10'>
        <img src={logo} height={100} width={100}/>
        <div className='lg:w-1/4 text-center text-gray-600 w-[90%]'>
        Warble is startup Platform where people can communicate , meet new people or create an online presence Providing user with full control of there accounts with Prime futures that stand. Still under development.
        </div>
        <p className='text-gray-500 text-xs px-4 text-center'>2025 Warble.chat is registered under Eightve Labs LTD all copyrights reserved including trendmarks.</p>
    </div>
  )
}