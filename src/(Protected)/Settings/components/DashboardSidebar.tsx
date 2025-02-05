import { BarChart, Users, FileText, Settings, HelpCircle, LogOut } from "lucide-react"

const sidebarItems = [
  { icon: BarChart, label: "Analytics", href: "#analytics" },
  { icon: Users, label: "Customers", href: "#customers" },
  { icon: FileText, label: "Reports", href: "#reports" },
  { icon: Settings, label: "Settings", href: "#settings" },
]

interface DashboardSidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function DashboardSidebar({ isOpen, setIsOpen }: DashboardSidebarProps) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0c0c146c] text-white transform transition-transform duration-300 ease-in-out h-full
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">MyDashboard</h2>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-gray-700 p-4">
          <ul>
            <li>
              <a href="#help" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                <HelpCircle className="mr-3 h-5 w-5" />
                Help & Support
              </a>
            </li>
            <li>
              <a href="#logout" className="flex items-center px-4 py-2 text-red-400 hover:bg-gray-700">
                <LogOut className="mr-3 h-5 w-5" />
                Log Out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}

