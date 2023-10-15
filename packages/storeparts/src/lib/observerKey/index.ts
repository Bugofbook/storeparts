export type ListenerCallback = () => void;

export function createObserverKeyPart() {
    const listerMap: Map<string, Set<ListenerCallback>> = new Map();
    /**
     * trigger lister by key
     * @param key
     */
    const triggerListerKey = (key: string) => {
        if (listerMap.has(key)) {
            const currentListerSet = listerMap.get(key) || new Set();
            currentListerSet.forEach((cb) => cb());
        }
    };
    /**
     * trigger lister by keys
     * @param keys
     */
    function triggerListerKeys(keys: string[]) {
        keys.forEach((key) => {
            if (listerMap.has(key)) {
                const currentListerSet = listerMap.get(key) || new Set();
                currentListerSet.forEach((cb) => cb());
            }
        });
    }
    /**
     * trigger all listers
     */
    const triggerListerAll = () => {
        listerMap.forEach((set) => {
            set.forEach((cb) => cb());
        });
    };
    /**
     * subscribe a lister by key
     * @param key
     * @returns
     */
    const subscribeKey = (key: string) => {
        return (callbackFn: ListenerCallback) => {
            if (listerMap.has(key)) {
                listerMap.get(key)?.add(callbackFn);
            } else {
                listerMap.set(key, new Set([callbackFn]));
            }
            return () => {
                const currentSet = listerMap.get(key) || new Set();
                currentSet.delete(callbackFn);
                if (currentSet.size === 0) {
                    listerMap.delete(key);
                }
            };
        };
    };
    return {
        subscribeKey,
        triggerListerKey,
        triggerListerKeys,
        triggerListerAll,
    };
}
export default createObserverKeyPart;
