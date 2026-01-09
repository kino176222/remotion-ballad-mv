// LyricConfig.ts
// This file defines the configuration for special lyric appearances.
// Ideally, this list grows as we add more special effects to different parts of the song.

export type AnimationType = 'BIG_OUTLINE' | 'FLOAT_UP' | 'WAVE' | 'FADE_IN_OUT';

export interface LyricConfigItem {
    keyword: string;           // The text snippet to match
    startTime?: number;        // Optional: Only apply if lyric starts around this time (in seconds)
    type: AnimationType;       // The visual effect type
    top: number;               // CSS top %
    left: number;             // CSS left %
    scale: number;             // Transform scale
    zIndex?: number;           // Layer priority
    color?: string;            // Text color (if override needed)
    strokeColor?: string;      // Stroke color
    strokeWidth?: number;      // Stroke width
    fontFamily?: string;       // Custom font if needed
    opacity?: number;          // Base opacity
}

// Default styles for patterns
// We can use these to quickly populate the list
export const PATTERN_A = {
    SKY: { type: 'BIG_OUTLINE', top: 30, left: 50, scale: 2.5, zIndex: 0, opacity: 0.5 } as const,
    NANTE: { type: 'FLOAT_UP', top: 60, left: 50, scale: 1.5, zIndex: 10 } as const,
    WAKE: { type: 'WAVE', top: 85, left: 50, scale: 1.0, zIndex: 10 } as const,
};

// 01:23 "空なんて" specific pattern
export const lyricConfigs: LyricConfigItem[] = [
    // Pattern A: 01:23
    { keyword: "空", startTime: 83, ...PATTERN_A.SKY, type: 'BIG_OUTLINE' },
    { keyword: "なんて", startTime: 83, ...PATTERN_A.NANTE, type: 'FLOAT_UP' },
    { keyword: "分けなくていい", startTime: 84, ...PATTERN_A.WAKE, type: 'WAVE' },
    { keyword: "奪えなくていい", startTime: 154, ...PATTERN_A.WAKE, type: 'WAVE' },

    // Example Pattern B: 03:02 (Placeholder for future)
    // { keyword: "空", startTime: 182, ...PATTERN_B.SKY },

    // Example Pattern C: 03:57 (Placeholder for future)
    // { keyword: "空", startTime: 237, ...PATTERN_C.SKY },
];
