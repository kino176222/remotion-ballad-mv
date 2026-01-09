import { AbsoluteFill, staticFile, Video, delayRender, continueRender } from 'remotion';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { parseLrc, LrcLine } from './utils/lrcParser';
import { SubtitlesPlanH } from './SubtitlesPlanH';
import { Guide } from './Guide';

export const planHSchema = z.object({
    soraScale: z.number().min(0.5).max(5).step(0.1),
    soraTop: z.number().min(0).max(100).step(1),
    soraLeft: z.number().min(0).max(100).step(1),
    nanteScale: z.number().min(0.5).max(3).step(0.1),
    nanteTop: z.number().min(0).max(100).step(1),
    nanteLeft: z.number().min(0).max(100).step(1),
    wakeScale: z.number().min(0.5).max(3).step(0.1),
    wakeTop: z.number().min(0).max(100).step(1),
    wakeLeft: z.number().min(0).max(100).step(1),
});

export const MyCompositionPlanH: React.FC<z.infer<typeof planHSchema>> = (props) => {
    const [handle] = useState(() => delayRender());
    const [lyrics, setLyrics] = useState<LrcLine[]>([]);

    useEffect(() => {
        fetch(staticFile('ソファの真ん中.lrc'))
            .then((response) => response.text())
            .then((text) => {
                const parsed = parseLrc(text);
                setLyrics(parsed);
                continueRender(handle);
            })
            .catch((err) => {
                console.error('Error fetching lyrics:', err);
                continueRender(handle);
            });
    }, [handle]);

    return (
        <AbsoluteFill className="bg-gray-100 items-center justify-center">
            <Video
                src={staticFile('video.mp4')}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {lyrics.length > 0 && (
                <SubtitlesPlanH
                    lyrics={lyrics}
                    {...props}
                />
            )}
            <Guide />
        </AbsoluteFill>
    );
};
