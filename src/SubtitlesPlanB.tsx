import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { LrcLine } from './utils/lrcParser';
import { SvgText } from './SvgText';

export const SubtitlesPlanB: React.FC<{ lyrics: LrcLine[] }> = ({ lyrics }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Find the current lyric
    const currentLyricIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        if (!nextLine) return true; // It's the last line
        return currentTime >= line.time && currentTime < nextLine.time;
    });

    // Handle cases before first lyric
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

    // Background darkening logic
    // showSoraLayer handles both Sora and Ubae phase.
    const darkOpacity = showSoraLayer ? 1 : 0;

    return (
        <AbsoluteFill>
            {/* --- BLACK BACKGROUND OVERLAY (z: 1) --- */}
            <div
                style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: '#000000',
                    opacity: darkOpacity,
                    transition: 'opacity 1s ease-in-out',
                    zIndex: 1, // Base layer for "Dark Mode"
                }}
            />

            {/* --- 1. The Giant "Sky" Layer (空なんて) - PLAN B: BLURRED (z: 10) --- */}
            {showSoraLayer && (
                <div
                    style={{
                        position: 'absolute',
                        left: '50%', top: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontFamily: "'A1 Mincho', serif",
                        zIndex: 10, // Above Black BG
                        width: '100%', height: '100%',
                        overflow: 'visible',
                        opacity: isUbaeActive ? 0.3 : 1,
                        filter: 'blur(8px)',
                        transition: 'opacity 1s ease-in-out, filter 1s ease-in-out',
                    }}
                >
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {SORA_TEXT.split('').map((char, index) => {
                            const isSoraChar = char === '空';
                            const scale = isSoraChar ? 15 : 9;
                            let x = 960; let y = 540;
                            if (index === 0) { x = 960; y = 300; }
                            if (index === 1) { x = 1500; y = 700; }
                            if (index === 2) { x = 400; y = 800; }
                            if (index === 3) { x = 1100; y = 900; }

                            const drawProgress = isSoraActive
                                ? interpolate(timeSinceStart, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
                                : 1;

                            return (
                                <div
                                    key={`sora-${index}`}
                                    style={{
                                        position: 'absolute',
                                        left: 0, top: 0,
                                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
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

            {/* --- 2. The "Ground" Layer (奪えなくていい) - PLAN B: SOLID + BLEED + SCALE (z: 20) --- */}
            {isUbaeActive && (
                <div
                    style={{
                        position: 'absolute',
                        left: '150px', bottom: '150px',
                        fontFamily: "'A1 Mincho', serif",
                        zIndex: 20, // Above Sora
                        writingMode: 'vertical-rl', textOrientation: 'upright',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {UBAE_TEXT.split('').map((char, index) => {
                        const delay = index * 0.15;
                        const bleedProgress = interpolate(
                            timeSinceStart,
                            [delay, delay + 1.2],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );
                        const swell = interpolate(
                            bleedProgress,
                            [0, 1],
                            [0.9, 1.05],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );
                        const focus = interpolate(
                            bleedProgress,
                            [0, 0.6],
                            [10, 0],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );

                        return (
                            <div
                                key={`ubae-${index}`}
                                style={{
                                    display: 'inline-block',
                                    marginBottom: '15px',
                                    transform: `scale(${swell})`,
                                    filter: `blur(${focus}px)`,
                                    transformOrigin: 'center center',
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

            {/* --- 3. Normal Text Layer (z: 30) --- */}
            {showNormalText && (
                <div
                    style={{
                        position: 'absolute',
                        left: '1650px', top: '50%',
                        transform: baseTransform,
                        fontFamily: "'A1 Mincho', serif", fontSize: '50px',
                        fontWeight: 500, color: '#FFFDF8',
                        textShadow: '2px 2px 10px rgba(0,0,0,0.8)',
                        textAlign: 'center', opacity,
                        writingMode: 'vertical-rl', textOrientation: 'upright',
                        letterSpacing: '0.2em', whiteSpace: 'nowrap',
                        zIndex: 30, // Topmost
                    }}
                >
                    {currentLyric.text}
                </div>
            )}
        </AbsoluteFill >
    );
};
