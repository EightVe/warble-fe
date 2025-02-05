import FetchSinglePost from './components/FetchSingle'
import Header from '../Feed/components/header'
import LeftSidebar from '../Feed/components/left-sidebar'
import RightSidebar from '../Feed/components/right-sidebar'
import MobileNavigation from '../Feed/components/mobile-navigation'
export default function Feed() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      <Header />
      <div className="flex overflow-hidden xl:justify-center md:justify-center 2xl:justify-between">
        <LeftSidebar />
        <main className=" w-full md:max-w-2xl">
          <FetchSinglePost />
        </main>
        <RightSidebar />
      </div>
      <MobileNavigation />
    </div>
  )
}
