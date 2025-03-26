import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Ban, Flag, LucideIcon, Terminal, UserPlus } from 'lucide-react'
import React from 'react'

function ActionButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
      <Button
        variant="outline"
        className="h-auto font-normal py-3 px-3 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 flex flex-col items-center justify-center space-y-1 w-full"
      >
        <Icon className="h-5 w-5 text-[#ff5757]" />
        <span className="text-xs">{label}</span>
      </Button>
    )
  }
  const QuickActions = () => {
    return (
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-sm font-normal">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton icon={Ban} label="Ban User" />
            <ActionButton icon={UserPlus} label="Add Mod" />
            <ActionButton icon={Flag} label="Review Reports" />
            <ActionButton icon={Terminal} label="System Log" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  export default QuickActions