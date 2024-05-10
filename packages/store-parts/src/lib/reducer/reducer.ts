type Action<Type extends string = string> = {
    type: Type;
};
type UnknownAction<Type extends string> = Action<Type> & {
    payload?: unknown;
};
type Reducer<State, A extends Action = UnknownAction<string>> = (state: State, action: A, initState: State) => State;
type ReducerStore<State, A extends UnknownAction<string>> = {
    dispatch: (action: A) => void;
    getStore: () => State;
    getStoreSnapshot: <T>(selector: (currentStore: State) => T) => () => T;
}
export default function createReducerPart<State, A extends UnknownAction<string>>(reducer: Reducer<State, A>, initState: State): ReducerStore<State, A> {
    let store = initState;
    return {
        dispatch: (action) => {
            store = reducer(store, action, initState);
        },
        getStore: () => store,
        getStoreSnapshot: (selector) => {
            return () => selector(store);
        },
    };
}