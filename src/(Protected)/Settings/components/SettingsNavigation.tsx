import CustomLink from '@/hooks/useLink'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
    { path: '/settings', label: 'Profile & Privacy' },
    { path: '/settings/account', label: 'Account' },
    { path: '/settings/security', label: 'Security' },
    { path: '/settings/billing-invoices', label: 'Billing & Invoices' },
    { path: '/settings/notifications', label: 'Notifications' },
];

export default function SettingsNavigation() {
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
