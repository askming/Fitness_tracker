'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Workout } from '@/lib/github';
import clsx from 'clsx';

export default function Calendar({
    workouts,
    selectedDate,
    onDateSelect
}: {
    workouts: Workout[],
    selectedDate: Date,
    onDateSelect: (date: Date) => void
}) {
    const [currentDate, setCurrentDate] = useState(selectedDate);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate padding days for the grid (starts on Sunday)
    const startDay = getDay(monthStart); // 0 = Sunday
    const paddingDays = Array.from({ length: startDay });

    function handlePrevMonth() {
        setCurrentDate(subMonths(currentDate, 1));
    }

    function handleNextMonth() {
        setCurrentDate(addMonths(currentDate, 1));
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-medium">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-2 bg-transparent hover:text-blue-500 transition-colors text-[var(--muted-foreground)]">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 bg-transparent hover:text-blue-500 transition-colors text-[var(--muted-foreground)]">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 text-center mb-2">
                {/* Weekday Headers */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-xs font-semibold text-[var(--muted-foreground)] py-2 font-serif">
                        {day}
                    </div>
                ))}

                {/* Padding Days */}
                {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} />
                ))}

                {/* Days */}
                {daysInMonth.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);
                    // Check if any workout exists on this day
                    const hasWorkout = workouts.some(w => isSameDay(new Date(w.date), day));

                    return (
                        <div key={day.toISOString()} className="flex items-center justify-center p-0.5">
                            <button
                                onClick={() => onDateSelect(day)}
                                className={clsx(
                                    "w-full h-full aspect-square flex flex-col items-center justify-center relative rounded-full transition-all border-solid",
                                    isSelected ? "border-2 border-blue-600 ring-1 ring-blue-500/20" : (isToday ? "border border-blue-500" : "border border-transparent"),
                                    "bg-transparent hover:bg-blue-500/10"
                                )}
                            >
                                <span className={clsx(
                                    "text-sm relative z-10",
                                    isSelected ? "text-blue-600 font-bold" : (isToday ? "text-[var(--foreground)] font-bold" : "text-[var(--foreground)]")
                                )}>
                                    {format(day, 'd')}
                                </span>

                                {/* Dot Indicator */}
                                {hasWorkout && (
                                    <div className={clsx(
                                        "absolute bottom-1 w-1 h-1 rounded-full",
                                        "bg-blue-500"
                                    )} />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
