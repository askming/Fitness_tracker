
'use client';

import { useState, useEffect } from 'react';
import { STORAGE_KEY, GithubConfig, validateConfig } from '@/lib/github';
import { Loader2, Github } from 'lucide-react';


export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    // MOCK CONFIG FOR SCREENSHOT
    const [config, setConfig] = useState<GithubConfig | null>({ token: 'mock', owner: 'mock', repo: 'mock' });

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-neutral-950 text-white">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
