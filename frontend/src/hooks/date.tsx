import { useState, useEffect, useMemo } from 'react';

export const useCountdown = (endDate: Date) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = endDate.getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const totalSeconds = Math.floor(difference / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return timeRemaining;
};


export const useTimeBasedProgress = (startDate: Date, endDate: Date) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date().getTime();
      const start = startDate.getTime();
      const end = endDate.getTime();
      const totalDuration = end - start;
      const elapsed = now - start;

      if (elapsed <= 0) {
        setProgress(0);
        return;
      }

      if (elapsed >= totalDuration) {
        setProgress(100);
        return;
      }

      const progressPercentage = (elapsed / totalDuration) * 100;
      setProgress(Math.min(100, Math.max(0, progressPercentage)));
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return progress;
};


export const calculateEndDate = (startDate: Date, durationInDays: number): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationInDays);
  return endDate;
};

