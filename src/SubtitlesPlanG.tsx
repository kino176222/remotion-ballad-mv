import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';
import { SvgText } from './SvgText';

export const SubtitlesPlanG: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
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

    // Plan G:
    // 1. 空 (Sky): 3x larger impact, Outline, Floating.
    // 2. なんて (Nante): Floating up (Ukiyagaru). Solid White.
    // 3. 奪えなくていい (Ubae): Horizontal. Solid White.
    // 4. Timing: All vanish together.

    const SORA_TEXT = "空なんて";
    // NOTE: User mentioned "Wake nakute ii" but code uses "Ubae nakute ii". Assuming Ubae for now.
    const UBAE_TEXT = "奪えなくていい";
    const isSoraActive = currentLyric.text.includes(SORA_TEXT);
    const isUbaeActive = currentLyric.text.includes(UBAE_TEXT);
    const showNormalText = !isSoraActive && !isUbaeActive;

    // Exit Animation: Simultaneously fade out at end of phase
    // If it's the "Ubae" line, we fade out at its end.
    // If it's "Sora", we normally keep it? User said "Simultaneously disappear".
    // This implies Sora stays until Ubae ends.
    // Logic: If isSoraActive is true, we show Sora.
    // If isUbaeActive is true, we ALSO show Sora (fading out with Ubae).

    // Determine opacity for the "Sora/Ubae" sequence group
    let groupOpacity = 1;
    if (isSoraActive) {
        // Fade in nicely
        groupOpacity = interpolate(timeSinceStart, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    } else if (isUbaeActive) {
        // Fade out at end of this line
        groupOpacity = interpolate(timeSinceStart, [duration - 1, duration], [1, 0], { extrapolateLeft: 'clamp' });
    }

    return (
        <AbsoluteFill>
            {/* === Special Layer: Plan G === */}
            {(isSoraActive || isUbaeActive) && (
                <AbsoluteFill style={{ opacity: groupOpacity }}>
                    {/* Layer 1: Huge Sky (空) - Always visible during this sequence */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 0,
                    }}>
                        {/* 3x Scale of Plan F (Plan F was 200px, so 600px) */}
                        <div style={{
                            transform: `translateY(${Math.sin(frame / 40) * 30}px)`, // Slow giant float
                        }}>
                            <SvgText
                                text="空"
                                fontSize={600}
                                progress={isSoraActive ? interpolate(timeSinceStart, [0, 2], [0, 1], { extrapolateRight: 'clamp' }) : 1}
                                color="transparent"
                                strokeColor="#FFFDF8"
                                strokeWidth={2} // Thicker because of scale
                                style={{ opacity: 0.5 }} // Subtle back
                            />
                        </div>
                    </div>

                    {/* Layer 2: なんて (Nante) - Floating up */}
                    {isSoraActive && (
                        <div style={{
                            position: 'absolute',
                            top: '50%', // Centered vertically relative to the floating action
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            display: 'flex',
                            gap: '15px'
                        }}>
                            {["な", "ん", "て"].map((char, i) => {
                                // Floating up animation: Starts lower, moves to center
                                const floatY = interpolate(timeSinceStart, [0.5 + i * 0.2, 2.0 + i * 0.2], [100, 0], { extrapolateRight: 'clamp', easing: (t) => t * (2 - t) }); // Ease out
                                const alpha = interpolate(timeSinceStart, [0.5 + i * 0.2, 1.5 + i * 0.2], [0, 1], { extrapolateRight: 'clamp' });

                                return (
                                    <div key={i} style={{ transform: `translateY(${floatY}px)`, opacity: alpha }}>
                                        <SvgText
                                            text={char}
                                            fontSize={80} // Smaller than Sky, legible
                                            progress={1}
                                            color="#FFFDF8"
                                            strokeWidth={0}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Layer 3: 奪えなくていい (Ubae) - Horizontal, appearing below */}
                    {isUbaeActive && (
                        <div style={{
                            position: 'absolute',
                            top: '60%', // Below center
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            display: 'flex',
                            gap: '10px'
                        }}>
                            {UBAE_TEXT.split('').map((char, i) => (
                                <SvgText
                                    key={i}
                                    text={char}
                                    fontSize={70}
                                    progress={interpolate(timeSinceStart, [i * 0.1, 1 + i * 0.1], [0, 1], { extrapolateRight: 'clamp' })}
                                    color="#FFFDF8"
                                    strokeWidth={0}
                                />
                            ))}
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
                            // Ensure strictly increasing range:
                            (() => {
                                const p1 = Math.min(1, duration * 0.4);
                                const p3 = duration;
                                const p2 = Math.max(p1 + 0.01, duration - 1); // Ensure p2 > p1
                                if (p2 >= p3) {
                                    return [0, p1, p3 - 0.01, p3];
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
