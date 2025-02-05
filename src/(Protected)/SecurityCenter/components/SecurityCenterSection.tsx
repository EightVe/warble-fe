
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import SecurityCenterNavigation from './SecurityCenterNavigation.tsx'
export default function SecurityCenterSection() {
  return (
    <Card className="w-full mx-auto bg-white mt-4 border-0 shadow-none">
    <CardHeader className="flex flex-row items-center justify-between">
      <h1 className="text-base text-gray-600">Security Center</h1>
      <h1 className="text-xs text-[#ff5757] cursor-pointer">Mark all as read</h1>
    </CardHeader>
    <CardContent>
      <SecurityCenterNavigation />
      <div className="space-y-4 mt-4">
            <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="relative">
                <Avatar>
                  <AvatarImage
                    src="{`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-02%20121802-ADLL5QIq6oOp7EgqD2WF9GRWGHHTd2.png`}"
                  />
                  <AvatarFallback className='bg-gray-200'></AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">Joy Pacheco</span> mentioned you on Improve cards readability
                </p>
                <p className="text-sm text-muted-foreground mt-1">2h ago — Engineering</p>
              </div>
            </div>
          </div>
    </CardContent>
  </Card>
  )
}
