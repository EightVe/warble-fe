
import { Route, Routes} from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
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
import { SocketProvider } from './contexts/SocketContext';
import TestPage from './TEST_PAGE/TestPage';
import Home from './(Public)/home/Home';
const AppContent = () => {
  // const location = useLocation();
  // const hideNavigationBarPaths = ['/login', '/signup', '/forgot-password', '/verify-email'];

  // const hideNavigationBar = hideNavigationBarPaths.includes(location.pathname) || 
  //   matchPath('/reset-password/:token', location.pathname);

  // const { user, loading } = useContext(AuthContext) || {};
  // if (loading) {
  //   return (
  //     <div className='h-screen w-full z-50 fixed top-0 flex justify-center items-center bg-white'>
  //       <Loader className="h-6 w-6 animate-spin" />
  //     </div>
  //   );
  // }

  // if (user && !user.verifiedEmail) {
  //   return <EmailVerify />;
  // }

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

      <AppContent />
      </SocketProvider>
    </AuthProvider>
  </>
);

export default App;
