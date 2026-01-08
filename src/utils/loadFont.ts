import { continueRender, delayRender, staticFile } from 'remotion';
import opentype from 'opentype.js';

let loadedFont: opentype.Font | null = null;
let loadingPromise: Promise<opentype.Font> | null = null;

export const loadFont = () => {
    if (loadedFont) {
        return Promise.resolve(loadedFont);
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    const handle = delayRender();

    const fontUrl = staticFile('fonts/A1MinchoStdN-Medium.otf');

    loadingPromise = new Promise((resolve, reject) => {
        opentype.load(fontUrl, (err, font) => {
            if (err) {
                console.error('Font loading error:', err);
                continueRender(handle);
                reject(err);
                return;
            }
            if (!font) {
                continueRender(handle);
                reject(new Error('Font is undefined'));
                return;
            }
            loadedFont = font;
            continueRender(handle);
            resolve(font);
        });
    });

    return loadingPromise;
};
