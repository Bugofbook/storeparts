type ListenerCallback = () => void;

type ObserverPart = {
    /**
     * subscribe a lister
     * @returns 
     */
    subscribe(): (callbackFn: ListenerCallback) => () => void;
    /**
     * trigger lister
     */
    triggerLister: () => void;
}


export default function createObserverPart(): ObserverPart {
    const listerSet: Set<ListenerCallback> = new Set();
    const triggerLister = () => {
        listerSet.forEach((cb) => cb());
    }
    const subscribe = () => {
        return (cb?: ListenerCallback) => {
            const callbackFn = cb || (() => {return;});
            return () => {
                listerSet.delete(callbackFn);
            }
        }
    }
    return {
        triggerLister,
        subscribe
    }
}
