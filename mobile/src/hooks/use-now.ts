import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * The current time as render-safe state, refreshed every `intervalMs`.
 *
 * Reading `Date.now()` during render would be impure, and React Compiler could cache a stale value.
 * Timers are paused while the app is in the background, so the value is also refreshed the moment
 * the app comes back to the foreground.
 */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = setInterval(refresh, intervalMs);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [intervalMs]);

  return now;
}
