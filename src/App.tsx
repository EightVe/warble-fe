
import { Route, Routes} from 'react-router-dom';
import { AuthContext, AuthProvider } from '@/contexts/AuthContext';
import Signup from './(Public)/auth/signup/Signup';
import { Toaster } from 'sonner';
import Login from './(Public)/auth/login/Login';
import AuthBasedLayout from './Layouts/AuthBasedLayout';
import AnalyticsDashboard from './(Protected)/Dashboard/AnalyticsDashboard';
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
import PeerSystem from './(Protected)/OnetoOnePeer/Components/VideoLayout';
import { VideoCallProvider } from './contexts/Context.jsx';
const AppContent = () => {
  // const location = useLocation();
  // const hideNavigationBarPaths = ['/login', '/signup', '/forgot-password', '/verify-email'];

  // const hideNavigationBar = hideNavigationBarPaths.includes(location.pathname) || 
  //   matchPath('/reset-password/:token', location.pathname);

  const { user, loading} = useContext(AuthContext) || {};
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
      <Route path="/" element={<Home />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/auth/password-reset" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<NewPassword />} />
        <Route path="/dashboard" element={
          <AuthBasedLayout>
            <AnalyticsDashboard />
          </AuthBasedLayout>
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
                                                                          <Route path="/wr/video-chat" element={
          <AuthBasedLayout>
            <PeerPage />
          </AuthBasedLayout>
        } />
                                                                                  {/* <Route path="/ps" element={
          <AuthBasedLayout>
            <PeerSystem />
          </AuthBasedLayout>
        } /> */}


<Route path="/wr/video-chat" element={
        <VideoCallProvider>
          <AuthBasedLayout>
            <PeerPage />
          </AuthBasedLayout>
        </VideoCallProvider>
      } />
                                                                          <Route path="/security-center" element={
          <AuthBasedLayout>
            <SecurityCenterPage />
          </AuthBasedLayout>
        } />
      </Routes>
    </>
  );
};

const App = () => (
  <>
    <Toaster position="top-center" />
    <AuthProvider>
      <SocketProvider>
      <VideoCallProvider>
      <AppContent />
      </VideoCallProvider>
      </SocketProvider>
    </AuthProvider>
  </>
);

export default App;
