
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

export default function Navigation() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Log', href: '/log', icon: PlusCircle },
        { name: 'Stats', href: '/stats', icon: BarChart2 },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
            <div className="w-full max-w-[480px] bg-[#171717]/90 backdrop-blur-md border-t border-[#262626] flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                                isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-white"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
