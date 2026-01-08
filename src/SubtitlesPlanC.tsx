import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';
import { SvgText } from './SvgText';

export const SubtitlesPlanC: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Find the current lyric
    const currentLyricIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        if (!nextLine) return true; // It's the last line
        return currentTime >= line.time && currentTime < nextLine.time;
    });

    if (currentLyricIndex === -1 || currentTime < lyrics[0].time) {
        return null;
    }

    const currentLyric = lyrics[currentLyricIndex];
    const nextLyric = lyrics[currentLyricIndex + 1];

    // Animation logic
    const timeSinceStart = currentTime - currentLyric.time;
    const duration = nextLyric ? nextLyric.time - currentLyric.time : 5;

    // Fade logic (for normal text)
    const FADE_TIME = 1;
    const fadeInEnd = Math.min(FADE_TIME, duration * 0.4);
    const fadeOutStart = Math.max(duration - FADE_TIME, duration * 0.6);

    const opacity = interpolate(
        timeSinceStart,
        [0, fadeInEnd, fadeOutStart, duration],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const translateY = interpolate(
        timeSinceStart,
        [0, 1],
        [10, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Identify special phases
    const SORA_TEXT = "空なんて";
    const UBAE_TEXT = "奪えなくていい";

    // Check if we are in the "Sora" phase (Active or Ghost)
    const isSoraActive = currentLyric.text.includes(SORA_TEXT);
    const isUbaeActive = currentLyric.text.includes(UBAE_TEXT);

    // Show Sora layer if it's the current line OR if Ubae is the current line (as background)
    const showSoraLayer = isSoraActive || isUbaeActive;

    // Show Normal Text only if NO special layers are active
    const showNormalText = !isSoraActive && !isUbaeActive;

    // Normal text base transform
    const baseTransform = `translateY(-50%) translateY(${translateY}px)`;

    return (
        <AbsoluteFill>
            {/* --- 1. The Giant "Sky" Layer - PLAN C: AGGREGATION --- */}
            {showSoraLayer && (
                <div
                    style={{
                        position: 'absolute',
                        left: '50%', top: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontFamily: "'A1 Mincho', serif",
                        zIndex: 0, width: '100%', height: '100%',
                        overflow: 'visible',
                        opacity: isUbaeActive ? 0.3 : 1,
                        transition: 'opacity 1s ease-in-out',
                    }}
                >
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {SORA_TEXT.split('').map((char, index) => {
                            const isSoraChar = char === '空';
                            const scale = isSoraChar ? 15 : 9;

                            // Final Positions
                            let targetX = 960;
                            let targetY = 540;
                            if (index === 0) { targetX = 960; targetY = 300; }
                            if (index === 1) { targetX = 1500; targetY = 700; }
                            if (index === 2) { targetX = 400; targetY = 800; }
                            if (index === 3) { targetX = 1100; targetY = 900; }

                            // Initial Positions (Scattered)
                            // Random directions for impact
                            let startX = targetX;
                            let startY = targetY;
                            // Sora comes from top, others from sides
                            if (index === 0) { startY = -600; } // From Top
                            if (index === 1) { startX = 2500; } // From Far Right
                            if (index === 2) { startX = -600; } // From Far Left
                            if (index === 3) { startY = 1600; } // From Far Bottom

                            // Animation: Gather in first 1.5 seconds
                            // Only if active (first intro). If host, assume already gathered.
                            const gatherProgress = isSoraActive
                                ? interpolate(timeSinceStart, [0, 1.2], [0, 1], { extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) }) // Cubic ease out
                                : 1;

                            const currentX = interpolate(gatherProgress, [0, 1], [startX, targetX]);
                            const currentY = interpolate(gatherProgress, [0, 1], [startY, targetY]);

                            // Draw text as well - animate opacity or stroke
                            const drawProgress = isSoraActive
                                ? interpolate(timeSinceStart, [0.5, 3], [0, 1], { extrapolateRight: 'clamp' })
                                : 1;

                            return (
                                <div
                                    key={`sora-${index}`}
                                    style={{
                                        position: 'absolute',
                                        left: 0, top: 0,
                                        transform: `translate(${currentX}px, ${currentY}px) translate(-50%, -50%) scale(${scale})`,
                                    }}
                                >
                                    <SvgText
                                        text={char}
                                        fontSize={50}
                                        progress={drawProgress}
                                        color="#FFFDF8"
                                        strokeWidth={1}
                                        style={{ opacity: 0.8 }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- 2. The "Ground" Layer - PLAN C: AGGREGATION --- */}
            {isUbaeActive && (
                <div
                    style={{
                        position: 'absolute',
                        left: '150px', bottom: '150px',
                        fontFamily: "'A1 Mincho', serif",
                        zIndex: 10, writingMode: 'vertical-rl', textOrientation: 'upright',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {UBAE_TEXT.split('').map((char, index) => {
                        // Ink Bleed
                        const delay = index * 0.1;
                        const bleedProgress = interpolate(
                            timeSinceStart,
                            [delay + 0.5, delay + 1.5],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );

                        // Aggregation (Gather from slight distance)
                        // Characters shift into place from below?
                        const shiftProgress = interpolate(
                            timeSinceStart,
                            [delay, delay + 0.8],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );
                        const shiftY = interpolate(shiftProgress, [0, 1], [100, 0]); // Move up 100px into place

                        const opacityFade = interpolate(shiftProgress, [0, 1], [0, 1]);

                        return (
                            <div
                                key={`ubae-${index}`}
                                style={{
                                    display: 'inline-block',
                                    marginBottom: '15px',
                                    transform: `translateY(${shiftY}px)`,
                                    opacity: opacityFade,
                                }}
                            >
                                <SvgText
                                    text={char}
                                    fontSize={48}
                                    progress={bleedProgress}
                                    color="#FFFDF8"
                                    strokeWidth={0} // Fill only
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- 3. Normal Text Layer --- */}
            {showNormalText && (
                <div
                    style={{
                        position: 'absolute',
                        left: '1650px', top: '50%',
                        transform: baseTransform,
                        fontFamily: "'A1 Mincho', serif", fontSize: '50px', fontWeight: 500,
                        color: '#FFFDF8', textShadow: '2px 2px 10px rgba(0,0,0,0.8)',
                        textAlign: 'center', opacity,
                        writingMode: 'vertical-rl', textOrientation: 'upright',
                        letterSpacing: '0.2em', whiteSpace: 'nowrap', zIndex: 1,
                    }}
                >
                    {currentLyric.text}
                </div>
            )}
        </AbsoluteFill >
    );
};
