
import { Octokit } from 'octokit';

// Types
export type GithubConfig = {
    token: string;
    owner: string;
    repo: string;
};

export type Workout = {
    id: number; // Issue Number
    type: string;
    duration?: number; // Kept for backward compatibility
    amount?: number;
    unit?: string;
    calories: number;
    date: string;
    userId?: number;
    notes?: string;
};

export type UserProfile = {
    name: string;
    age?: number;
    weight?: number;
    height?: number;
};

export type DailyStat = {
    id: number; // Issue Number
    type: string; // 'daily-stats'
    steps?: string | number;
    sleep_hours?: string | number;
    unit?: string;
    date: string;
    userId?: number;
};

// Keys for LocalStorage
export const STORAGE_KEY = 'fitness_tracker_gh_config';

// Helper to get config
export const getGithubConfig = (): GithubConfig | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
};

// Initialize Octokit
const getOctokit = (token: string) => new Octokit({ auth: token });

// --- API METHODS ---

// 1. Validate Credentials
export async function validateConfig(config: GithubConfig): Promise<boolean> {
    try {
        const octokit = getOctokit(config.token);
        await octokit.request(`GET /repos/${config.owner}/${config.repo}`);
        return true;
    } catch (e) {
        console.error("Validation failed", e);
        return false;
    }
}

// 2. Workouts
export async function getWorkouts(config: GithubConfig): Promise<Workout[]> {
    const octokit = getOctokit(config.token);
    // Fetch all open issues, then filter by content
    // Labels are unreliable on new restricted repos if they don't exist yet
    const { data } = await octokit.request(`GET /repos/${config.owner}/${config.repo}/issues`, {
        state: 'open',
        sort: 'created',
        direction: 'desc',
        per_page: 100,
    });

    return data.map((issue: any) => {
        try {
            const content = JSON.parse(issue.body || '{}');
            // Check for _type OR legacy heuristic (has 'type' and 'duration')
            const isWorkout = content._type === 'workout' || (content.type && content.duration !== undefined);

            if (!isWorkout) return null;
            return { ...content, id: issue.number, date: content.date || issue.created_at };
        } catch (e) {
            return null;
        }
    }).filter(Boolean) as Workout[];
}

export async function getWorkout(config: GithubConfig, id: number): Promise<Workout | null> {
    const octokit = getOctokit(config.token);
    try {
        const { data } = await octokit.request(`GET /repos/${config.owner}/${config.repo}/issues/${id}`);
        const content = JSON.parse(data.body || '{}');
        return { ...content, id: data.number, date: content.date || data.created_at };
    } catch (e) {
        return null;
    }
}

export async function saveWorkout(config: GithubConfig, workout: Omit<Workout, 'id'>, id?: number) {
    const octokit = getOctokit(config.token);
    const payload = { ...workout, _type: 'workout' };

    if (id) {
        await octokit.request(`PATCH /repos/${config.owner}/${config.repo}/issues/${id}`, {
            title: `Activity: ${workout.type} - ${new Date(workout.date).toLocaleDateString()}`,
            body: JSON.stringify(payload, null, 2),
            labels: ['activity']
        });
    } else {
        await octokit.request(`POST /repos/${config.owner}/${config.repo}/issues`, {
            title: `Activity: ${workout.type} - ${new Date(workout.date).toLocaleDateString()}`,
            body: JSON.stringify(payload, null, 2),
            labels: ['activity']
        });
    }
}

// Retro-compatibility wrapper
export const createWorkout = (config: GithubConfig, workout: Omit<Workout, 'id'>) => saveWorkout(config, workout);


// 3. Profile
export async function getProfiles(config: GithubConfig): Promise<(UserProfile & { id: number })[]> {
    const octokit = getOctokit(config.token);
    const { data } = await octokit.request(`GET /repos/${config.owner}/${config.repo}/issues`, {
        state: 'open',
        per_page: 100,
    });

    return data.map((issue: any) => {
        try {
            const content = JSON.parse(issue.body || '{}');
            // Check for _type OR legacy heuristic (has 'name' but NO 'type' which would be workout)
            const isProfile = content._type === 'profile' || (content.name && !content.type && !content.steps);

            if (!isProfile) return null;
            return { ...content, id: issue.number };
        } catch (e) {
            return null;
        }
    }).filter(Boolean);
}

export async function saveProfile(config: GithubConfig, profile: UserProfile, issueNumber?: number) {
    const octokit = getOctokit(config.token);
    const payload = { ...profile, _type: 'profile' };

    if (issueNumber) {
        await octokit.request(`PATCH /repos/${config.owner}/${config.repo}/issues/${issueNumber}`, {
            title: `Profile: ${profile.name}`,
            body: JSON.stringify(payload, null, 2),
            labels: ['profile']
        });
    } else {
        await octokit.request(`POST /repos/${config.owner}/${config.repo}/issues`, {
            title: `Profile: ${profile.name}`,
            body: JSON.stringify(payload, null, 2),
            labels: ['profile']
        });
    }
}

export async function deleteIssue(config: GithubConfig, issueNumber: number) {
    const octokit = getOctokit(config.token);
    await octokit.request(`PATCH /repos/${config.owner}/${config.repo}/issues/${issueNumber}`, {
        state: 'closed'
    });
}

// 4. Daily Stats
export async function getDailyStats(config: GithubConfig): Promise<DailyStat[]> {
    const octokit = getOctokit(config.token);
    const { data } = await octokit.request(`GET /repos/${config.owner}/${config.repo}/issues`, {
        state: 'open',
        labels: 'daily-stats',
        per_page: 100,
    });

    console.log('getDailyStats - Raw issues fetched:', data.length);
    console.log('getDailyStats - Raw data:', data);

    return data.map((issue: any) => {
        try {
            const content = JSON.parse(issue.body || '{}');
            console.log('getDailyStats - Parsed content:', content);
            // Check for _type === 'daily-stats'
            if (content._type !== 'daily-stats') {
                console.log('getDailyStats - Skipping issue, _type is:', content._type);
                return null;
            }
            const result = { ...content, id: issue.number, type: 'daily-stats' };
            console.log('getDailyStats - Returning stat:', result);
            return result;
        } catch (e) {
            console.error('getDailyStats - Parse error:', e);
            return null;
        }
    }).filter(Boolean) as DailyStat[];
}
