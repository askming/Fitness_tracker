
'use client';

import { useState, useEffect } from 'react';
import { saveWorkout, getGithubConfig, deleteIssue } from '@/lib/github';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { getActivityIcon, getActivityStyles } from '@/lib/icons';

type User = {
    id: number;
    name: string;
};

const ACTIVITIES = [
    { name: 'Running' },
    { name: 'Cycling' },
    { name: 'Gym' },
    { name: 'Swimming' },
];

export default function LogForm({ users, initialData }: { users: User[], initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Merge default activities with existing types from history
    const uniqueActivities = Array.from(new Set([
        ...ACTIVITIES.map(a => a.name),
        ...(initialData?.existingTypes || [])
    ])).map(name => ({ name }));

    // Init state based on initialData if present
    const [selectedType, setSelectedType] = useState(initialData?.type && uniqueActivities.find(a => a.name === initialData.type) ? initialData.type : uniqueActivities[0]?.name || 'Running');
    const [customType, setCustomType] = useState(initialData?.type && !uniqueActivities.find(a => a.name === initialData.type) ? initialData.type : '');
    const [isCustom, setIsCustom] = useState(!!(initialData?.type && !uniqueActivities.find(a => a.name === initialData.type)));
    const [notes, setNotes] = useState(initialData?.notes || ''); // Notes state

    // Default to first user if available
    const [selectedUserId, setSelectedUserId] = useState<number | string>(initialData?.userId || (users.length > 0 ? users[0].id : ''));

    useEffect(() => {
        if (initialData) {
            if (initialData.userId) {
                setSelectedUserId(initialData.userId);
            }

            if (uniqueActivities.find(a => a.name === initialData.type)) {
                setSelectedType(initialData.type);
                setIsCustom(false);
            } else if (initialData.type) {
                setCustomType(initialData.type);
                setIsCustom(true);
            }
            if (initialData.notes) setNotes(initialData.notes);
        }
    }, [initialData]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const type = isCustom ? customType : selectedType;
        const amount = Number(formData.get('amount'));
        const unit = formData.get('unit') as string;
        const calories = Number(formData.get('calories'));
        const date = (formData.get('date') as string) || new Date().toISOString();
        const userId = Number(selectedUserId);
        const id = initialData?.id;
        const formNotes = formData.get('notes') as string;

        if (!type) {
            alert("Please select or enter an activity type");
            setLoading(false);
            return;
        }

        if (!userId) {
            alert("Please select a user");
            setLoading(false);
            return;
        }

        const config = getGithubConfig();
        if (config) {
            await saveWorkout(config, {
                type,
                amount,
                unit,
                duration: (unit === 'mins' ? amount : (unit === 'hrs' ? amount * 60 : undefined)), // Back-compat for heatmap/stats if time-based
                calories,
                date,
                userId,
                notes: formNotes
            }, id);

            setLoading(false);
            router.push('/');
        } else {
            alert("Authentication lost. Please reload.");
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!initialData?.id) return;
        if (!confirm("Delete this activity?")) return;

        setLoading(true);
        const config = getGithubConfig();
        if (config) {
            await deleteIssue(config, initialData.id);
            router.push('/');
        }
        setLoading(false);
    }

    // Dynamic icon for "Other" field
    const CustomIcon = getActivityIcon(customType || 'Activity');

    return (
        <div className="flex flex-col gap-6">

            <form key={initialData?.id || 'new'} onSubmit={onSubmit} className="flex flex-col gap-6">

                {/* User Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">User</label>
                    <select
                        name="userId"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg appearance-none"
                    >
                        {users.map(user => (
                            <option key={user.id} value={user.id} className="bg-neutral-900 text-white">
                                {user.name}
                            </option>
                        ))}
                        {users.length === 0 && <option value="">No users found</option>}
                    </select>
                </div>

                <div className="flex flex-col gap-4">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Activity Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {uniqueActivities.map((activity) => {
                            const Icon = getActivityIcon(activity.name);
                            const styles = getActivityStyles(activity.name);
                            const isSelected = selectedType === activity.name && !isCustom;
                            return (
                                <button
                                    key={activity.name}
                                    type="button"
                                    onClick={() => { setSelectedType(activity.name); setIsCustom(false); }}
                                    className={clsx(
                                        "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                                        isSelected
                                            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-white"
                                            : "border-[var(--card)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[#262626]"
                                    )}
                                >
                                    <div className={clsx("p-2 rounded-full", styles.bg, styles.color)}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="font-medium">{activity.name}</span>
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setIsCustom(true)}
                            className={clsx(
                                "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                                isCustom
                                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-white"
                                    : "border-[var(--card)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[#262626]"
                            )}
                        >
                            <div className="p-2 rounded-full bg-gray-500/10 text-gray-400">
                                <Plus size={20} />
                            </div>
                            <span className="font-medium">Other</span>
                        </button>
                    </div>

                    {isCustom && (
                        <div className="relative">
                            <input
                                name="customType"
                                type="text"
                                placeholder="Enter activity name (e.g. Hiking)"
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                className="w-full p-4 pl-12 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg animate-in fade-in slide-in-from-top-2"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <CustomIcon size={20} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">Amount</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 5"
                            defaultValue={initialData?.amount ?? initialData?.duration ?? ''}
                            required
                            className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg w-full"
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">Unit</label>
                        <input
                            name="unit"
                            type="text"
                            placeholder="e.g. km, mins"
                            defaultValue={initialData?.unit ?? 'mins'}
                            required
                            className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg w-full"
                            list="units-list"
                        />
                        <datalist id="units-list">
                            <option value="mins" />
                            <option value="hrs" />
                            <option value="km" />
                            <option value="miles" />
                            <option value="steps" />
                            <option value="reps" />
                        </datalist>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Calories (kcal)</label>
                    <input
                        name="calories"
                        type="number"
                        placeholder="200"
                        defaultValue={initialData?.calories ?? ''}
                        className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Date</label>
                    <input
                        name="date"
                        type="date"
                        required
                        defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg [color-scheme:dark]"
                    />
                </div>

                {/* Notes Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Notes</label>
                    <textarea
                        name="notes"
                        placeholder="How did it feel?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg min-h-[100px] resize-none"
                    />
                </div>

                <div className="flex gap-4 mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (initialData ? "Update Activity" : "Save Activity")}
                    </button>
                    {initialData && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold active:scale-[0.98] transition-all flex items-center justify-center"
                        >
                            <Trash2 size={24} />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
