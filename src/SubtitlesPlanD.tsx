import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';
import { SvgText } from './SvgText';

export const SubtitlesPlanD: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
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

    // Fade logic helpers
    const getOpacity = (t: number, d: number) => interpolate(
        t,
        [0, 1, Math.max(1, d - 1), d],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Identify special phases
    const SORA_TEXT = "空なんて";
    const UBAE_TEXT = "奪えなくていい";

    // "空なんて"の時、または "奪えなくていい" の時は専用レイヤーを表示
    // Plan D: 巨像の空 (Gigantic Void)
    // - 空: 画面からはみ出るほど超巨大な白抜き文字として背景に配置。
    // - なんて: その手前中央に、小さく鋭い白塗り文字で配置。

    const isSoraActive = currentLyric.text.includes(SORA_TEXT);
    const isUbaeActive = currentLyric.text.includes(UBAE_TEXT);
    const showSoraLayer = isSoraActive || isUbaeActive;
    const showNormalText = !isSoraActive && !isUbaeActive;

    const opacity = getOpacity(timeSinceStart, duration);

    return (
        <AbsoluteFill>
            {/* === Special Layer: 空 & なんて === */}
            {showSoraLayer && (
                <AbsoluteFill>
                    {/* 1. 巨像の背景 (空) - Outline Only */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        textAlign: 'center',
                        zIndex: 0
                    }}>
                        {/* 手動配置で巨大な「空」を描く */}
                        <div style={{ position: 'relative', width: '1920px', height: '1080px' }}>
                            {/* 空: 巨大配置 */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(25)' }}>
                                <SvgText
                                    text="空"
                                    fontSize={100}
                                    progress={1} // Always fully drawn outline
                                    color="transparent" // Fill transparent
                                    strokeColor="#FFFDF8" // White Stroke
                                    strokeWidth={0.5} // Thin sharp line
                                    style={{ opacity: 0.3 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. 前景 (なんて / 奪えなくていい) - Solid White */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px'
                    }}>
                        {isSoraActive && (
                            // "なんて" 部分だけを小さく表示
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {["な", "ん", "て"].map((char, i) => (
                                    <SvgText
                                        key={i}
                                        text={char}
                                        fontSize={80}
                                        progress={interpolate(timeSinceStart, [0.5 + i * 0.1, 1.5 + i * 0.1], [0, 1], { extrapolateRight: 'clamp' })}
                                        color="#FFFDF8" // Solid White
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>
                        )}

                        {isUbaeActive && (
                            // "奪えなくていい"
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {UBAE_TEXT.split('').map((char, i) => (
                                    <SvgText
                                        key={i}
                                        text={char}
                                        fontSize={60}
                                        progress={interpolate(timeSinceStart, [i * 0.1, 1 + i * 0.1], [0, 1], { extrapolateRight: 'clamp' })}
                                        color="#FFFDF8" // Solid White
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </AbsoluteFill>
            )}

            {/* === Normal Text Layer === */}
            {showNormalText && (
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        top: '80%', // 下部に配置
                        textAlign: 'center',
                        fontFamily: "'A1 Mincho', serif",
                        fontSize: '60px',
                        fontWeight: 500,
                        color: '#FFFDF8',
                        textShadow: '0px 2px 10px rgba(0,0,0,0.5)',
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
