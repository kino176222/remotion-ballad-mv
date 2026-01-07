import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';

export const Subtitles: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Find the current lyric
    // We want to show the lyric that started most recently, but before the next one starts
    const currentLyricIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        if (!nextLine) return true; // It's the last line
        return currentTime >= line.time && currentTime < nextLine.time;
    });

    // Also handle cases where we are before the first lyric or after the last
    const currentLyric = lyrics[currentLyricIndex];
    const nextLyric = lyrics[currentLyricIndex + 1];

    // If we shouldn't show anything (e.g. before first lyric), check time
    if (currentLyricIndex === -1 || currentTime < lyrics[0].time) {
        return null;
    }

    // Animation logic
    const timeSinceStart = currentTime - currentLyric.time;
    const duration = nextLyric ? nextLyric.time - currentLyric.time : 5; // Default 5s for last line

    // Calculate safe fade durations based on line length
    const FADE_TIME = 1;
    const fadeInEnd = Math.min(FADE_TIME, duration * 0.4);
    const fadeOutStart = Math.max(duration - FADE_TIME, duration * 0.6);

    const opacity = interpolate(
        timeSinceStart,
        [0, fadeInEnd, fadeOutStart, duration],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Slide up effect
    const translateY = interpolate(
        timeSinceStart,
        [0, 1],
        [10, 0], // Move up 10px during fade in
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill>
            <div
                style={{
                    position: 'absolute',
                    left: '1650px', // X=16.5
                    top: '50%', // Center vertically
                    transform: `translateY(-50%) translateY(${translateY}px)`, // Center anchor + animation
                    fontFamily: "'A1 Mincho', serif",
                    fontSize: '42px', // Smaller font
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.95)',
                    textShadow: '2px 2px 10px rgba(0,0,0,0.8)',
                    textAlign: 'center', // Center text alignment
                    opacity,
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    letterSpacing: '0.2em', // Wider spacing
                    whiteSpace: 'nowrap',
                }}
            >
                {currentLyric.text}
            </div>
        </AbsoluteFill >
    );
};
