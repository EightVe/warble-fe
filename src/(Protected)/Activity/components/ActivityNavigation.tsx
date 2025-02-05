import CustomLink from '@/hooks/useLink'
import {  useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
    { path: '/activity', label: 'Likes' },
    { path: '/activity/comments', label: 'Comments' },
    { path: '/activity/posts', label: 'Posts' },
    { path: '/activity/time-spent', label: 'Time Spent' },
];

export default function ActivityNavigation() {
    const location = useLocation();

    return (
        <div className="relative text-sm font-medium text-center text-gray-500 border-b border-gray-300">
            <ul className="flex flex-wrap -mb-px">
                {links.map((link) => (
                    <li key={link.path} className="me-2 relative">
                        <CustomLink
                            href={link.path}
                            className={`transition-all duration-150 font-normal inline-block p-2 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 ${
                                location.pathname === link.path ? 'text-[#ff5757] hover:text-[#ff5757]' : ''
                            }`}
                        >
                            <motion.div
                            >
                                {link.label}
                            </motion.div>
                            {location.pathname === link.path && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5757] "
                                    layoutId="underline"
                                    initial={false}
                                    animate={{ width: '100%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </CustomLink>
                    </li>
                ))}
            </ul>
        </div>
    )
}
