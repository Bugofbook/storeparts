import { createReducerPart, createObserverKeyPart } from '@bugofbook/store-parts';
import { modalReducer, modalWithOptionReducer } from '../core'
import type { ModalObserverStore, State, OpenAction, OptionAction } from'../core';
interface StateWithOption<Type> extends State {
    option: Type;
}
type ModalType = {
    /**
     * modal data data snapshots
     */
    snapshots: {
        /**
         * get modal open state
         * @returns boolean
         */
        getOpen: () => boolean;
    };
    /**
     * modal data actions
     */
    actions: {
        /**
         * open modal
         * @returns 
         */
        openModal: () => void;
        /**
         * close modal
         * @returns 
         */
        closeModal: () => void;
    };
    /**
     * modal data subscribes
     */
    subscribes: {
        /**
         * subscribe modal open state
         * @returns the unsubscribe function
         */
        subscribeOpen: () => ReturnType<ModalObserverStore['subscribeKey']>;
    };
};
type ModalTypeWithOption<Option> = {
    /**
     * modal data snapshots
     */
    snapshots: {
        /**
         * get modal open state
         * @returns boolean
         */
        getOpen: () => boolean;
        /**
         * get option data
         * @returns option data
         */
        getOption: () => Option;
    };
    /**
     * modal data actions
     */
    actions: {
        /**
         * open modal with option
         * @param option 
         */
        openModal: (option: Option) => void;
        /**
         * close modal without remove option data
         * @returns 
         */
        closeModal: () => void;
        /**
         * remove option data, need after close modal
         * @returns 
         */
        removeOption: () => void;
    };
    /**
     * modal data subscribes
     */
    subscribes: {
        /**
         * subscribe modal open state
         * @returns the unsubscribe function
         */
        subscribeOpen: () => ReturnType<ModalObserverStore['subscribeKey']>;
        /**
         * subscribe modal option data
         * @returns the unsubscribe function
         */
        subscribeOption: () => ReturnType<ModalObserverStore['subscribeKey']>;
    };
};
export default function createModalStore<Option>(initOption: Option): ModalTypeWithOption<Option>;
export default function createModalStore(): ModalType;
export default function createModalStore<Option>(initOption?: Option) {
    if (initOption) {
        const store = createReducerPart<StateWithOption<Option>, OpenAction | OptionAction<{option: Option}>>(modalWithOptionReducer, { open: false, option: initOption });
        const listerStore = createObserverKeyPart<'open' | 'option'>();
        const snapshots = {
            getOpen: () => store.getStore().open,
            getOption: () => store.getStore().option,
        };
        const actions = {
            openModal: (option: Option) => {
                store.dispatch({ type: 'set', payload: {option} });
                store.dispatch({ type: 'open' });
                const openKey = 'open';
                const optionKey = 'option';
                listerStore.triggerListerKeys([openKey, optionKey]);
            },
            closeModal: () => {
                store.dispatch({ type: 'close' });
                const openKey = 'open';
                listerStore.triggerListerKey(openKey);
            },
            removeOption: () => {
                store.dispatch({ type: 'remove' });
                const optionKey = 'option';
                listerStore.triggerListerKey(optionKey);
            },
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
            openModal: () => {
                store.dispatch({ type: 'open' });
                const openKey = 'open';
                listerStore.triggerListerKey(openKey);
            },
            closeModal: () => {
                store.dispatch({ type: 'close' });
                const openKey = 'open';
                listerStore.triggerListerKey(openKey);
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
