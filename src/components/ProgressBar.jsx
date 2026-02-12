import { useState, useEffect } from "react"

const TIMER = 3000;
export default function ProgressBar() {
    const [currentProgress, setCurrentProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentProgress(
                prevProgress => prevProgress + 10
            );
        }, 10);

        return () => {
            clearInterval(interval);
        }
    }, []);

    return <progress value={currentProgress} max={TIMER} />
}