import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';
import { SvgText } from './SvgText';

// Define props interface
export interface SubtitlesPlanHProps {
    lyrics: LrcLine[];
    soraScale: number;
    soraTop: number;   // Percentage (0-100)
    soraLeft: number;  // Percentage
    nanteScale: number;
    nanteTop: number;  // Percentage
    nanteLeft: number; // Percentage
    wakeScale: number;
    wakeTop: number;   // Percentage
    wakeLeft: number;  // Percentage
}

export const SubtitlesPlanH: React.FC<SubtitlesPlanHProps> = ({
    lyrics,
    soraScale, soraTop, soraLeft,
    nanteScale, nanteTop, nanteLeft,
    wakeScale, wakeTop, wakeLeft
}) => {
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

    // Plan H:
    // 1. 空 (Sky): 3x larger impact, Outline, Floating.
    // 2. なんて (Nante): Floating up (Ukiyagaru). Solid White.
    // 3. 分けなくていい (Wakenakuteii): Horizontal. Solid White. WAIVERING EFFECT.
    // 4. Timing: All vanish together.

    const SORA_TEXT = "空なんて";
    const WAKE_TEXT = "分けなくていい";
    // const UBAE_TEXT = "奪えなくていい"; // Keep for compatibility if needed, but focus on Wake

    const isSoraActive = currentLyric.text.includes(SORA_TEXT);
    const isWakeActive = currentLyric.text.includes(WAKE_TEXT);
    const isUbaeActive = currentLyric.text.includes("奪えなくていい");

    // Also include Ubae for compatibility if it appears, but apply same effect?
    // User specifically asked for "Wakenakuteii"
    const isSpecialPhrase = isSoraActive || isWakeActive || isUbaeActive;
    const showNormalText = !isSpecialPhrase;

    // Exit Animation: Simultaneously fade out at end of phase
    let groupOpacity = 1;

    // Group logic: Sora stays until Wake/Ubae ends.
    // If we are in "Sora", opacity is fadeIn.
    // If we are in "Wake", opacity is fadeOut at end.
    if (isSoraActive) {
        groupOpacity = interpolate(timeSinceStart, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    } else if (isWakeActive || isUbaeActive) {
        groupOpacity = interpolate(timeSinceStart, [duration - 1, duration], [1, 0], { extrapolateLeft: 'clamp' });
    }

    return (
        <AbsoluteFill>
            {/* === Special Layer: Plan H === */}
            {isSpecialPhrase && (
                <AbsoluteFill style={{ opacity: groupOpacity }}>
                    {/* Layer 1: Huge Sky (空) - Always visible during this sequence */}
                    <div style={{
                        position: 'absolute',
                        top: `${soraTop}%`, // Prop
                        left: `${soraLeft}%`, // Prop
                        transform: 'translate(-50%, -50%)',
                        zIndex: 0,
                    }}>
                        <div style={{
                            transform: `translateY(${Math.sin(frame / 40) * 30}px) scale(${soraScale})`, // Prop
                        }}>
                            <SvgText
                                text="空"
                                fontSize={600} // Base size, scaled by prop
                                progress={isSoraActive ? interpolate(timeSinceStart, [0, 2], [0, 1], { extrapolateRight: 'clamp' }) : 1}
                                color="transparent"
                                strokeColor="#FFFDF8"
                                strokeWidth={2}
                                style={{ opacity: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Layer 2: なんて (Nante) - Floating up */}
                    {isSoraActive && (
                        <div style={{
                            position: 'absolute',
                            top: `${nanteTop}%`, // Prop
                            left: `${nanteLeft}%`, // Prop
                            transform: `translate(-50%, -50%) scale(${nanteScale})`, // Prop
                            zIndex: 10,
                            display: 'flex',
                            gap: '15px'
                        }}>
                            {["な", "ん", "て"].map((char, i) => {
                                const floatY = interpolate(timeSinceStart, [0.5 + i * 0.2, 2.0 + i * 0.2], [100, 0], { extrapolateRight: 'clamp', easing: (t) => t * (2 - t) });
                                const alpha = interpolate(timeSinceStart, [0.5 + i * 0.2, 1.5 + i * 0.2], [0, 1], { extrapolateRight: 'clamp' });

                                return (
                                    <div key={i} style={{ transform: `translateY(${floatY}px)`, opacity: alpha }}>
                                        <SvgText
                                            text={char}
                                            fontSize={80}
                                            progress={1}
                                            color="#FFFDF8"
                                            strokeWidth={0}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Layer 3: 分けなくていい (Wake) - Wavering Effect */}
                    {(isWakeActive || isUbaeActive) && (
                        <div style={{
                            position: 'absolute',
                            top: `${wakeTop}%`, // Prop
                            left: `${wakeLeft}%`, // Prop
                            transform: `translate(-50%, -50%) scale(${wakeScale})`, // Prop
                            zIndex: 10,
                            display: 'flex',
                            gap: '10px'
                        }}>
                            {(isWakeActive ? WAKE_TEXT : "奪えなくていい").split('').map((char, i) => {
                                // Wavering Animation
                                // Each char has a different phase
                                const phaseDetails = i * 1.5;
                                const waveY = Math.sin((frame / 20) + phaseDetails) * 5; // Up/Down wave
                                const waveX = Math.cos((frame / 30) + phaseDetails) * 2; // Slight left/right drift
                                const waveRot = Math.sin((frame / 25) + phaseDetails) * 3; // Slight rotation

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
                                            color="#FFFDF8"
                                            strokeWidth={0}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </AbsoluteFill>
            )}

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
                        opacity: interpolate(
                            timeSinceStart,
                            // Ensure strictly increasing range for safety
                            (() => {
                                const p1 = Math.min(1, duration * 0.4);
                                const p3 = duration;
                                const p2 = Math.max(p1 + 0.01, duration - 1); // Ensure p2 > p1
                                // If duration is extremely short, p2 might be >= p3.
                                if (p2 >= p3) {
                                    return [0, p1, p3 - 0.01, p3]; // Emergency fallback
                                }
                                return [0, p1, p2, p3];
                            })(),
                            [0, 1, 1, 0]
                        ),
                        zIndex: 1,
                    }}
                >
                    {currentLyric.text}
                </div>
            )}
        </AbsoluteFill>
    );
};
