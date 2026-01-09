import { AbsoluteFill, staticFile, useVideoConfig, Video, continueRender, delayRender } from 'remotion';
import { useEffect, useState } from 'react';
import { parseLrc, LrcLine } from './utils/lrcParser';
import { Subtitles } from './Subtitles';

import { Guide } from './Guide';

export const MyComposition = () => {
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
                src={staticFile('video7.mp4')}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {lyrics.length > 0 && <Subtitles lyrics={lyrics} />}
        </AbsoluteFill>
    );
};
