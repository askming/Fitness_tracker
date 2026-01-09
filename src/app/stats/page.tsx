
'use client';

import { useEffect, useState } from 'react';
import TopNav from "@/components/TopNav";
import { getGithubConfig, getWorkouts, getDailyStats, Workout, DailyStat } from '@/lib/github';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getActivityIcon, getActivityUnit } from '@/lib/icons';

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [allDailyStats, setAllDailyStats] = useState<DailyStat[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    async function fetchData() {
      const config = getGithubConfig();
      if (!config) {
        setLoading(false);
        return;
      }

      try {
        const workouts = await getWorkouts(config);
        setAllWorkouts(workouts);

        const dailyStats = await getDailyStats(config);
        setAllDailyStats(dailyStats);
      } catch (error) {
        console.error('Error fetching data from GitHub:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Get workouts for selected month
  const getWorkoutsForMonth = (date: Date): Workout[] => {
    return allWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.getMonth() === date.getMonth() && workoutDate.getFullYear() === date.getFullYear();
    });
  };

  // Get last 7 days of step data
  const getLast7DaysSteps = (): Array<{ date: string; steps: number }> => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const compareDateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const statsForDay = allDailyStats.filter(stat => {
        const datePartOnly = stat.date.includes(' at ') ? stat.date.split(' at ')[0] : stat.date;
        const statDate = new Date(datePartOnly).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return statDate === compareDateStr;
      });

      let totalSteps = 0;
      statsForDay.forEach(stat => {
        if (stat.steps) {
          totalSteps += parseInt(stat.steps.toString(), 10) || 0;
        }
      });

      last7Days.push({ date: dateStr, steps: totalSteps });
    }

    return last7Days;
  };

  const monthWorkouts = getWorkoutsForMonth(selectedMonth);
  const last7DaysData = getLast7DaysSteps();
  const maxSteps = Math.max(...last7DaysData.map(d => d.steps), 10000);

  // Calculate workout statistics
  const workoutStats = monthWorkouts.reduce((acc, workout) => {
    const type = workout.type;
    if (!acc[type]) {
      acc[type] = { count: 0, totalDuration: 0 };
    }
    acc[type].count++;
    const duration = workout.amount || workout.duration || 0;
    acc[type].totalDuration += duration;
    return acc;
  }, {} as Record<string, { count: number; totalDuration: number }>);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const monthYear = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Statistics
        </h1>
        <TopNav />
      </div>

      {/* 7-Day Step Chart */}
      <section className="glass p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Daily Steps (Last 7 Days)</h2>
        <div className="flex items-end gap-2 h-48 justify-between">
          {last7DaysData.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:opacity-80"
                style={{ height: `${(day.steps / maxSteps) * 160}px` }}
                title={`${day.steps.toLocaleString()} steps`}
              />
              <div className="text-xs text-[var(--muted-foreground)]">{day.date}</div>
              <div className="text-xs font-semibold text-[var(--foreground)]">
                {day.steps > 0 ? (day.steps / 1000).toFixed(1) + 'k' : '0'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly Workout Summary */}
      <section className="glass p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Workout Summary</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-700/50 rounded transition-colors"
              title="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium min-w-32 text-center">{monthYear}</span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-700/50 rounded transition-colors"
              title="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {monthWorkouts.length === 0 ? (
          <div className="text-center text-[var(--muted-foreground)] py-8">
            No workouts recorded for {monthYear}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{monthWorkouts.length}</div>
                <div className="text-xs text-[var(--muted-foreground)]">Total Workouts</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">
                  {Object.values(workoutStats).reduce((sum, stat) => sum + stat.totalDuration, 0)}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">Total Minutes</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {Object.keys(workoutStats).length}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">Activity Types</div>
              </div>
            </div>

            <div className="border-t border-gray-700/30 pt-4">
              <h3 className="text-sm font-semibold mb-3">Breakdown by Activity</h3>
              {Object.entries(workoutStats).map(([activityType, stats]) => {
                const Icon = getActivityIcon(activityType);
                const unit = getActivityUnit(activityType);
                return (
                  <div key={activityType} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-[var(--muted-foreground)]" />
                      <span className="capitalize">{activityType}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[var(--muted-foreground)]">{stats.count} sessions</span>
                      <span className="text-[var(--foreground)] font-semibold min-w-20 text-right">
                        {stats.totalDuration} {unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
