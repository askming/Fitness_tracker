
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, BarChart2, User, Moon, Sun } from 'lucide-react'; // Added Moon, Sun
import clsx from 'clsx';
import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';

export default function TopNav() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    // avoid hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    function toggleTheme() {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Log', href: '/log', icon: PlusCircle },
        { name: 'Stats', href: '/stats', icon: BarChart2 },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    if (!mounted) return null; // or a skeleton loader

    return (
        <div className="flex items-center gap-6">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "flex flex-col items-center justify-center transition-colors duration-200 p-2 gap-1", // Changed to flex-col and added gap
                            isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                    >
                        <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
                        {/* Active Dot */}
                        <div className={clsx(
                            "w-1.5 h-1.5 rounded-full bg-[var(--primary)] transition-all duration-300",
                            isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                        )} />
                    </Link>
                );
            })}

            {/* Theme Toggle - Pure transparent, no background */}
            <button
                onClick={toggleTheme}
                className={clsx(
                    "flex items-center justify-center transition-colors duration-200 p-2 bg-transparent hover:bg-transparent active:scale-95 border-none outline-none focus:outline-none",
                    theme === 'dark' ? "text-yellow-400" : "text-[var(--foreground)]"
                )}
            >
                {theme === 'dark' ? <Sun size={28} /> : <Moon size={28} />}
            </button>
        </div>
    );
}
