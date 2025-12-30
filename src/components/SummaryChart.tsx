
'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SummaryChartProps {
    data: { date: string; steps: number }[];
}

export default function SummaryChart({ data }: SummaryChartProps) {
    const chartData = data.map(d => {
        // Parse "YYYY-MM-DD" manually to create a local date
        const [year, month, day] = d.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            steps: d.steps
        };
    });

    return (
        <div className="w-full h-[200px] mt-4 glass rounded-xl p-4">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">Daily Steps</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis
                        dataKey="name"
                        stroke="#a3a3a3"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', background: '#171717', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                    />
                    <Bar dataKey="steps" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
