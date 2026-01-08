import React, { useEffect, useState } from 'react';
import { interpolate } from 'remotion';
import { loadFont } from './utils/loadFont';
import opentype from 'opentype.js';

interface SvgTextProps {
    text: string;
    fontSize: number;
    progress: number; // 0 to 1, animation progress
    style?: React.CSSProperties;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

export const SvgText: React.FC<SvgTextProps> = ({
    text,
    fontSize,
    progress,
    style,
    color = '#FFFDF8',
    strokeColor,
    strokeWidth = 2,
}) => {
    const [font, setFont] = useState<opentype.Font | null>(null);
    const [pathData, setPathData] = useState<string>('');

    useEffect(() => {
        loadFont().then((loadedFont) => {
            setFont(loadedFont);
        });
    }, []);

    useEffect(() => {
        if (!font) return;

        // Create path
        // x=0, y=fontSize (baseline) is roughly where it draws. 
        // We will recenter it via viewBox or simple translation if needed.
        // getPath(text, x, y, fontSize)
        const path = font.getPath(text, 0, fontSize * 0.8, fontSize);
        setPathData(path.toPathData(2));
    }, [font, text, fontSize]);

    if (!font || !pathData) {
        return null;
    }

    // Measure text width roughly
    const textWidth = font.getAdvanceWidth(text, fontSize);
    const textHeight = fontSize * 1.2; // Approximate line height

    // Animation Logic
    // 1. Stroke Animation (Outline drawing)
    // We need the total length of the path to perfect this, but CSS pathLength='1' works in modern browsers for simple offset manipulation.
    // Progress 0 -> 1 : Dashoffset 1 -> 0
    const strokeDashoffset = interpolate(progress, [0, 0.6], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // 2. Fill Fade In
    // Starts after stroke is mostly done
    const fillOpacity = interpolate(progress, [0.5, 1], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <svg
            width={textWidth}
            height={textHeight}
            viewBox={`0 0 ${textWidth} ${textHeight}`}
            style={{
                ...style,
                overflow: 'visible',
            }}
        >
            <path
                d={pathData}
                fill={color}
                fillOpacity={fillOpacity}
                stroke={strokeColor || color}
                strokeWidth={strokeWidth}
                strokeDasharray="1"
                strokeDashoffset={strokeDashoffset}
                pathLength={1} // Allows us to use 0-1 for dashoffset regardless of actual pixel length
                style={{
                    vectorEffect: 'non-scaling-stroke', // Keeps stroke consistent if scaled
                }}
            />
        </svg>
    );
};
