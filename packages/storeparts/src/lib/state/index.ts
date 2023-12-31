type StateItemID<StateName extends string, HandleName extends string> = `${StateName}_${HandleName}`;
/**
 * @description state-pattern item
 * @example
 * const initState = {
 *    stateName: 'init',
 *    name: 'init',
 *    age: 0,
 * };
 * const youngState = {
 *   stateName: 'young',
 *   name: 'young',
 *   age: 18,
 * };
 */
type StateItem<StateName extends string> = {
    /**
     * @description state name
     */
    stateName: StateName;
} & Record<string, unknown>;
/**
 * @description state-pattern handle function
 * @example
 * const judgeAge = async (originState, options) => {
 *  switch (options.age) {
 *   case 18:
 *     return await ({
 *       stateName: 'young',
 *       name: 'young',
 *       age: 18,
 *     });
 *   case 65:
 *     return await ({
 *      stateName: 'old',
 *       name: 'old',
 *       age: 65,
 *     });
 *   default:
 *     return originState;
 *  }
 */
type HandleFunction<StateName extends string, Options extends Record<string, unknown> = Record<string, unknown>> = (originState: StateItem<StateName>, options: Options) => Promise<StateItem<StateName>>;
/**
 * @description state-pattern handle function object
 * @example
 * const handle = {
 *  sendMessage: (originState, options) => {...},
 *  receiveMessage: (originState, options) => {...},
 * }
 * 
 */
type StateHandleObject<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>> = Partial<Record<HandleName, HandleFunction<StateName, Options>>>
/**
 * @description state-pattern config item
 * @example
 * const initState = {
 *   stateName: 'init',
 *   handle: {
 *     sendMessage: (originState, options) => {...},
 *     receiveMessage: (originState, options) => {...},
 *   },
 * };
 */
type StateConfigItem<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>> = {
    name: StateName;
    handle: StateHandleObject<StateName, HandleName, Options>;
}

type StatePatternStoreProps<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>> = {
    initState: StateItem<StateName>,
    strategyConfigItems: Array<StateConfigItem<StateName, HandleName, Options>>,
    strategyNameList: Array<StateName>,
    handleNameList: Array<HandleName>,
}
/**
 * 
 * @param {string} stateItem the state item
 * @param {string} handleName the handle name
 * @returns {string} the state-item id
 */
function getStateID<StateName extends string, HandleName extends string>(stateItem: StateName, handleName: HandleName): StateItemID<StateName, HandleName> {
    return `${stateItem}_${handleName}`;
}
/**
 * 
 * @param { StateName } stateName the state name
 * @param {StateHandleObject<StateName, HandleName, Options>} handleObj the state-pattern handle function object
 * @returns 
 */
function separateHandleObject<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>>(stateName: StateName, handleObj: StateHandleObject<StateName, HandleName, Options>): Array<[`${StateName}_${HandleName}`, HandleFunction<StateName>]> {
    return Object.entries(handleObj).map(([handleName, handleFn]) => ([getStateID(stateName, handleName as HandleName), handleFn as HandleFunction<StateName>]));
}

type StatePart<StateName extends string, HandleName extends string> = {
    /**
     * @description handle with handle name
     * @param {HandleName} handleName the handle name
     * @param {Record<string, unknown>} options the handle options
     */
    handle: (handleName: HandleName, options: Record<string, unknown>) => Promise<void>;
    /**
     * @description set state config item
     * @param {StateConfigItem<StateName, HandleName>} config the state config item
     */
    setStateConfigItem: (config: StateConfigItem<StateName, HandleName>) => void;
    /**
     * @description remove state config item
     * @param {StateName} strategyName the state name
     */
    removeStateConfigItem: (strategyName: StateName) => void;
    /**
     * @description force change state
     * @param {StateItem<StateName>} newState the new state
     */
    forceChangeState: (newState: StateItem<StateName>) => void;
    /**
     * @description subscribe state change
     * @param {() => void} callbackFn the callback function
     * @returns {() => void} unsubscribe function
     */
    subscribe: (callbackFn: () => void) => () => void;
    /**
     * @description get current state
     * @returns {StateItem<StateName>} current state
     */
    getState: () => StateItem<StateName>;

}

export default function createStatePart<StateName extends string, HandleName extends string>(props: StatePatternStoreProps<StateName, HandleName>): StatePart<StateName, HandleName> {
    let stateItem: StateItem<StateName> = props.initState
    let stateNames: Array<StateName> = props.strategyNameList
    const handleNames: Array<HandleName> = props.handleNameList
    const stateHandleMap: Map<StateItemID<StateName, HandleName>, HandleFunction<StateName>> = new Map(props.strategyConfigItems.map(config => ([config.name, config.handle] as [StateName, StateHandleObject<StateName, HandleName>]))
    .flatMap(([stateName, handleObj]) => separateHandleObject(stateName, handleObj)))
    const listerSet: Set<() => void> = new Set();
    async function handle(handleName: HandleName, options: Record<string, unknown>) {
        if (!handleNames.includes(handleName)) {
            throw new TypeError(`handle name ${handleName} not in handle name list`);
        }
        const currentStateName = stateItem.stateName;
        if (!stateNames.includes(currentStateName)) {
            throw new TypeError(`state name ${currentStateName} not in state name list`);
        }
        const currentHandleFunction = stateHandleMap.get(getStateID(currentStateName, handleName));
        if (!currentHandleFunction) {
            return;
        }
        try {
            const result = await currentHandleFunction(stateItem, options);
            if (!result) {
                return;
            }
            stateItem = result;
            listerSet.forEach((cb) => cb());
        } catch (error) {
            return;
        }
    }
    function forceChangeState(newState: StateItem<StateName>) {
        const currentStateName = newState.stateName
        if (!stateNames.includes(currentStateName)) {
            throw new TypeError(`state name ${currentStateName} not in state name list`);
        }
        stateItem = newState;
        listerSet.forEach((cb) => cb());
    }
    function setStateConfigItem(config: StateConfigItem<StateName, HandleName>) {
        const { name, handle } = config;
        if (!stateNames.includes(name)) {
            stateNames = stateNames.concat([name]);
        }
        Object.entries(handle).forEach(([handleName, handleFn]) => {
            if (handleNames.includes(handleName as HandleName)) {
                stateHandleMap.set(`${name}_${handleName}` as `${StateName}_${HandleName}`, handleFn as HandleFunction<StateName>);
            }
        })
    }
    function removeStateConfigItem(strategyName: StateName) {
        stateNames = stateNames.filter(name => name !== strategyName);
        handleNames.forEach(handleName => {
            stateHandleMap.delete(`${strategyName}_${handleName}` as `${StateName}_${HandleName}`)
        })
    }
    function subscribe(callbackFn: () => void) {
        listerSet.add(callbackFn);
        return () => {
            listerSet.delete(callbackFn);
        }
    }
    function getState() {
        return stateItem;
    }
    return {
        handle,
        setStateConfigItem,
        removeStateConfigItem,
        forceChangeState,
        subscribe,
        getState,
    }
}