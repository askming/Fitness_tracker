
'use client';

import { useState, useEffect } from 'react';
import { STORAGE_KEY, GithubConfig, validateConfig } from '@/lib/github';
import { Loader2, Github } from 'lucide-react';


export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<GithubConfig | null>(null);
    const [needsSetup, setNeedsSetup] = useState(false);
    const [formData, setFormData] = useState({ token: '', owner: '', repo: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                validateConfig(parsed).then(valid => {
                    if (valid) {
                        setConfig(parsed);
                    } else {
                        setNeedsSetup(true);
                        setError('Invalid credentials. Please re-enter your GitHub information.');
                    }
                    setLoading(false);
                });
            } catch (e) {
                setNeedsSetup(true);
                setLoading(false);
            }
        } else {
            setNeedsSetup(true);
            setLoading(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const newConfig = { ...formData };
        const valid = await validateConfig(newConfig);

        if (valid) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
            setConfig(newConfig);
            setNeedsSetup(false);
        } else {
            setError('Failed to validate credentials. Please check your token, owner, and repo name.');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (needsSetup) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
                <div className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <Github className="text-blue-500" size={32} />
                        <h1 className="text-2xl font-bold">GitHub Setup</h1>
                    </div>
                    <p className="text-[var(--foreground)]/60 mb-6">
                        This app uses GitHub Issues as a database. Please enter your credentials to continue.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Personal Access Token</label>
                            <input
                                type="password"
                                value={formData.token}
                                onChange={e => setFormData({ ...formData, token: e.target.value })}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ghp_..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Repository Owner</label>
                            <input
                                type="text"
                                value={formData.owner}
                                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="your-username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Repository Name</label>
                            <input
                                type="text"
                                value={formData.repo}
                                onChange={e => setFormData({ ...formData, repo: e.target.value })}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="fitness-data"
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-3">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            Connect to GitHub
                        </button>
                    </form>
                    <p className="text-xs text-[var(--foreground)]/40 mt-6">
                        Need help? Create a Personal Access Token at GitHub → Settings → Developer Settings → Personal Access Tokens (Classic) with <code className="bg-[var(--background)] px-1 py-0.5 rounded">repo</code> scope.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
