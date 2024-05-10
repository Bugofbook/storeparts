import { createObserverKeyPart } from '@bugofbook/store-parts';
export type ModalObserverStore = ReturnType<typeof createObserverKeyPart<'open' | 'option'>>;

export interface State {
    open: boolean;
}
export type OpenAction = { type: 'open' } | { type: 'close' };
export function modalReducer(state: State, action: OpenAction): State {
    switch (action.type) {
        case 'open': {
            return {
                open: true,
            };
        }
        case 'close': {
            return {
                open: false,
            };
        }
        default: return state;
    }
}

export type OptionAction<Option> = { type: 'set'; payload: Option } | { type: 'remove' };

export function modalWithOptionReducer<Option>(state: State & Option, action: OpenAction | OptionAction<Option>, initState: State & Option): State & Option {
    switch (action.type) {
        case 'open': {
            return {
                ...state,
                open: true,
            };
        }
        case 'close': {
            return {
                ...state,
                open: false,
            };
        }
        case 'set': {
            return {
                ...state,
                open: state.open,
                ...action.payload,
            };
        }
        case 'remove': {
            return {
                ...initState,
                open: state.open,
            };
        }
        default: return state;
    }
}