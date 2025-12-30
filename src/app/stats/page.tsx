
'use client';

import { useEffect, useState } from 'react';
import TopNav from "@/components/TopNav";

export default function StatsPage() {
    // Placeholder for now
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Statistics</h1>
                <TopNav />
            </div>
            <div className="glass p-8 rounded-2xl text-center text-[var(--muted-foreground)]">
                Detailed statistics coming soon.
            </div>
        </div>
    );
}
