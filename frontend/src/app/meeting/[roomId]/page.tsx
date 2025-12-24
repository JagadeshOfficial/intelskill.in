'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function MeetingPage() {
    const { roomId } = useParams();
    const [user, setUser] = useState({ name: 'Guest', email: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Determine user identity from stored tokens
        const fetchIdentity = async () => {
            let token = localStorage.getItem('tutorToken');
            let role = 'tutor';
            let url = 'http://localhost:8081/api/v1/tutor/me';

            if (!token) {
                token = localStorage.getItem('studentToken');
                role = 'student';
                url = 'http://localhost:8081/api/v1/student/me';
            }

            if (!token) {
                token = localStorage.getItem('adminToken');
                role = 'admin';
                url = 'http://localhost:8081/api/v1/auth/admin/me';
            }

            if (token) {
                try {
                    const res = await fetch(url, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser({
                            name: `${data.firstName} ${data.lastName}`,
                            email: data.email,
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            setLoading(false);
        };

        fetchIdentity();
    }, []);

    useEffect(() => {
        if (loading) return;

        // Load Jitsi script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => {
            const domain = 'meet.jit.si';
            const options = {
                roomName: `LearnFlow-${roomId}`,
                width: '100%',
                height: '100%',
                parentNode: document.getElementById('jitsi-container'),
                userInfo: {
                    displayName: user.name,
                    email: user.email,
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    disableDeepLinking: true,
                    prejoinPageEnabled: false,
                    fileRecordingsEnabled: true,
                    liveStreamingEnabled: false,
                    toolbarButtons: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat',
                        'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security', 'recording'
                    ]
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Intel Skill User',
                    APP_NAME: 'Intel Skill Live',
                    NATIVE_APP_NAME: 'Intel Skill Live',
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat',
                        'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security', 'recording'
                    ],
                }
            };
            const api = new window.JitsiMeetExternalAPI(domain, options);

            // Handle events
            api.addEventListeners({
                readyToClose: () => {
                    window.close(); // Or redirect back to dashboard
                    // Fallback if window.close is blocked
                    window.location.href = '/';
                }
            });
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [loading, roomId, user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <span className="ml-3 text-lg">Initializing Secure Connection...</span>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gray-900 overflow-hidden flex flex-col">
            <div className='h-14 bg-gray-950 border-b border-gray-800 flex items-center px-6 justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-red-500'></div>
                    <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                    <div className='w-3 h-3 rounded-full bg-green-500'></div>
                    <span className="ml-4 font-bold text-gray-200 tracking-wide">Intel Skill Live</span>
                </div>
                <div className='text-sm text-gray-400'>
                    Secure End-to-End Encrypted Session
                </div>
            </div>
            <div id="jitsi-container" className="flex-grow bg-black" />
        </div>
    );
}
