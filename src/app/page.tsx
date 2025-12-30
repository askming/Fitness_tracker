
'use client';

import { useEffect, useState } from 'react';
import TopNav from "@/components/TopNav";
import Calendar from "@/components/Calendar";
import Link from "next/link";
import SummaryChart from "@/components/SummaryChart";
import { Activity, Footprints, Moon, Loader2 } from "lucide-react";
import { getGithubConfig, getWorkouts, getProfiles, Workout, UserProfile } from '@/lib/github';
import { getActivityIcon } from '@/lib/icons';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<{ date: string, steps: number, sleepMinutes: number }[]>([]);
  // Since we don't have DailyStats table anymore, we have to derive "Steps" and "Sleep" from something.
  // Wait, the user previously had Apple Health sync which pushed to 'dailyStats'. 
  // If we move to GitHub Issues, we need a way to store Daily Stats as issues too? 
  // Let's assume we create issues with label 'daily-stat' for now to keep parity?
  // OR, for the 'Refactor', maybe we just focus on Workouts first?
  // The plan said "Data Storage: JSON stringified inside Issue Body".
  // So 'daily-stat' is another issue type. I didn't add it to `github.ts` yet. 
  // I should add `getDailyStats` to `github.ts` or just reuse generic fetching?
  // For now, let's just make 'Workouts' work and leave Stats as 0/Empty or I can quickly add a `getDailyStats` helper if I want to be thorough. 
  // Let's assume 0 for Stats for this iteration to get the "App Shell" working, and I can add Daily Stat syncing later.
  // Actually, the sketch shows Sleep Sentence. 
  // I'll update the logic to just use 0s for now to ensure the UI renders, then we can "pollish" the data source.

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [totalWeeklyHours, setTotalWeeklyHours] = useState(0);
  const [totalWeeklyMins, setTotalWeeklyMins] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const config = getGithubConfig();
      if (!config) return;

      // Parallel fetch
      const [workouts, profiles] = await Promise.all([
        getWorkouts(config),
        getProfiles(config)
      ]);

      if (profiles.length > 0) {
        setUserName(profiles[0].name);
      }

      setAllWorkouts(workouts); // Store all for calendar
      setRecentWorkouts(workouts); // Keep all for filtering logic

      // Calc Weekly Workout Time
      // Filter last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const weekWorkouts = workouts.filter(w => new Date(w.date) >= sevenDaysAgo);
      const totalDuration = weekWorkouts.reduce((acc, curr) => {
        let mins = 0;
        if (curr.unit === 'mins') mins = curr.amount || 0;
        else if (curr.unit === 'hrs') mins = (curr.amount || 0) * 60;
        else if (!curr.unit && curr.duration) mins = curr.duration; // Legacy
        return acc + mins;
      }, 0);

      setTotalWeeklyHours(Math.floor(totalDuration / 60));
      setTotalWeeklyMins(totalDuration % 60);

      setLoading(false);
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
  const sleepHours = 0;
  const sleepMins = 0;
  const avgSleepH = 0;
  const avgSleepM = 0;
  // Steps chart data mock
  const mockWeeklyStats = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return { date: d.toISOString().split('T')[0], steps: 0, sleepMinutes: 0 };
  });

  // Filter workouts for selected date
  const selectedDateWorkouts = allWorkouts.filter(w =>
    new Date(w.date).toDateString() === selectedDate.toDateString()
  );

  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const displayDate = isToday ? "Today's activities" : `Activities for ${selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

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
              className="flex items-center gap-1 text-sm text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-full hover:bg-[var(--primary)]/20 transition-colors"
            >
              <Activity size={14} />
              Add activity
            </Link>
          </div>
        </div>

        <ul className="flex flex-col gap-3 pl-4 list-disc marker:text-[var(--muted-foreground)]">
          {/* Only show mock Sleep/Steps if Today (logic placeholder) */}
          {isToday && (
            <>
              <li className="text-[var(--muted-foreground)] pl-2">
                You slept for <span className="text-white underline decoration-dashed decoration-gray-500 underline-offset-4">___ hours</span> and <span className="text-white underline decoration-dashed decoration-gray-500 underline-offset-4">___ minutes</span> today.
              </li>

              <li className="text-[var(--muted-foreground)] pl-2">
                You walked <span className="text-white underline decoration-dashed decoration-gray-500 underline-offset-4">xx</span> steps today.
              </li>
            </>
          )}

          {selectedDateWorkouts.map((workout) => {
            const Icon = getActivityIcon(workout.type);

            return (
              <li key={workout.id} className="text-[var(--muted-foreground)] pl-2 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span>
                    <Icon size={16} className="inline mr-2 -mt-1" />
                    <span className="text-white">{workout.type}</span> for <span className="text-white">{workout.amount ?? workout.duration}</span> {workout.unit ?? 'mins'}
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
              </li>
            );
          })}

          {selectedDateWorkouts.length === 0 && !isToday && (
            <li className="text-[var(--muted-foreground)] opacity-50 italic pl-2 list-none -ml-4">
              No workouts recorded for this day.
            </li>
          )}

          {/* If today and no workouts, but we showed sleep/steps, maybe don't show "No workouts" generic msg or keep it? Keeping it simple. */}
        </ul>
      </section>

    </div>
  );
}
