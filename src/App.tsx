"use client"

import { Route, Routes } from "react-router-dom"
import { Suspense, lazy, useContext, useEffect, useState } from "react"
import { AuthContext, AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"
import { SocketProvider, useSocket } from "./contexts/SocketContext"
import { Helmet } from "react-helmet"
import ForceOpenNotification from "./components/Notifications/ForceOpenNotification"
import { motion } from "framer-motion";
import Logo from "@/assets/img/mainLogo.png"
// Loading component to show while chunks are loading
const LoadingFallback = () => (
<div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 top-0">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-1">
            <div className="h-7 w-7 rounded-lg bg-[#ff575748] flex items-center justify-center">
             <img src={Logo} loading="lazy" alt="Warble Logo" />
            </div>
            <span className="text-gray-200 font-medium text-base tracking-tighter leading-tight logofont">Warble.</span>
          </div>
        {/* LinkedIn-style Bar */}
        <div className="relative w-22 h-[3.5px] bg-zinc-300/30 mt-4 overflow-hidden rounded-full">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#ff5757] w-1/2 rounded-full"
            animate={{
              x: ["0%", "100%"],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.7,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
)
const Signup = lazy(() => import("./(Public)/auth/signup/Signup"))
const Login = lazy(() => import("./(Public)/auth/login/Login"))
const ForgotPassword = lazy(() => import("./(Public)/auth/forgotPassword/ForgotPassword"))
const NewPassword = lazy(() => import("./(Public)/auth/newPassword/NewPassword"))
const Dashboard = lazy(() => import("./(Protected)/Dashboard/Dashboard"))
const ProfileSettings = lazy(() => import("./(Protected)/Settings/ProfileSettings"))
const AccountSettings = lazy(() => import("./(Protected)/Settings/AccountSettings"))
const SecuritySettings = lazy(() => import("./(Protected)/Settings/SecuritySettings"))
const Feed = lazy(() => import("./(Protected)/Feed/Feed"))
const Profile = lazy(() => import("./(Protected)/Profile/Profile"))
const SinglePostUI = lazy(() => import("./(Protected)/SingePost/SinglePostUI"))
const FullNotificationsPage = lazy(() => import("./(Protected)/Notifications/FullNotificationsPage"))
const ActivityPage = lazy(() => import("./(Protected)/Activity/ActivityPage"))
const SecurityCenterPage = lazy(() => import("./(Protected)/SecurityCenter/SecurityCenterPage"))
const TestPage = lazy(() => import("./TEST_PAGE/TestPage"))
const PeerPage = lazy(() => import("./(Protected)/OnetoOnePeer/PeerPage"))
const VideoChat = lazy(() => import("./(Protected)/OnetoOnePeer/Peering/VideoChatPeering"))
const DashViewUserInfo = lazy(() => import("./(Protected)/Dashboard/pages/DashViewUserInfo"))
const DashUserManagement = lazy(() => import("./(Protected)/Dashboard/pages/DashUserManagement"))
const ViewUserBanHistory = lazy(() => import("./(Protected)/SupportPanels/BanHistory/ViewUserBanHistory"))
const ContinueSignForm = lazy(() => import("./(Public)/auth/signup/components/ContineSignForm"))
const Home = lazy(() => import("./(Public)/home/Home"))
// Load layouts normally since they're used across many routes
import AuthBasedLayout from "./Layouts/AuthBasedLayout"
import AdminBasedLayout from "./Layouts/AdminBasedLayout"
import NotAuthButBanCheck from "./Layouts/NotAuthButBanCheck"
import AuthButIgnoresBan from "./Layouts/AuthButIgnoresBan"

const AppContent = () => {
  const { user, loading } = useContext(AuthContext) || {}
  const { forceOpenNotifications, setForceOpenNotifications, notificationLoading } = useSocket()

  useEffect(() => {
    if (user) {
      if (!user.isFinishedSteps && !user.isFirstSteps && window.location.pathname !== "/auth/signup/cs") {
        window.location.href = "/auth/signup/cs"
      } else if (user.isFinishedSteps && window.location.pathname === "/auth/signup/cs") {
        window.history.back()
      }
    }
  }, [user])
  useEffect(() => {
    if (user && (window.location.pathname === "/" || window.location.pathname === "")) {
      window.history.back()
    }
  }, [user])

  if (notificationLoading && user) {
    return <LoadingFallback />
  }

  if (forceOpenNotifications.length > 0 && user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-50 z-50">
        {forceOpenNotifications.map((notification) => (
          <ForceOpenNotification
            key={notification._id}
            _id={notification._id}
            title={notification.title}
            description={notification.description}
            AdminAnnouncement={notification.AdminAnnouncement ?? ""}
            onClose={(id) => setForceOpenNotifications((prev) => prev.filter((n) => n._id !== id))}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/login" element={<Login />} />
          {/* <Route path="/test" element={<TestPage />} /> */}
          <Route path="/auth/password-reset" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<NewPassword />} />

          {/* Admin routes */}
          <Route
            path="/dashboard"
            element={
              <AdminBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Dashboard />
                </Suspense>
              </AdminBasedLayout>
            }
          />
          <Route
            path="/dashboard/user-management/:id/view-details"
            element={
              <AdminBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <DashViewUserInfo />
                </Suspense>
              </AdminBasedLayout>
            }
          />
          <Route
            path="/dashboard/user-management"
            element={
              <AdminBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <DashUserManagement />
                </Suspense>
              </AdminBasedLayout>
            }
          />

          {/* Auth routes */}
          <Route
            path="/settings"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ProfileSettings />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/settings/account"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AccountSettings />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/auth/signup/cs"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ContinueSignForm />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/settings/security"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <SecuritySettings />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/feed"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Feed />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/feed/ft/friends"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Feed />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/feed/ft/channels"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Feed />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/p/:username"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Profile />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/post/dtls/:postUID"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <SinglePostUI />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <FullNotificationsPage />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/activity"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ActivityPage />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/"
            element={
              <NotAuthButBanCheck>
                <Suspense fallback={<LoadingFallback />}>
                  <Home />
                </Suspense>
              </NotAuthButBanCheck>
            }
          />
          <Route
            path="/video-match"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <VideoChat />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/security-center"
            element={
              <AuthBasedLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <SecurityCenterPage />
                </Suspense>
              </AuthBasedLayout>
            }
          />
          <Route
            path="/security-center/view-ban-history"
            element={
              <AuthButIgnoresBan>
                <Suspense fallback={<LoadingFallback />}>
                  <ViewUserBanHistory />
                </Suspense>
              </AuthButIgnoresBan>
            }
          />
        </Routes>
      </Suspense>
    </>
  )
}

const App = () => (
  <>
    <Helmet>
      <title>Warble – The Ultimate Social Experience</title>
      <meta
        name="description"
        content="Random video and text chat that brings people together. Meet new faces, start conversations, and enjoy spontaneous connections. Connect through feeds, send friend requests, chat in DMs, and explore new conversations effortlessly."
      />
      <link rel="canonical" href="https://warble.chat" />
    </Helmet>
    <Toaster position="top-center" />
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  </>
)

export default App

