// strategy pattern store
type StrategyItem<StrategyName extends string> = {
    state: StrategyName;
} & Record<string, unknown>;

type ChangeStrategyFunction<StrategyName extends string> = (originState: StrategyItem<StrategyName>) => StrategyItem<StrategyName>;

type StateConfigItem<StrategyName extends string, HandleName extends string> = {
    name: StrategyName;
    handle: Record<HandleName, ChangeStrategyFunction<StrategyName>>;
}


type StatePatternStoreProps<StrategyName extends string, HandleName extends string> = {
    initStrategy: StrategyName,
    strategyConfigItems: Array<StateConfigItem<StrategyName, HandleName>>,
    strategyNameList: Array<StrategyName>,
    handleNameList: Array<HandleName>,
}

export default function createStrategyPart<StrategyName extends string, HandleName extends string>(props: StatePatternStoreProps<StrategyName, HandleName>) {
    let state: StrategyName = props.initStrategy;
    const listerSet: Set<() => void> = new Set();
    async function handleWithName(name: HandleName) {
        if (!props.handleNameList.includes(name)) {
            throw new TypeError(`handle name ${name} not in handle name list`);
        }
        const currentStateName = state;
        const currentHandleFunction = props.strategyConfigItems.find((item) => item.name === currentStateName)?.handle[name];
        if (!currentHandleFunction) {
            return;
        }
    }
    function changeStrategy(newState: StrategyName) {
        if (!props.strategyNameList.includes(state)) {
            throw new TypeError(`state name ${state} not in state name list`);
        }
        state = newState;
        listerSet.forEach((cb) => cb());
    }
    function subscribe(callbackFn: () => void) {
        listerSet.add(callbackFn);
        return () => {
            listerSet.delete(callbackFn);
        }
    }
    function getState() {
        return state;
    }
    return {
        handleWithName,
        changeStrategy,
        subscribe,
        getState,
    }
}
