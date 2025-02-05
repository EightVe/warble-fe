"use client"
import axiosInstance from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CustomLinkProps {
  href: string;
  children: ReactNode;
  [key: string]: any;
}

const CustomLink = ({ href, children, ...props }: CustomLinkProps) => {
  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const refreshToken = Cookies.get('refreshToken');

    // If there is a refresh token, navigate directly
    if (refreshToken) {
      navigate(href);
      return;
    }

    // If there is no refresh token, try to refresh the token
    try {
      const response = await axiosInstance.post('/auth/refresh-token');
      if (response.status === 200) {
        navigate(href);
      } else {
        navigate('/auth/login');
        toast.error('Session Expired, Please Log In.');
      }
    } catch (error) {
      navigate('/auth/login');
      toast.error('Session Expired, Please Log In.');
    }
  };

  return (
    <Link to={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default CustomLink;