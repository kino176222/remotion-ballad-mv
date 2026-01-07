import { AbsoluteFill } from 'remotion';

export const Guide: React.FC = () => {
    const width = 1920;
    const height = 1080;
    const gridSize = 100;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 1000 }}>
            {/* Grid Lines */}
            {new Array(Math.ceil(width / gridSize)).fill(0).map((_, i) => (
                <div key={`v-${i}`}>
                    <div
                        style={{
                            position: 'absolute',
                            left: i * gridSize,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            backgroundColor: i * gridSize === width / 2 ? 'cyan' : 'rgba(0, 255, 255, 0.2)',
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        left: i * gridSize + 5,
                        top: 10,
                        fontSize: 12,
                        color: 'cyan',
                        fontFamily: 'sans-serif'
                    }}>
                        {i}
                    </div>
                </div>
            ))}
            {new Array(Math.ceil(height / gridSize)).fill(0).map((_, i) => (
                <div key={`h-${i}`}>
                    <div
                        style={{
                            position: 'absolute',
                            top: i * gridSize,
                            left: 0,
                            right: 0,
                            height: 1,
                            backgroundColor: i * gridSize === height / 2 ? 'cyan' : 'rgba(0, 255, 255, 0.2)',
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        left: 10,
                        top: i * gridSize + 5,
                        fontSize: 12,
                        color: 'cyan',
                        fontFamily: 'sans-serif'
                    }}>
                        {i}
                    </div>
                </div>
            ))}



            {/* Rule of Thirds */}
            <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,0,0.3)' }} />
            <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,0,0.3)' }} />
            <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,0,0.3)' }} />
            <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,0,0.3)' }} />
        </AbsoluteFill>
    );
};
