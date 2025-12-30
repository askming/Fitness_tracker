'use client';

import { useEffect, useState, Suspense } from 'react';
import { getGithubConfig, getProfiles, getWorkout } from '@/lib/github';
import ClientLogForm from '@/components/LogForm';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function LogContent() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<{ id: number, name: string }[]>([]);
    const [initialData, setInitialData] = useState<any>(null);
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');
    const dateParam = searchParams.get('date');

    useEffect(() => {
        async function fetchData() {
            const config = getGithubConfig();
            if (config) {
                const profiles = await getProfiles(config);
                setUsers(profiles.map(p => ({ id: p.id, name: p.name })));

                if (editId) {
                    const workout = await getWorkout(config, Number(editId));
                    if (workout) setInitialData(workout);
                } else if (dateParam) {
                    // Pre-fill date for new entry
                    setInitialData({ date: dateParam });
                }
            }
            setLoading(false);
        }
        fetchData();
    }, [editId, dateParam]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <ClientLogForm users={users} initialData={initialData} />
    );
}

export default function LogPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <LogContent />
        </Suspense>
    );
}
