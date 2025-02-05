import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
interface User {
  _id: string;
  // Add other user properties here
  twoFactorEnabled: boolean;
}
interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  token: string;
  bio: string;
  city: string;
  country: string;
  avatar: string;
  emailAddress: string;
  isAdmin: boolean; // Include isAdmin property here
  twoFactorEnabled: boolean;
}
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isGettingUserInfo: boolean;
  isRefreshingToken: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  // setUser: (user: User | null) => void;
  // logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGettingUserInfo, setIsGettingUserInfo] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsGettingUserInfo(true);
      try {
        const response = await axiosInstance.get('/auth/user-info');
        setUser(response.data);
        setIsGettingUserInfo(false);
      } catch (error) {
        setUser(null);
        setIsGettingUserInfo(false);
      } finally {
        setLoading(false);
        setIsGettingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const handleAuthError = async () => {
      if (!loading && !user) {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          try {
            setIsRefreshingToken(true);
            const response = await axiosInstance.post('/auth/refresh-token');
            if (response.status === 200) {
              const userInfoResponse = await axiosInstance.get('/auth/user-info');
              setUser(userInfoResponse.data);
              setIsRefreshingToken(false);
            } else if (response.status === 401) {
             // navigate('/login');
             setIsRefreshingToken(false);
            }
          } catch (error) {
            //navigate('/login');
            setIsRefreshingToken(false);
          }
        } else {
          //navigate('/login');
        }
      }
    };

    handleAuthError();
  }, [loading, user, navigate]);

  const saveGeoLocation = async (
    userId: string,
    city: string,
    country_name: string,
    ip: string,
    org: string,
    postal: string,
    version: string,
    network: string,
    country_capital: string
  ) => {
    try {
      const res = await fetch('/api/auth/geolocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, city, country_name, ip, org, postal, version, network, country_capital }),
      });
      const data = await res.json();
      console.log(data.message);
    } catch (err) {
      console.log('Error saving geolocation:', err);
    }
  };

  useEffect(() => {
    const getGeoLocation = async () => {
      if (!user || !user._id) {
        return;
      }
      try {
        const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
        const data = await res.text();
        const ip = data.match(/ip=(.*)/)?.[1].trim();

        if (ip) {
          const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
          const geoData = await geoRes.json();
          console.log('Geolocation Data:', geoData);
          const userId = user._id;
          saveGeoLocation(userId, geoData.city, geoData.country_name, geoData.ip, geoData.org, geoData.postal, geoData.version, geoData.network, geoData.country_capital);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getGeoLocation();
  }, [user]);

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
      navigate('/auth/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, isGettingUserInfo, isRefreshingToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
