type ListenerCallback = () => void;

export default function createObserverPart() {
    const listers: Map<string, Set<ListenerCallback>> = new Map();
    const triggerListerID = (key: string) => {
        if (listers.has(key)) {
            const currentListerSet = listers.get(key) || new Set();
            currentListerSet.forEach((cb) => cb());
        }
    }
    const subscribeID = (key = '') => {
        return (cb?: ListenerCallback) => {
            const callbackFn = cb || (() => {return;});
            if (listers.has(key)) {
                listers.get(key)?.add(callbackFn);
            } else {
                listers.set(key, new Set([callbackFn]));
            }
            return () => {
                const currentSet = listers.get(key) || new Set();
                currentSet.delete(callbackFn);
                if (currentSet.size === 0) {
                    listers.delete(key);
                }
            }
        }
    }
    return {
        triggerListerID,
        subscribeID
    }
}
