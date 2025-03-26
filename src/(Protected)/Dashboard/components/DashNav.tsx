import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { Settings, Shield } from 'lucide-react';
import React from 'react'
import {
    Activity,
    Command,
    Flag,
    Globe,
    type LucideIcon,
    Users,
    Video,
  } from "lucide-react"
import CustomLink from '@/hooks/useLink';
export default function DashNav() {
  return (
    <div className="col-span-12 md:col-span-3 lg:col-span-2 md:min-h-screen">
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
    <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757]/5 -z-1 via-transparent to-transparent opacity-50"></div>
      <CardContent className="p-4">
        <nav className="space-y-2">
          <NavItem link="/dashboard" icon={Command} label="Overview" active />
          <NavItem link="/dashboard/user-management" icon={Users} label="User Management" />
        </nav>
      </CardContent>
    </Card>
  </div>
  )
}
function NavItem({ icon: Icon, label, active,link }: { icon: LucideIcon; label: string; active?: boolean; link:any }) {
    return (
      <CustomLink href={link}>
        <Button
        variant="ghost"
        className={`w-full font-normal text-[13px] justify-start ${active ? "bg-slate-800/70 text-[#ff5757]" : "text-slate-400 hover:text-slate-100"}`}
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
      </CustomLink>
    )
  }