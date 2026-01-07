
export interface LrcLine {
  time: number; // Time in seconds
  text: string;
}

export const parseLrc = (lrcContent: string): LrcLine[] => {
  const lines = lrcContent.split('\n');
  const lrcLines: LrcLine[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10); // Handle 2 or 3 digit ms
      
      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();

      if (text) {
        lrcLines.push({
          time: timeInSeconds,
          text,
        });
      }
    }
  }

  return lrcLines.sort((a, b) => a.time - b.time);
};
