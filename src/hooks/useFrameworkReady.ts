import { useEffect } from 'react';

export function useAppReady(callback: () => void) {
  useEffect(() => {
    callback(); // do something when app is mounted
  }, []);
}
