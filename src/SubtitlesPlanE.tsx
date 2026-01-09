import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';
import { SvgText } from './SvgText';

export const SubtitlesPlanE: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
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

    const getOpacity = (t: number, d: number) => interpolate(
        t,
        [0, 0.5, Math.max(0.5, d - 0.5), d],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const opacity = getOpacity(timeSinceStart, duration);

    const SORA_TEXT = "空なんて";
    const UBAE_TEXT = "奪えなくていい";
    const isSoraActive = currentLyric.text.includes(SORA_TEXT);
    const isUbaeActive = currentLyric.text.includes(UBAE_TEXT);
    const showNormalText = !isSoraActive && !isUbaeActive;

    return (
        <AbsoluteFill>
            {/* === Special Layer: 線画とインク (Stroke & Ink) === */}
            {(isSoraActive || isUbaeActive) && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {isSoraActive && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                            {/* 空: Stroke Only animation */}
                            <div style={{ transform: 'scale(2.0)' }}>
                                <SvgText
                                    text="空"
                                    fontSize={120}
                                    progress={interpolate(timeSinceStart, [0, 2], [0, 0.6], { extrapolateRight: 'clamp' })} // 0.6 is where stroke ends and fill begins in SvgText logic, but we want ONLY stroke.
                                    // SvgText logic: stroke finishes at 0.6. fill starts at 0.5.
                                    // We want NO fill.
                                    color="transparent"
                                    strokeColor="#FFFDF8"
                                    strokeWidth={1.5}
                                />
                            </div>
                            {/* なんて: Fill Only (Ink bleed effect) */}
                            <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                                {["な", "ん", "て"].map((char, i) => {
                                    // Custom blur effect
                                    const blur = interpolate(timeSinceStart, [1.5 + i * 0.2, 2.5 + i * 0.2], [10, 0], { extrapolateRight: 'clamp' });
                                    const localOpacity = interpolate(timeSinceStart, [1.5 + i * 0.2, 2.5 + i * 0.2], [0, 1], { extrapolateRight: 'clamp' });

                                    return (
                                        <div key={i} style={{ filter: `blur(${blur}px)`, opacity: localOpacity }}>
                                            <SvgText
                                                text={char}
                                                fontSize={80}
                                                progress={1} // Fully filled instantly (controlled by opacity/blur)
                                                color="#FFFDF8"
                                                strokeWidth={0}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isUbaeActive && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            {/* 奪えなくていい: All Solid Ink Bleed */}
                            {UBAE_TEXT.split('').map((char, i) => {
                                const blur = interpolate(timeSinceStart, [i * 0.1, 1 + i * 0.1], [15, 0], { extrapolateRight: 'clamp' });
                                const localOpacity = interpolate(timeSinceStart, [i * 0.1, 1 + i * 0.1], [0, 1], { extrapolateRight: 'clamp' });
                                return (
                                    <div key={i} style={{ filter: `blur(${blur}px)`, opacity: localOpacity }}>
                                        <SvgText
                                            text={char}
                                            fontSize={60}
                                            progress={1}
                                            color="#FFFDF8"
                                            strokeWidth={0}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
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
                        fontSize: '55px',
                        color: '#FFFDF8',
                        textShadow: '0px 0px 15px rgba(255,255,255,0.3)',
                        opacity,
                        zIndex: 1,
                    }}
                >
                    {currentLyric.text}
                </div>
            )}
        </AbsoluteFill>
    );
};
