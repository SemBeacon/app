/** Whether the browser believes it has a network connection. */
export function isOnline(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine !== false;
}

/**
 * Whether an error is caused by the network (no connection, DNS/proxy failure, timeout)
 * rather than by malformed or unsupported beacon data.
 */
export function isNetworkError(error: unknown): boolean {
    if (error === undefined || error === null) {
        return false;
    }
    if (!isOnline()) {
        return true;
    }
    const name = (error as { name?: string }).name;
    const message = String((error as { message?: string }).message ?? error).toLowerCase();
    return (
        name === 'AbortError' ||
        name === 'TimeoutError' ||
        name === 'TypeError' ||
        /failed to fetch|fetch failed|network ?error|networkerror|load failed|offline|timed out/.test(
            message,
        )
    );
}

/**
 * Listen for changes to the browser's online state.
 * @returns a function that removes the listeners
 */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
    if (typeof window === 'undefined') {
        return () => undefined;
    }
    const handler = () => callback(isOnline());
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
    };
}
