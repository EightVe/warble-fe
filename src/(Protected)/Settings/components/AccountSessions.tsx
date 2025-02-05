import React, { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Monitor, Loader, CircleIcon } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axiosInstance';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator';

interface Session {
    _id: string;
    createdAt: string;
    userAgent: string;
    isCurrent: boolean;
    city?: string;
    country?: string;
    ip?: string;
    network?: string;
    org?: string;
    version?: string;
}

export default function AccountSessions() {
    const { user } = useContext(AuthContext) || {};
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axiosInstance.get('/sessions');
                setSessions(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching sessions:', error);
                setLoading(false);
            }
        };

        if (user) fetchSessions();
    }, [user]);

    const handleDelete = async (sessionId: string) => {
        setDeleting(true);
        try {
            await axiosInstance.post('/sessions/delete', { sessionId });
            setSessions(sessions.filter(session => session._id !== sessionId));
            setDeleting(false);
        } catch (error) {
            console.error('Error deleting session:', error);
            setDeleting(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col w-full gap-2">
                                  <h2 className="text-sm font-normal pt-4 text-gray-600">Devices and Activities</h2>
                                  <div className="text-[13px] text-gray-500">Authorized devices & sessions with access to your account</div>
            {sessions.map((session) => (
                <>
                <Card key={session._id} className={`p-6 border-none shadow-none ${session.isCurrent ? 'bg-[#ff575727]' : 'bg-[#ff575727]'}`}>
                    <div className="flex items-start space-x-4">
                        <div className='bg-[#ff57575c] p-2 rounded-full'>
                        <Monitor className={`w-4 h-4 ${session.isCurrent ? 'text-white' : 'text-white'}`} />
                        </div>
                        <div>
                            <div className={`text-[12px] ${session.isCurrent ? 'text-green-600' : ''}`}>{session.isCurrent ? <div className='flex items-center gap-1'><div className='h-2 w-2 bg-green-600 rounded-full'>
                                <div className='h-2 w-2 bg-green-400 rounded-full animate-ping'>

                                </div>
                                
                                </div> Current Session</div> : ''}</div>
                            <h3 className="text-xs text-gray-600">{new Date(session.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</h3>
                            <p className="text-xs text-gray-600">{session.userAgent}</p>
                            
                            <Separator className="mt-1" />
                            {session.city && session.country && (<p className="text-xs pt-1 text-gray-600">{session.city}, {session.country}</p>)}
                            {session.ip && (<p className="text-xs text-gray-600">IP Address : {session.ip}</p>)}
                            {session.network && session.org && session.version && (<p className="text-xs text-gray-600">{session.network} | ({session.version}) | {session.org}</p>)}
                        </div>
                    </div>
                    {!session.isCurrent && (
                        <div className="w-full flex justify-end">
                            <Button className="bg-[#ff5757] hover:bg-[#ff5757] cursor-pointer h-8 font-normal text-gray-50" size="sm" onClick={() => handleDelete(session._id)}>
                                {deleting ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    )}
                </Card>
                  </>
            ))}
        </div>
    );
}