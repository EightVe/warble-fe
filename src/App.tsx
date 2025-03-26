
import { Route, Routes} from 'react-router-dom';
import { AuthContext, AuthProvider } from '@/contexts/AuthContext';
import Signup from './(Public)/auth/signup/Signup';
import { Toaster } from 'sonner';
import Login from './(Public)/auth/login/Login';
import AuthBasedLayout from './Layouts/AuthBasedLayout';
import AnalyticsDashboard from './(Protected)/Dashboard/Dashboard';
import ProfileSettings from './(Protected)/Settings/ProfileSettings';
import ForgotPassword from './(Public)/auth/forgotPassword/ForgotPassword';
import NewPassword from './(Public)/auth/newPassword/NewPassword';
import AccountSettings from './(Protected)/Settings/AccountSettings';
import SecuritySettings from './(Protected)/Settings/SecuritySettings';
import Feed from './(Protected)/Feed/Feed';
import Profile from './(Protected)/Profile/Profile';
import SinglePostUI from './(Protected)/SingePost/SinglePostUI';
import FullNotificationsPage from './(Protected)/Notifications/FullNotificationsPage';
import ActivityPage from './(Protected)/Activity/ActivityPage';
import SecurityCenterPage from './(Protected)/SecurityCenter/SecurityCenterPage';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import TestPage from './TEST_PAGE/TestPage';
import Home from './(Public)/home/Home';
import { useContext, useEffect, useState } from 'react';
import ForceOpenNotification from './components/Notifications/ForceOpenNotification';
import PeerPage from './(Protected)/OnetoOnePeer/PeerPage';
import VideoChat from './(Protected)/OnetoOnePeer/Peering/VideoChatPeering';
import Dashboard from './(Protected)/Dashboard/Dashboard';
import AdminBasedLayout from './Layouts/AdminBasedLayout';
import BanStatusPage from './lib/ban-status-page';
import NotAuthButBanCheck from './Layouts/NotAuthButBanCheck';
import AuthButIgnoresBan from './Layouts/AuthButIgnoresBan';
import ViewUserBanHistory from './(Protected)/SupportPanels/BanHistory/ViewUserBanHistory';
import DashViewUserInfo from './(Protected)/Dashboard/pages/DashViewUserInfo';
import DashUserManagement from './(Protected)/Dashboard/pages/DashUserManagement';
import FirstSteps from './hooks/firstSteos/first-steps';
import { Helmet } from 'react-helmet';
import ContinueSignForm from './(Public)/auth/signup/components/ContineSignForm';
const AppContent = () => {
  // const location = useLocation();
  // const hideNavigationBarPaths = ['/login', '/signup', '/forgot-password', '/verify-email'];

  // const hideNavigationBar = hideNavigationBarPaths.includes(location.pathname) || 
  //   matchPath('/reset-password/:token', location.pathname);
  const [username, setUsername] = useState(null)
  const { user, loading } = useContext(AuthContext) || {};
  useEffect(() => {
    if (user) {
      if (!user.isFinishedSteps && !user.isFirstSteps && window.location.pathname !== "/auth/signup/cs") {
        window.location.href = "/auth/signup/cs";
      } else if (user.isFinishedSteps && window.location.pathname === "/auth/signup/cs") {
        window.history.back();
      }
    }
  }, [user]);
  const { forceOpenNotifications, setForceOpenNotifications ,notificationLoading} = useSocket();
  if (notificationLoading && user) {
    return null;
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
            onClose={(id) =>
              setForceOpenNotifications((prev) =>
                prev.filter((n) => n._id !== id)
              )
            }
          />
        ))}
      </div>
    );
  }
  return (
    <>
      {/* {!hideNavigationBar && <NavigationBar />} */}
      <Routes>
      {/* <Route path="/" element={<Home />} /> */}
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/auth/password-reset" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<NewPassword />} />
        <Route path="/dashboard" element={
          <AdminBasedLayout>
            <Dashboard />
          </AdminBasedLayout>
        } />
                <Route path="/dashboard/user-management/:id/view-details" element={
          <AdminBasedLayout>
            <DashViewUserInfo />
          </AdminBasedLayout>
        } />
                        <Route path="/dashboard/user-management" element={
          <AdminBasedLayout>
            <DashUserManagement />
          </AdminBasedLayout>
        } />
          <Route path="/settings" element={
          <AuthBasedLayout>
            <ProfileSettings />
          </AuthBasedLayout>
        } />
                  <Route path="/settings/account" element={
          <AuthBasedLayout>
            <AccountSettings />
          </AuthBasedLayout>
        } />
                          <Route path="/auth/signup/cs" element={
          <AuthBasedLayout>
            <ContinueSignForm />
          </AuthBasedLayout>
        } />
                          <Route path="/settings/security" element={
          <AuthBasedLayout>
            <SecuritySettings />
          </AuthBasedLayout>
        } />
                                  <Route path="/feed" element={
          <AuthBasedLayout>
            <Feed />
          </AuthBasedLayout>
        } />
                                          <Route path="/feed/ft/friends" element={
          <AuthBasedLayout>
            <Feed />
          </AuthBasedLayout>
        } />
                                          <Route path="/feed/ft/channels" element={
          <AuthBasedLayout>
            <Feed />
          </AuthBasedLayout>
        } />
                                          <Route path="/p/:username" element={
          <AuthBasedLayout>
            <Profile />
          </AuthBasedLayout>
        } />
                                                  <Route path="/post/dtls/:postUID" element={
          <AuthBasedLayout>
            <SinglePostUI />
          </AuthBasedLayout>
        } />
                                                          <Route path="/notifications" element={
          <AuthBasedLayout>
            <FullNotificationsPage />
          </AuthBasedLayout>
        } />
                                                                  <Route path="/activity" element={
          <AuthBasedLayout>
            <ActivityPage />
          </AuthBasedLayout>
        } />
<Route path="/" element={
  <NotAuthButBanCheck>

    <PeerPage />
  </NotAuthButBanCheck>
      } />
      
      <Route path="/wrb/ft/video-match" element={
          <AuthBasedLayout>
            <VideoChat />
          </AuthBasedLayout>
        } />
                                                                          <Route path="/security-center" element={
          <AuthBasedLayout>
            <SecurityCenterPage />
          </AuthBasedLayout>
        } />

<Route path="/security-center/view-ban-history" element={
          <AuthButIgnoresBan>
            <ViewUserBanHistory />
          </AuthButIgnoresBan>
        } />
      </Routes>
    </>
  );
};

const App = () => (
  <>
    <Helmet>
      <title>Warble – The Ultimate Social Experience</title>
      <meta name="description" content="Random video and text chat that brings people together. Meet new faces, start conversations, and enjoy spontaneous connections. Connect through feeds, send friend requests, chat in DMs, and explore new conversations effortlessly." />
      <link rel="canonical" href="https://warble.chat" />
    </Helmet>
    <Toaster position="top-center" />
    <AuthProvider>
      <SocketProvider>
      <AppContent />
      </SocketProvider>
    </AuthProvider>
  </>
);

export default App;
