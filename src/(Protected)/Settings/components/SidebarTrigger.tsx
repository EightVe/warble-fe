import { Menu } from "lucide-react"

interface SidebarTriggerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function SidebarTrigger({ isOpen, setIsOpen }: SidebarTriggerProps) {
  return (
    <button
      className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
      onClick={() => setIsOpen(!isOpen)}
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

