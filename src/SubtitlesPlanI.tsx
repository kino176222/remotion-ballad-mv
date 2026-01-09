import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';
import { SvgText } from './SvgText';
import { lyricConfigs, LyricConfigItem, AnimationType } from './LyricConfig';

// Helper to safely construct input ranges
const safeRange = (d: number) => {
    const p1 = Math.min(1, d * 0.4);
    const p3 = d;
    const p2 = Math.max(p1 + 0.01, d - 1);
    if (p2 >= p3) return [0, p1, p3 - 0.01, p3];
    return [0, p1, p2, p3];
};

export const SubtitlesPlanI: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // 1. Find Current Lyric Line
    const currentLyricIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        if (!nextLine) return true;
        return currentTime >= line.time && currentTime < nextLine.time;
    });

    if (currentLyricIndex === -1 || currentTime < lyrics[0].time) {
        return null; // Before song starts
    }

    const currentLyric = lyrics[currentLyricIndex];
    const nextLyric = lyrics[currentLyricIndex + 1];
    const timeSinceStart = currentTime - currentLyric.time;
    const duration = nextLyric ? nextLyric.time - currentLyric.time : 5;

    // 2. Check for Config Matches
    // We look for configs based on Keyword match AND StartTime proximity
    // (StartTime optional in config, but useful for differentiation)
    const matchingConfigs = lyricConfigs.filter(config => {
        const matchKeyword = currentLyric.text.includes(config.keyword);
        if (!matchKeyword) return false;

        if (config.startTime) {
            // Check if current lyric start time is close to config start time (allow 5 sec window)
            return Math.abs(currentLyric.time - config.startTime) < 5;
        }
        return true;
    });

    // 3. Render Normal Text IF no special configs cover the *entire* text
    // (Simplification: If any special config exists for this line, we might hide normal text
    //  OR we hide only if the config intends to replace standard display.
    //  In Plan H, we hid normal text if "Sora", "Nante", etc appeared.
    //  Let's assume: If matchingConfigs is not empty, hide normal text.)
    const showNormalText = matchingConfigs.length === 0;

    return (
        <AbsoluteFill>
            {/* === Special Layers (Config Driven) === */}
            {matchingConfigs.map((config, index) => {
                const globalOpacity = interpolate(timeSinceStart, safeRange(duration), [0, 1, 1, 0]);

                return (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: `${config.top}%`,
                            left: `${config.left}%`,
                            transform: `translate(-50%, -50%) scale(${config.scale})`,
                            zIndex: config.zIndex ?? 10,
                            opacity: globalOpacity,
                            display: 'flex',
                            gap: '10px' // Default gap
                        }}
                    >
                        {renderAnimatedText(config, timeSinceStart, frame)}
                    </div>
                );
            })}

            {/* === Normal Text Layer === */}
            {showNormalText && (
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        top: '80%',
                        textAlign: 'center',
                        fontFamily: "'A1 Mincho', serif",
                        fontSize: '50px',
                        color: '#FFFDF8',
                        opacity: interpolate(timeSinceStart, safeRange(duration), [0, 1, 1, 0]),
                        zIndex: 1,
                    }}
                >
                    {currentLyric.text}
                </div>
            )}
        </AbsoluteFill>
    );
};

// Helper: Render text based on AnimationType
const renderAnimatedText = (config: LyricConfigItem, timeSinceStart: number, frame: number) => {
    switch (config.type) {
        case 'BIG_OUTLINE':
            // "Sora" style: Giant outline, slow float
            return (
                <div style={{ transform: `translateY(${Math.sin(frame / 40) * 30}px)` }}>
                    <SvgText
                        text={config.keyword}
                        fontSize={240} // Base size (will be scaled by config.scale)
                        progress={interpolate(timeSinceStart, [0, 2], [0, 1], { extrapolateRight: 'clamp' })}
                        color="transparent"
                        strokeColor={config.strokeColor || "#FFFDF8"}
                        strokeWidth={config.strokeWidth || 2}
                        style={{ opacity: config.opacity ?? 1 }}
                    />
                </div>
            );

        case 'FLOAT_UP':
            // "Nante" style: Each char floats up
            return config.keyword.split('').map((char, i) => {
                const floatY = interpolate(timeSinceStart, [0.5 + i * 0.2, 2.0 + i * 0.2], [100, 0], { extrapolateRight: 'clamp', easing: (t) => t * (2 - t) });
                const alpha = interpolate(timeSinceStart, [0.5 + i * 0.2, 1.5 + i * 0.2], [0, 1], { extrapolateRight: 'clamp' });
                return (
                    <div key={i} style={{ transform: `translateY(${floatY}px)`, opacity: alpha }}>
                        <SvgText
                            text={char}
                            fontSize={80}
                            progress={1}
                            color={config.color || "#FFFDF8"}
                            strokeWidth={0}
                        />
                    </div>
                );
            });

        case 'WAVE':
            // "Wake/Ubae" style: Wavering chars
            return config.keyword.split('').map((char, i) => {
                const phaseDetails = i * 1.5;
                const waveY = Math.sin((frame / 20) + phaseDetails) * 5;
                const waveX = Math.cos((frame / 30) + phaseDetails) * 2;
                const waveRot = Math.sin((frame / 25) + phaseDetails) * 3;
                return (
                    <div
                        key={i}
                        style={{
                            transform: `translate(${waveX}px, ${waveY}px) rotate(${waveRot}deg)`,
                            transformOrigin: 'center center'
                        }}
                    >
                        <SvgText
                            text={char}
                            fontSize={70}
                            progress={interpolate(timeSinceStart, [i * 0.1, 1 + i * 0.1], [0, 1], { extrapolateRight: 'clamp' })}
                            color={config.color || "#FFFDF8"}
                            strokeWidth={0}
                        />
                    </div>
                );
            });

        default:
            // Fallback
            return <div>{config.keyword}</div>;
    }
};
