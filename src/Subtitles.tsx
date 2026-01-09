import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';

export const Subtitles: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Find the current lyric index
    const currentLyricIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        if (!nextLine) return true;
        return currentTime >= line.time && currentTime < nextLine.time;
    });

    if (currentLyricIndex === -1 || currentTime < lyrics[0].time) {
        return null;
    }

    const currentLyric = lyrics[currentLyricIndex];
    const prevLyric = lyrics[currentLyricIndex - 1];
    const nextLyric = lyrics[currentLyricIndex + 1];

    // Identify active lines
    const activeLines = [];

    // Check Current Line
    if (currentLyric) {
        let currentEndTime = nextLyric ? nextLyric.time : currentLyric.time + 5;

        // Fix Flicker: If current line is "Sora nante", extend its duration IMMEDIATELY.
        // This ensures the opacity curve uses the full "2-line duration" from the start,
        // preventing a jump when it switches to "Ghost" mode.
        if (currentLyric.text.includes("空なんて")) {
            const nextNextLyric = lyrics[currentLyricIndex + 2];
            if (nextNextLyric) {
                currentEndTime = nextNextLyric.time;
            } else {
                // Fallback extension
                currentEndTime += 3;
            }
        }

        activeLines.push({
            line: currentLyric,
            isGhost: false,
            endTime: currentEndTime
        });
    }

    // 2. Check Previous Line (Ghost "空なんて")
    if (prevLyric && prevLyric.text.includes("空なんて")) {
        // We want to keep showing Sora.
        // It dies when the CURRENT line (Next Line) dies.
        // So its endTime is SAME as current line's endTime.
        const currentLineEndTime = nextLyric ? nextLyric.time : currentTime + 5;
        activeLines.push({
            line: prevLyric,
            isGhost: true,
            endTime: currentLineEndTime
        });
    }

    return (
        <AbsoluteFill>
            {activeLines.map((item) => {
                const isSora = item.line.text.includes("空なんて");
                const isHitoe = item.line.text.includes("ひとへ");

                // Calculate individual opacity
                const duration = item.endTime - item.line.time;
                const timeSinceStart = currentTime - item.line.time;

                const fadeOutOffset = (isHitoe) ? 1.5 : 0.2;

                // Recalculate p2 based on dynamic duration
                const p1 = Math.min(1, duration * 0.4);
                const p3 = duration;
                const p2 = Math.max(p1 + 0.01, duration - fadeOutOffset);

                let opacityVals = [0, p1, p2, p3];
                if (p2 >= p3) opacityVals = [0, p1, p3 - 0.01, p3];

                const opacity = interpolate(timeSinceStart, opacityVals, [0, 1, 1, 0], { extrapolateRight: 'clamp' });

                // Layout Logic
                let rightPos = '9%';
                let topPos = '50%';
                let transform = 'translate(50%, -50%)';

                if (isHitoe) {
                    rightPos = 'auto';
                    topPos = '50%';
                    // left is handled in style override below
                } else if (isSora) {
                    // Sora Position: Reset to Right 9% (Grid 18), Move UP (Top 30%)
                    rightPos = '9%';
                    topPos = '30%';
                } else if (!isSora && prevLyric && prevLyric.text.includes("空なんて")) {
                    // This is the line AFTER Sora.
                    // Position: Shift More Right to 16 line (approx Right 14%)
                    // Start: Fixed Start Position (Top Aligned at 35%)
                    rightPos = '14%';
                    topPos = '35%';

                    if (item.line.text.includes("分けなくていい")) {
                        topPos = '28%';
                    }

                    transform = 'translate(50%, 0)'; // Aligns top of text to topPos
                } else {
                    // Standard lines (Grid 18 approx Right 9%)
                    rightPos = '9%';
                    topPos = '50%';
                }

                const isSoraPair = isSora || (!isSora && prevLyric && prevLyric.text.includes("空なんて")) || item.line.text.includes("祈るように叫ぶ");
                const textColor = isSoraPair ? '#D4D4D8' : '#878B8E';

                const style: React.CSSProperties = {
                    position: 'absolute',
                    top: topPos,
                    right: rightPos,
                    transform: transform,
                    fontFamily: "'A1 Mincho', serif",
                    fontSize: '60px',
                    color: textColor,
                    opacity,
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    letterSpacing: '0.2em',
                    whiteSpace: 'nowrap',
                    textShadow: '0px 0px 10px rgba(0,0,0,0.5)',
                    textAlign: 'center',
                };

                if (isHitoe) {
                    style.right = 'auto';
                    style.left = '50%';
                    style.transform = 'translate(-50%, -50%)';
                }

                return (
                    <div key={item.line.time} style={style}>
                        {item.line.text}
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};
