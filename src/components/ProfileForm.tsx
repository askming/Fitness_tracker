
'use client';

import { useState } from 'react';
import { saveProfile, getGithubConfig, deleteIssue } from '@/lib/github'; // Updated import
import { Loader2, User, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type UserData = {
    id: number;
    name: string;
    age?: number;
    weight?: number;
    height?: number;
};

export default function ProfileForm({ users }: { users: UserData[] }) {
    const router = useRouter(); // Use router to refresh
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | 'new'>('new');

    const selectedUser = users.find(u => u.id === selectedUserId);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const age = Number(formData.get('age')) || undefined;
        const weight = Number(formData.get('weight')) || undefined;
        const height = Number(formData.get('height')) || undefined;

        const config = getGithubConfig();
        if (!config) {
            alert("Auth error");
            setLoading(false);
            return;
        }

        const id = selectedUserId === 'new' ? undefined : (selectedUserId as number);

        await saveProfile(config, { name, age, weight, height }, id);

        setLoading(false);
        alert('Profile saved!');

        // In a real app we'd update local state or re-fetch. 
        // Triggering a full reload is easiest for this prototype to sync "users" prop.
        window.location.reload();
    }

    async function handleDelete() {
        if (selectedUserId === 'new') return;
        if (!confirm("Are you sure you want to remove this user? This cannot be undone.")) return;

        setLoading(true);
        const config = getGithubConfig();
        if (!config) {
            alert("Auth error");
            setLoading(false);
            return;
        }

        await deleteIssue(config, selectedUserId);
        setLoading(false);
        window.location.reload();
    }

    function handleLogout() {
        if (confirm("Are you sure you want to disconnect? You will need to re-enter your GitHub Token.")) {
            localStorage.removeItem('fitness_tracker_gh_config');
            window.location.reload();
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <h1 className="text-2xl font-bold">Your Profile</h1>
                </div>
                <button
                    onClick={handleLogout}
                    type="button"
                    className="text-xs text-[var(--muted-foreground)] hover:text-red-400 underline underline-offset-4"
                >
                    Disconnect
                </button>
            </div>

            {/* User Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--muted-foreground)]">Select Profile to Edit</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedUserId('new')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-colors ${selectedUserId === 'new' ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[#262626]'}`}
                    >
                        <Plus size={16} />
                        New User
                    </button>
                    {users.map(user => (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUserId(user.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-colors ${selectedUserId === user.id ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[#262626]'}`}
                        >
                            {user.name}
                        </button>
                    ))}
                </div>
            </div>

            <form key={selectedUserId} onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Name</label>
                    <input
                        name="name"
                        type="text"
                        defaultValue={selectedUser?.name || ''}
                        placeholder="John Doe"
                        required
                        className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">Age</label>
                        <input
                            name="age"
                            type="number"
                            defaultValue={selectedUser?.age || ''}
                            placeholder="25"
                            className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">Height (cm)</label>
                        <input
                            name="height"
                            type="number"
                            defaultValue={selectedUser?.height || ''}
                            placeholder="175"
                            className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Weight (kg)</label>
                    <input
                        name="weight"
                        type="number"
                        step="0.1"
                        defaultValue={selectedUser?.weight || ''}
                        placeholder="70.5"
                        className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg"
                    />
                </div>

                <div className="flex gap-4 mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (selectedUserId === 'new' ? "Create Profile" : "Save Changes")}
                    </button>

                    {selectedUserId !== 'new' && (
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
