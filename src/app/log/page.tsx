'use client';

import { useEffect, useState, Suspense } from 'react';
import { getGithubConfig, getProfiles, getWorkouts, getWorkout } from '@/lib/github';
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
                // Parallel fetch for profiles and workouts (to get types)
                const [profiles, workouts] = await Promise.all([
                    getProfiles(config),
                    getWorkouts(config)
                ]);

                setUsers(profiles.map(p => ({ id: p.id, name: p.name })));

                // Extract unique activity types
                const seenTypes = new Set<string>();
                workouts.forEach(w => { if (w.type) seenTypes.add(w.type); });
                const existingTypes = Array.from(seenTypes);

                // Pass to form
                setInitialData(prev => ({ ...prev, existingTypes }));

                if (editId) {
                    const workout = await getWorkout(config, Number(editId));
                    if (workout) setInitialData(prev => ({ ...prev, ...workout }));
                } else if (dateParam) {
                    setInitialData(prev => ({ ...prev, date: dateParam }));
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
