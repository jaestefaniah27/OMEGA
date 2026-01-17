import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useGame } from './GameContext';

interface WorkoutTimerContextType {
    elapsedSeconds: number;
    formatTime: string;
}

const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(undefined);

export const useWorkoutTimer = () => {
    const context = useContext(WorkoutTimerContext);
    if (!context) {
        throw new Error('useWorkoutTimer must be used within a WorkoutTimerProvider');
    }
    return context;
};

export const WorkoutTimerProvider = ({ children }: { children: ReactNode }) => {
    const { workout } = useGame();
    const { isSessionActive, startTime } = workout;
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isSessionActive && startTime) {
            // Update immediately on start/recovery
            const start = new Date(startTime).getTime();
            setElapsedSeconds(Math.floor((Date.now() - start) / 1000));

            timerRef.current = setInterval(() => {
                const now = Date.now();
                setElapsedSeconds(Math.floor((now - start) / 1000));
            }, 1000);
        } else {
            setElapsedSeconds(0);
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isSessionActive, startTime]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? `${hrs}:` : ''}${mins < 10 && hrs > 0 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const value = {
        elapsedSeconds,
        formatTime: formatTime(elapsedSeconds)
    };

    return (
        <WorkoutTimerContext.Provider value={value}>
            {children}
        </WorkoutTimerContext.Provider>
    );
};
