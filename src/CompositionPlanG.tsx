import { AbsoluteFill, staticFile, Video, delayRender, continueRender } from 'remotion';
import { useEffect, useState } from 'react';
import { parseLrc, LrcLine } from './utils/lrcParser';
import { SubtitlesPlanG } from './SubtitlesPlanG';
import { Guide } from './Guide';

export const MyCompositionPlanG = () => {
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
            {lyrics.length > 0 && <SubtitlesPlanG lyrics={lyrics} />}
            <Guide />
        </AbsoluteFill>
    );
};
