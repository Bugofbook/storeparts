import { createReducerPart, createObserverKeyPart } from '@bugofbook/store-parts';
import { modalWithOptionReducer } from '../core'
import type { ModalObserverStore, State, OpenAction, OptionAction } from'../core';
interface ConfirmOption<ConfirmValue> {
    onConfirm: (value: ConfirmValue) => void;
    onCancel: () => void;
}
type ConfirmModalState<ConfirmValue> = State & ConfirmOption<ConfirmValue>
type ConfirmModalAction<ConfirmValue> = OptionAction<ConfirmOption<ConfirmValue>>;
type ConfirmModal<ConfirmValue> = {
    /**
     * modal data snapshots
     */
    snapshots: {
        /**
         * get modal open state
         * @returns boolean
         */
        getOpen: () => boolean;
    }
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
        /**
         * select confirm result
         * @param value 
         * @returns 
         */
        onConfirm: (value: ConfirmValue) => void;
        /**
         * select cancel result
         * @returns 
         */
        onCancel: () => void;
    }
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
}
interface ConfirmModalWithOptionState<ConfirmValue, Option> extends State, ConfirmOption<ConfirmValue> {
    option: Option;
}
type ConfirmModalWithOptionAction<ConfirmValue, Option> = OpenAction | OptionAction<{option: Option} & ConfirmOption<ConfirmValue>>;
type ConfirmModalWithOption<ConfirmValue, Option> = {
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
        openModal: (option: Option & {onConfirm: (value: ConfirmValue) => void, onCancel: () => void }) => void;
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
        /**
         * select confirm result
         * @param value 
         * @returns 
         */
        onConfirm: (value: ConfirmValue) => void;
        /**
         * select cancel result
         * @returns 
         */
        onCancel: () => void;
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
}
export default function createConfirmModalStore<ConfirmValue, Option>(initOption: ConfirmOption<ConfirmValue> & { option: Option }): ConfirmModalWithOption<ConfirmValue, Option>
export default function createConfirmModalStore<ConfirmValue>(initOption: ConfirmOption<ConfirmValue>): ConfirmModal<ConfirmValue>
export default function createConfirmModalStore<ConfirmValue, Option>(initOption: ConfirmOption<ConfirmValue> & { option?: Option }) {
    const { onConfirm, onCancel, option } = initOption;
    if (option) {
        const initialState: ConfirmModalWithOptionState<ConfirmValue, Option> = { open: false, onConfirm, onCancel, option }
        const store = createReducerPart<ConfirmModalWithOptionState<ConfirmValue, Option>, ConfirmModalWithOptionAction<ConfirmValue, Option>>(modalWithOptionReducer, initialState);
        const listerStore = createObserverKeyPart<'open' | 'option'>();
        const snapshots = {
            getOpen: () => store.getStore().open,
            getOption: () => store.getStore().option,
        };
        const actions = {
            openModal: (option: ConfirmOption<ConfirmValue> & { option: Option }) => {
                store.dispatch({ type: 'set', payload: option });
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
            onConfirm: (value: ConfirmValue) => {
                store.getStore().onConfirm(value);
                store.dispatch({ type: 'close' });
                const openKey = 'open';
                listerStore.triggerListerKey(openKey);
            },
            onCancel: () => {
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
        const store = createReducerPart<ConfirmModalState<ConfirmValue>, OpenAction | ConfirmModalAction<ConfirmValue>>(modalWithOptionReducer, { open: false, onConfirm, onCancel });
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
            onConfirm: (value: ConfirmValue) => {
                store.getStore().onConfirm(value);
                store.dispatch({ type: 'close' });
                const openKey = 'open';
                listerStore.triggerListerKey(openKey);
            },
            onCancel: () => {
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