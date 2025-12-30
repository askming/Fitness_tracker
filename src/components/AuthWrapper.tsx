
'use client';

import { useState, useEffect } from 'react';
import { STORAGE_KEY, GithubConfig, validateConfig } from '@/lib/github';
import { Loader2, Github } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<GithubConfig | null>(null);

    // Form State
    const [token, setToken] = useState('');
    const [owner, setOwner] = useState('');
    const [repo, setRepo] = useState('');
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setConfig(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidating(true);
        setError('');

        const newConfig = { token, owner, repo };
        const isValid = await validateConfig(newConfig);

        if (isValid) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
            setConfig(newConfig);
            // Ideally reload or just set state
        } else {
            // More descriptive error could be passed here, but for now:
            setError('Invalid credentials or repository not found/accessible.');
        }
        setValidating(false);
    };

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setConfig(null);
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-neutral-950 text-white">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!config) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-neutral-950 text-white p-4">
                <div className="w-full max-w-md glass p-8 rounded-2xl flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-white/10 rounded-full">
                            <Github size={40} />
                        </div>
                        <h1 className="text-2xl font-bold">Connect GitHub</h1>
                        <p className="text-[var(--muted-foreground)] text-center text-sm">
                            Your data will be stored securely in your own GitHub repository using Issues.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)] ml-1">GitHub Token</label>
                            <input
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="ghp_xxxxxxxxxxxx"
                                required
                                className="w-full p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                            />
                            <p className="text-[10px] text-[var(--muted-foreground)] mt-1 ml-1">Must have 'repo' scope (Full Control) for private repositories.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)] ml-1">Username</label>
                                <input
                                    type="text"
                                    value={owner}
                                    onChange={(e) => setOwner(e.target.value)}
                                    placeholder="yangm37"
                                    required
                                    className="w-full p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)] ml-1">Repository</label>
                                <input
                                    type="text"
                                    value={repo}
                                    onChange={(e) => setRepo(e.target.value)}
                                    placeholder="my-fitness-data"
                                    required
                                    className="w-full p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded">{error}</p>}

                        <button
                            type="submit"
                            disabled={validating}
                            className="mt-2 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {validating ? <Loader2 className="animate-spin" /> : "Connect & Continue"}
                        </button>
                    </form>

                    <div className="text-center text-xs text-[var(--muted-foreground)]">
                        <p>Your token is stored locally in your browser.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
            {/* We can add a logout button somewhere globally or just rely on manual clear for now if hidden */}
        </>
    );
}
