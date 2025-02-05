"use client"

import * as React from "react"
import { ChevronsUpDown, List, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  return (

    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-orange-300/20  data-[state=open]:text-gray-200 hover:bg-transparent"
            >
              <div className="bg-orange-300 flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo className="size-4 text-[#0c0c14]" />
              </div>

<div className="grid flex-1 text-left text-sm leading-tight text-gray-200">
                <span className="truncate font-medium">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto text-orange-300" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-orange-300/40 backdrop-blur-md border-none"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-gray-200 font-normal">
              Shops
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2 text-gray-200"
              >
                <div className="flex size-6 items-center justify-center rounded-sm ">
                  <team.logo className="size-4 shrink-0 text-orange-200" />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-[#0c0c14a2] ">
                <List className="size-4 text-orange-300" />
              </div>
              <div className="text-gray-200">Show More</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-orange-300/60 mx-2"/>
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-[#0c0c14a2] ">
                <Plus className="size-4 text-orange-300" />
              </div>
              <div className="text-gray-200">Create Shop</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>


  )
}
