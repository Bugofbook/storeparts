type ListenerCallback = () => void;
type ObserverKeyPart<Keys> = {
    /**
     * subscribe a lister by key
     * @param key 
     * @returns 
     */
    subscribeKey(key: Keys): (callbackFn: ListenerCallback) => () => void;
    /**
     * trigger lister by key
     * @param key 
     */
    triggerListerKey: (key: Keys) => void;
    /**
     * trigger lister by keys
     * @param keys 
     */
    triggerListerKeys: (keys: Keys[]) => void;
    /**
     * trigger all listers
     */
    triggerListerAll: () => void;
}
export function createObserverKeyPart<Keys extends string = string>():ObserverKeyPart<Keys> {
    const listerMap: Map<string, Set<ListenerCallback>> = new Map();
    return {
        subscribeKey: (key) => {
            return (callbackFn) => {
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
        },
        triggerListerKey: (key) => {
            if (listerMap.has(key)) {
                const currentListerSet = listerMap.get(key) || new Set();
                currentListerSet.forEach((cb) => cb());
            }
        },
        triggerListerKeys: (keys)  => {
            keys.forEach((key) => {
                if (listerMap.has(key)) {
                    const currentListerSet = listerMap.get(key) || new Set();
                    currentListerSet.forEach((cb) => cb());
                }
            });
        },
        triggerListerAll: () => {
            listerMap.forEach((set) => {
                set.forEach((cb) => cb());
            });
        },
    };
}
export default createObserverKeyPart;
