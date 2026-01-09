import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';

export const Subtitles: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    const currentLyricIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        if (!nextLine) return true;
        return currentTime >= line.time && currentTime < nextLine.time;
    });

    if (currentLyricIndex === -1 || currentTime < lyrics[0].time) {
        return null;
    }

    const currentLyric = lyrics[currentLyricIndex];
    const nextLyric = lyrics[currentLyricIndex + 1];

    const timeSinceStart = currentTime - currentLyric.time;
    const duration = nextLyric ? nextLyric.time - currentLyric.time : 5;

    const isHitoe = currentLyric.text.includes("ひとへ");

    // Simplified styling: Vertical, Muted Color, Consistent Size
    // Fix: strictly monotonically increasing check
    const opacity = interpolate(timeSinceStart,
        (() => {
            const p1 = Math.min(1, duration * 0.4);
            const p3 = duration;

            // "Hitoe" fades out gently (fluffy), others cut sharply
            const fadeOutStartOffset = isHitoe ? 1.5 : 0.2;

            // Ensure p2 is greater than p1
            const p2 = Math.max(p1 + 0.01, duration - fadeOutStartOffset);
            if (p2 >= p3) {
                // If duration is too short, just do a simple fade in/out or skip logic
                return [0, p1, p3 - 0.01, p3];
            }
            return [0, p1, p2, p3];
        })(),
        [0, 1, 1, 0]
    );

    return (
        <AbsoluteFill>
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: isHitoe ? 'auto' : '9%', // Shifted further right (approx Grid 18)
                    left: isHitoe ? '50%' : 'auto',
                    transform: isHitoe ? 'translate(-50%, -50%)' : 'translate(50%, -50%)',
                    fontFamily: "'A1 Mincho', serif",
                    fontSize: '60px',
                    color: '#D4D4D8',
                    opacity,
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    letterSpacing: '0.2em',
                    whiteSpace: 'nowrap',
                    textShadow: '0px 0px 10px rgba(0,0,0,0.5)',
                    textAlign: 'center',
                }}
            >
                {currentLyric.text}
            </div>
        </AbsoluteFill>
    );
};
