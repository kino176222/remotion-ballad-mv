import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';
import { SvgText } from './SvgText';

export const SubtitlesPlanF: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
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

    const getOpacity = (t: number, d: number) => interpolate(t, [0, 0.5, d - 0.5, d], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const opacity = getOpacity(timeSinceStart, duration);

    const SORA_TEXT = "空なんて";
    const UBAE_TEXT = "奪えなくていい";
    const isSoraActive = currentLyric.text.includes(SORA_TEXT);
    const isUbaeActive = currentLyric.text.includes(UBAE_TEXT);
    const showNormalText = !isSoraActive && !isUbaeActive;

    return (
        <AbsoluteFill>
            {/* === Special Layer: 浮遊する枠 (Floating Frame) === */}
            {(isSoraActive || isUbaeActive) && (
                <AbsoluteFill>
                    {isSoraActive && (
                        <>
                            {/* 空: Floating Outline */}
                            <div style={{
                                position: 'absolute',
                                top: '30%',
                                left: '50%',
                                transform: `translate(-50%, -50%) translateY(${Math.sin(frame / 30) * 20}px)`, // Floating motion
                            }}>
                                <SvgText
                                    text="空"
                                    fontSize={200}
                                    progress={1}
                                    color="transparent"
                                    strokeColor="#FFFDF8"
                                    strokeWidth={0.8}
                                    style={{ opacity: 0.6 }}
                                />
                            </div>

                            {/* なんて: Vertical Solid Fixed */}
                            <div style={{
                                position: 'absolute',
                                bottom: '10%',
                                right: '20%',
                                writingMode: 'vertical-rl',
                                textOrientation: 'upright',
                                display: 'flex',
                                gap: '10px'
                            }}>
                                {["な", "ん", "て"].map((char, i) => (
                                    <SvgText
                                        key={i}
                                        text={char}
                                        fontSize={70}
                                        progress={interpolate(timeSinceStart, [1 + i * 0.2, 2 + i * 0.2], [0, 1], { extrapolateRight: 'clamp' })}
                                        color="#FFFDF8"
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {isUbaeActive && (
                        // 奪えなくていい: Vertical Solid Fixed (Same position as なんて)
                        <div style={{
                            position: 'absolute',
                            bottom: '10%',
                            right: '20%',
                            writingMode: 'vertical-rl',
                            textOrientation: 'upright',
                            display: 'flex',
                            gap: '10px'
                        }}>
                            {UBAE_TEXT.split('').map((char, i) => (
                                <div key={i} style={{ marginBottom: '10px' }}>
                                    <SvgText
                                        text={char}
                                        fontSize={60}
                                        progress={interpolate(timeSinceStart, [i * 0.1, 1 + i * 0.1], [0, 1], { extrapolateRight: 'clamp' })}
                                        color="#FFFDF8"
                                        strokeWidth={0}
                                    />
                                </div>
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
                        right: '150px',
                        bottom: '100px',
                        fontFamily: "'A1 Mincho', serif",
                        fontSize: '50px',
                        color: '#FFFDF8',
                        opacity,
                        writingMode: 'vertical-rl',
                        textOrientation: 'upright',
                        letterSpacing: '0.2em',
                        zIndex: 1,
                    }}
                >
                    {currentLyric.text}
                </div>
            )}
        </AbsoluteFill>
    );
};
