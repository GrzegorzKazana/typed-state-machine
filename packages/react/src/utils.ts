import { useRef, useEffect, useCallback } from 'react';

export const useIsMounted = () => {
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    return useCallback(() => mountedRef.current, []);
};
