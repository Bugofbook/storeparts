import { createReducerPart, createObserverKeyPart } from '@bugofbook/store-parts';
import { modalReducer, modalWithOptionReducer } from '../core'
import type { ModalObserverStore, State, OpenAction, OptionAction } from'../core';
interface StateWithOption<Type> extends State {
    option: Type;
}
type ToastType = {
    /**
     * toast data data snapshots
     */
    snapshots: {
        /**
         * get toast open state
         * @returns boolean
         */
        getOpen: () => boolean;
    };
    /**
     * modal data actions
     */
    actions: {
        /**
         * open toast
         * @returns 
         */
        openToast: () => void;
    };
    /**
     * modal data subscribes
     */
    subscribes: {
        /**
         * subscribe toast open state
         * @returns the unsubscribe function
         */
        subscribeOpen: () => ReturnType<ModalObserverStore['subscribeKey']>;
    };
};
type ToastTypeWithOption<Option> = {
    /**
     * toast data snapshots
     */
    snapshots: {
        /**
         * get modal open state
         * @toast boolean
         */
        getOpen: () => boolean;
        /**
         * get option data
         * @returns option data
         */
        getOption: () => Option;
    };
    /**
     * toast data actions
     */
    actions: {
        /**
         * open toast with option
         * @param option 
         */
        openToast: (option: Option) => void;
    };
    /**
     * toast data subscribes
     */
    subscribes: {
        /**
         * subscribe toast open state
         * @returns the unsubscribe function
         */
        subscribeOpen: () => ReturnType<ModalObserverStore['subscribeKey']>;
        /**
         * subscribe toast option data
         * @returns the unsubscribe function
         */
        subscribeOption: () => ReturnType<ModalObserverStore['subscribeKey']>;
    };
};
export default function createToastStore<Option>(autoCloseTime: number, initOption: Option): ToastTypeWithOption<Option>;
export default function createToastStore(autoCloseTime: number): ToastType;
export default function createToastStore<Option>(autoCloseTime: number, initOption?: Option) {
    let timeToken: NodeJS.Timeout| null = null 
    if (initOption) {
        const store = createReducerPart<StateWithOption<Option>, OpenAction | OptionAction<{option: Option}>>(modalWithOptionReducer, { open: false, option: initOption });
        const listerStore = createObserverKeyPart<'open' | 'option'>();
        const snapshots = {
            getOpen: () => store.getStore().open,
            getOption: () => store.getStore().option,
        };
        const actions = {
            openToast: (option: Option) => {
                if (timeToken) {
                    clearTimeout(timeToken)
                    timeToken = null
                }
                store.dispatch({ type: 'set', payload: {option} });
                store.dispatch({ type: 'open' });
                const openKey = 'open';
                const optionKey = 'option';
                listerStore.triggerListerKeys([openKey, optionKey]);
                timeToken = setTimeout(() => {
                    store.dispatch({ type: 'close' });
                    store.dispatch({ type: 'remove'})
                    listerStore.triggerListerKeys([openKey, optionKey]);
                    timeToken = null
                }, autoCloseTime);
            }
        };
        const subscribes = {
            subscribeOpen: () => listerStore.subscribeKey('open'),
            subscribeOption: () => listerStore.subscribeKey('option'),
        };
        return {
            snapshots,
            actions,
            subscribes,
        };
    } else {
        const store = createReducerPart<State, OpenAction>(modalReducer, { open: false });
        const listerStore = createObserverKeyPart<'open'>();
        const snapshots = {
            getOpen: () => store.getStore().open,
        };
        const actions = {
            openToast: () => {
                if (timeToken) {
                    clearTimeout(timeToken)
                    timeToken = null
                }
                store.dispatch({ type: 'open' });
                const openKey = 'open';
                listerStore.triggerListerKey(openKey);
                timeToken = setTimeout(() => {
                    store.dispatch({ type: 'close' });
                    listerStore.triggerListerKey(openKey);
                    timeToken = null
                }, autoCloseTime);
            },
        };
        const subscribes = {
            subscribeOpen: () => listerStore.subscribeKey('open'),
        };
        return {
            snapshots,
            actions,
            subscribes,
        };
    }
}
