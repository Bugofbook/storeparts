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
type StateItem<StateName extends string, Options extends Record<string, unknown> = Record<string, never>> = {
    /**
     * @description state name
     */
    stateName: StateName;
} & Options;
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
 * @description state-pattern state object
 * @example
 * const state = {
 *  init: (originState, options) => {...},
 *  young: (originState, options) => {...},
 *  old: (originState, options) => {...},
 * }
 
 */
type StateObject<StateName extends string, Options extends Record<string, unknown> = Record<string, never>> = Partial<Record<StateName, HandleFunction<StateName, Options>>>
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
    handleObject: StateHandleObject<StateName, HandleName, Options>;
}
type HandleConfigItem<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>> = {
    name: HandleName;
    stateObject: StateObject<StateName, Options>;
}
type StatePatternStoreProps<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>> = {
    initState: StateItem<StateName, Options>,
    stateConfigItems: Array<StateConfigItem<StateName, HandleName, Options>>,
    stateNameList: Array<StateName>,
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
function separateConfigItemWithHandleNames<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>>(configItem: StateConfigItem<StateName, HandleName, Options>, handleNames: Array<HandleName>): Array<[`${StateName}_${HandleName}`, HandleFunction<StateName>]> {
    const { name, handleObject } = configItem;
    return Object.entries(handleObject)
        .filter(([handleName]) => handleNames.includes(handleName as HandleName))
        .map(([handleName, handleFn]) => ([getStateID(name, handleName as HandleName), handleFn as HandleFunction<StateName>]));
}
function separateConfigItem<HandleName extends string>(handleNames: Array<HandleName>) {
    return <StateName extends string, Options extends Record<string, unknown> = Record<string, never>>(configItem: StateConfigItem<StateName, HandleName, Options>) => separateConfigItemWithHandleNames(configItem, handleNames);
}
function separateHandleConfigItemWithStateNames<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>>(configItem: HandleConfigItem<StateName, HandleName, Options>, stateNames: Array<StateName>): Array<[`${StateName}_${HandleName}`, HandleFunction<StateName>]> {
    const { name, stateObject } = configItem;
    return Object.entries(stateObject)
        .filter(([stateName]) => stateNames.includes(stateName as StateName))
        .map(([stateName, handleFn]) => ([getStateID(stateName as StateName, name), handleFn as HandleFunction<StateName>]));
}
function includeHandleName<handleName extends string>(handleNames: Array<handleName>, handleName: handleName): boolean {
    return handleNames.includes(handleName);
}
function includeStateName<StateName extends string>(stateNames: Array<StateName>, stateName: StateName): boolean {
    return stateNames.includes(stateName);
}

type StatePart<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>> = {
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
    setStateConfigItem: (config: StateConfigItem<StateName, HandleName, Options>) => void;
    /**
     * @description remove state config item
     * @param {StateName} strategyName the state name
     */
    removeStateConfigItem: (strategyName: StateName) => void;
    /**
     * @description set handle config item
     * @param {HandleConfigItem<StateName, HandleName>} config the handle config item
     */
    setHandleConfigItem: (config: HandleConfigItem<StateName, HandleName, Options>) => void;
    /**
     * @description remove handle config item
     * @param handleName the handle name
     */
    removeHandleConfigItem: (handleName: HandleName) => void;
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

export default function createStatePart<StateName extends string, HandleName extends string, Options extends Record<string, unknown> = Record<string, never>>(props: StatePatternStoreProps<StateName, HandleName>): StatePart<StateName, HandleName, Options> {
    let stateItem: StateItem<StateName> = props.initState
    let stateNames: Array<StateName> = props.stateNameList
    const handleNames: Array<HandleName> = props.handleNameList
    const stateHandleMap: Map<StateItemID<StateName, HandleName>, HandleFunction<StateName>> = new Map(props.stateConfigItems.flatMap(separateConfigItem(handleNames)))
    const listerSet: Set<() => void> = new Set();
    return {
        handle: async (handleName, options) => {
            if (!includeHandleName(handleNames, handleName)) {
                throw new TypeError(`handle name ${handleName} not in handle name list`);
            }
            const currentStateName = stateItem.stateName;
            if (!includeStateName(stateNames, currentStateName)) {
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
        },
        setStateConfigItem: (config) => {
            const { name } = config;
            if (!includeStateName(stateNames, name)) {
                stateNames = stateNames.concat([name]);
            }
            const separateConfigFunction = separateConfigItem(handleNames);
            const handleData = separateConfigFunction(config)
            handleData.forEach(([stateID, handleFn]) => {
                stateHandleMap.set(stateID, handleFn);
            })
        },
        removeStateConfigItem: (strategyName)  => {
            stateNames = stateNames.filter(name => name !== strategyName);
            handleNames.forEach(handleName => {
                const stateID = getStateID(strategyName, handleName);
                stateHandleMap.delete(stateID)
            })
        },
        setHandleConfigItem: (config) => {
            const { name } = config;
            if (!includeHandleName(handleNames, name)) {
                handleNames.push(name);
            }
            const separateConfigFunction = separateHandleConfigItemWithStateNames;
            const handleData = separateConfigFunction(config, stateNames);
            handleData.forEach(([stateID, handleFn]) => {
                stateHandleMap.set(stateID, handleFn);
            })
        },
        removeHandleConfigItem: (handleName) => {
            handleNames.filter(name => name !== handleName);
            stateNames.forEach(stateName => {
                const stateID = getStateID(stateName, handleName);
                stateHandleMap.delete(stateID)
            })
        },
        forceChangeState: (newState) => {
            const currentStateName = newState.stateName
            if (!includeStateName(stateNames, currentStateName)) {
                throw new TypeError(`state name ${currentStateName} not in state name list`);
            }
            stateItem = newState;
            listerSet.forEach((cb) => cb());
        },
        subscribe: (callbackFn) => {
            listerSet.add(callbackFn);
            return () => {
                listerSet.delete(callbackFn);
            }
        },
        getState: () => stateItem,
    }
}