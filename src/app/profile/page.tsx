
'use client';

import { useEffect, useState } from 'react';
import { getGithubConfig, getProfiles, saveProfile } from '@/lib/github';
import ProfileForm from '@/components/ProfileForm'; // Needs update too
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            const config = getGithubConfig();
            if (config) {
                const profiles = await getProfiles(config);
                // Map to ProfileForm expectation
                setUsers(profiles);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return <ProfileForm users={users} />;
}
