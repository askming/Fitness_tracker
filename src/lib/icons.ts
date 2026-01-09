import { Activity, Footprints, Bike, Dumbbell, Waves, MonitorPlay, Mountain, User } from 'lucide-react';

export function getActivityIcon(type: string) {
    const lower = type.toLowerCase();
    if (lower.includes('run') || lower.includes('walk') || lower.includes('hike')) return Footprints;
    if (lower.includes('cycl') || lower.includes('bike')) return Bike;
    if (lower.includes('swim') || lower.includes('pool')) return Waves;
    if (lower.includes('gym') || lower.includes('weight') || lower.includes('lift')) return Dumbbell;
    if (lower.includes('yoga') || lower.includes('pilates')) return User; // Or a better icon if available
    if (lower.includes('hiit') || lower.includes('cardio')) return Activity;
    if (lower.includes('tennis') || lower.includes('sport')) return Activity;
    return Activity; // Default
}

// Helper to get default unit based on activity type
export function getActivityUnit(type: string): string {
    const lower = type.toLowerCase();
    
    // Rep/count based activities
    if (lower.includes('push-up') || lower.includes('pushup') || lower.includes('pull-up') || 
        lower.includes('pullup') || lower.includes('sit-up') || lower.includes('situp') ||
        lower.includes('dip') || lower.includes('squat') || lower.includes('crunch')) {
        return 'reps';
    }
    
    // Distance-based activities
    if (lower.includes('run') || lower.includes('cycl') || lower.includes('bike') || lower.includes('swim')) {
        return 'km';
    }
    
    // Default to minutes for most other activities (yoga, gym, cardio, etc.)
    return 'mins';
}
