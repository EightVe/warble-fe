import Header from './components/header'
import LeftSidebar from './components/left-sidebar'
import MainContent from './components/main-content'
import RightSidebar from './components/right-sidebar'
import MobileNavigation from './components/mobile-navigation'
export default function Feed() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      <Header />
      <div className="flex overflow-hidden xl:justify-center md:justify-center 2xl:justify-between">
        <LeftSidebar />
        <main className=" w-full md:max-w-2xl">
          <MainContent />
        </main>
        <RightSidebar />
      </div>
      <MobileNavigation />
    </div>
  )
}
