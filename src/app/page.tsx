
'use client';

import { useEffect, useState } from 'react';
import TopNav from "@/components/TopNav";
import Calendar from "@/components/Calendar";
import Link from "next/link";
import SummaryChart from "@/components/SummaryChart";
import { Activity, Footprints, Moon, Loader2 } from "lucide-react";
import { getGithubConfig, getWorkouts, getProfiles, getDailyStats, Workout, UserProfile, DailyStat } from '@/lib/github';
import { getActivityIcon } from '@/lib/icons';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [allDailyStats, setAllDailyStats] = useState<DailyStat[]>([]);
  const [allProfiles, setAllProfiles] = useState<(UserProfile & { id: number })[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());


  useEffect(() => {
    async function fetchData() {
      const config = getGithubConfig();
      if (!config) {
        setLoading(false);
        return;
      }

      try {
        // Fetch workouts from GitHub
        const workouts = await getWorkouts(config);
        setAllWorkouts(workouts);

        // Fetch daily stats from GitHub
        const dailyStats = await getDailyStats(config);
        setAllDailyStats(dailyStats);

        // Fetch user profiles from GitHub
        const profiles = await getProfiles(config);
        setAllProfiles(profiles);
        if (profiles.length > 0) {
          setUserName(profiles[0].name);
        }
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

  // Mock data for Sleep/Steps since we haven't ported 'DailyStats' to Issues yet
  const sleepHours = 7;
  const sleepMins = 30;
  // Steps chart data mock
  const mockWeeklyStats = [];

  // Helper function to parse date from daily stats and get stats for selected date
  // Handles multiple records per day by aggregating them
  const getDailyStatsForDate = (date: Date): { steps: number; sleepHours: number; sleepMins: number } => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const statsForDate = allDailyStats.filter(stat => {
      // Parse the date from the stat (format: "Jan 7, 2026 at 8:00 AM")
      const statDate = new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return statDate === dateStr;
    });

    // Aggregate multiple records for the same day
    let totalSteps = 0;
    let totalSleepHours = 0;
    let totalSleepMins = 0;

    statsForDate.forEach(stat => {
      if (stat.steps) {
        totalSteps += parseInt(stat.steps.toString(), 10) || 0;
      }
      if (stat.sleep_hours) {
        const sleepValue = parseFloat(stat.sleep_hours.toString());
        if (!isNaN(sleepValue)) {
          // Handle both "7.5" format and "7 hours 30 mins" format
          totalSleepHours += Math.floor(sleepValue);
          totalSleepMins += Math.round((sleepValue % 1) * 60);
        }
      }
    });

    // Normalize minutes
    if (totalSleepMins >= 60) {
      totalSleepHours += Math.floor(totalSleepMins / 60);
      totalSleepMins = totalSleepMins % 60;
    }

    return {
      steps: totalSteps,
      sleepHours: totalSleepHours,
      sleepMins: totalSleepMins
    };
  };

  const todayStats = getDailyStatsForDate(selectedDate);
  const hasStatsForDate = todayStats.steps > 0 || todayStats.sleepHours > 0 || todayStats.sleepMins > 0;

  // Filter workouts for selected date
  const selectedDateWorkouts = allWorkouts.filter(w =>
    new Date(w.date).toDateString() === selectedDate.toDateString()
  );

  // Group workouts by userId
  const groupedWorkouts = selectedDateWorkouts.reduce((acc, workout) => {
    const userId = workout.userId ?? 'default';
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(workout);
    return acc;
  }, {} as Record<string | number, Workout[]>);

  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const displayDate = isToday ? "Today's activities" : `Activities for ${selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  // Helper function to get user name from userId
  const getUserName = (userId: string | number): string => {
    if (userId === 'default') return 'Unknown';
    const profile = allProfiles.find(p => p.id === Number(userId));
    return profile?.name || `User ${userId}`;
  };

  return (
    <div className="flex flex-col gap-8">

      {/* 1. Header with Name & Icons */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            My Fitness Tracker
          </h1>
          {/* User Name moved to Activities section */}
        </div>
        <TopNav />
      </header>

      {/* 2. Calendar Section */}
      <section>
        <Calendar
          workouts={allWorkouts}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </section>

      {/* Spacer - Increased from h-4 to h-8 */}
      <div className="h-8" />

      {/* 3. Activities List */}
      <section className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1 font-serif">
            Welcome back, {userName}
          </p>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-normal">{displayDate}</h2>

            {/* Add Activity Button for Selected Date */}
            <Link
              href={`/log?date=${selectedDate.toISOString().split('T')[0]}`}
              className="flex items-center gap-1 text-sm text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors"
            >
              <Activity size={14} />
              Add activity
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 pl-2">
          {/* Show Sleep/Steps if we have data for this day */}
          {hasStatsForDate && (
            <>
              {todayStats.sleepHours > 0 || todayStats.sleepMins > 0 && (
                <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                  <div className="p-2 rounded-full bg-purple-500/10 text-purple-400">
                    <Moon size={18} />
                  </div>
                  <span>
                    You slept for <span className="text-[var(--foreground)] underline decoration-dashed decoration-gray-500 underline-offset-4">{todayStats.sleepHours} hours</span> and <span className="text-[var(--foreground)] underline decoration-dashed decoration-gray-500 underline-offset-4">{todayStats.sleepMins} minutes</span>.
                  </span>
                </div>
              )}

              {todayStats.steps > 0 && (
                <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                  <div className="p-2 rounded-full bg-orange-500/10 text-orange-400">
                    <Footprints size={18} />
                  </div>
                  <span>
                    You walked <span className="text-[var(--foreground)] underline decoration-dashed decoration-gray-500 underline-offset-4">{todayStats.steps.toLocaleString()}</span> steps.
                  </span>
                </div>
              )}
            </>
          )}


          {Object.entries(groupedWorkouts).map(([userId, workouts]) => (
            <div key={userId} className="flex flex-col gap-2">
              {/* User header - only show if there are multiple users */}
              {Object.keys(groupedWorkouts).length > 1 && (
                <div className="text-sm font-medium text-[var(--muted-foreground)] mb-2 border-b border-gray-700/30 pb-2">
                  {getUserName(userId)}
                </div>
              )}
              
              {/* Workouts for this user */}
              {workouts.map((workout) => {
                const Icon = getActivityIcon(workout.type);

                return (
                  <div key={workout.id} className="text-[var(--muted-foreground)] pl-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span>
                        <Icon size={16} className="inline mr-2 -mt-1" />
                        <span className="text-[var(--foreground)]">{workout.type}</span> for <span className="text-[var(--foreground)]">{workout.amount ?? workout.duration}</span> {workout.unit ?? 'mins'}
                      </span>
                      <Link href={`/log?editId=${workout.id}`} className="ml-2 text-xs text-[var(--primary)] hover:underline opacity-50 hover:opacity-100">
                        (Edit)
                      </Link>
                    </div>
                    {workout.notes && (
                      <div className="text-xs text-[var(--muted-foreground)] italic ml-6 opacity-80">
                        "{workout.notes}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {selectedDateWorkouts.length === 0 && !isToday && (
            <div className="text-[var(--muted-foreground)] opacity-50 italic pl-2 ml-1">
              No workouts recorded for this day.
            </div>
          )}
        </div>
      </section >

    </div >
  );
}
