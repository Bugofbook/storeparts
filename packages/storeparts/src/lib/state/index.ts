type StateItemID<StateNames extends string, HandleName extends string> = `${StateNames}_${HandleName}`;
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
interface StateItem<StateNames extends string> {
    /**
     * @description state name
     */
    stateName: StateNames;
}
type StateHandleOption = unknown;
type HandleFunction<StateNames extends string, HandleNames extends string, CurrentState extends StateItem<StateNames>, StateObject extends Record<HandleNames, StateHandleOption>> = <HandleName extends HandleNames>(originState: CurrentState, options: StateObject[HandleName]) => Promise<CurrentState>;
/**
 * @description state-pattern handle function object
 * @example
 * const handle = {
 *  sendMessage: (originState, options) => {...},
 *  receiveMessage: (originState, options) => {...},
 * }
 * 
 */
// type StateHandleObject<StateNames extends string, HandleNames extends string, CurrentState extends StateItem<StateNames>, StateObject extends Record<HandleNames, StateHandleOption>> = Record<HandleNames, HandleFunction<StateNames, HandleNames, CurrentState, StateObject>>
type StateHandleObject<StateNames extends string, HandleNames extends string, CurrentState extends StateItem<StateNames>, StateObject extends Record<HandleNames, StateHandleOption>> = {
    [HandleName in HandleNames]: HandleFunction<StateNames, HandleName, CurrentState, StateObject>
}
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
export type StateConfigItem<StateNames extends string, HandleNames extends string, CurrentState extends StateItem<StateNames>, StateObject extends Record<HandleNames, StateHandleOption>> = {
    name: StateNames;
    handleObject: StateHandleObject<StateNames, HandleNames, CurrentState, StateObject>;
}
type StateConfig<StateNames extends string, CurrentState extends StateItem<StateNames>, HandleNames extends string, StateObject extends Record<HandleNames, StateHandleOption>> = Record<StateNames, Record<HandleNames, <HandleName extends HandleNames>(currentState: CurrentState, option: StateObject[HandleName]) => Promise<CurrentState>>>
type StatePatternStoreProps<StateNames extends string, HandleNames extends string, CurrentState extends StateItem<StateNames>, StateObject extends Record<HandleNames, StateHandleOption>> = {
    initState: CurrentState,
    stateConfigItems: Array<StateConfigItem<StateNames, HandleNames, CurrentState, StateObject>>,
    stateNameList: Array<StateNames>,
    handleNameList: Array<HandleNames>,
}
/**
 * 
 * @param {string} stateItem the state item
 * @param {string} handleName the handle name
 * @returns {string} the state-item id
 */
function getStateID<StateNames extends string, HandleName extends string>(stateItem: StateNames, handleName: HandleName): StateItemID<StateNames, HandleName> {
    return `${stateItem}_${handleName}`;
}

function separateConfigItemWithHandleNames<StateNames extends string, HandleNames extends string, CurrentState extends StateItem<StateNames>, StateObject extends Record<HandleNames, StateHandleOption>>(configItem: StateConfigItem<StateNames, HandleNames, CurrentState, StateObject>, handleNames: Array<HandleNames>): Array<[`${StateNames}_${HandleNames}`, HandleFunction<StateNames, HandleNames, CurrentState, StateObject>]> {
    const { name, handleObject } = configItem;
    return Object.entries(handleObject)
        .filter(([handleName]) => handleNames.includes(handleName as HandleNames))
        .map(([handleName, handleFn]) => ([getStateID(name, handleName as HandleNames), handleFn as HandleFunction<StateNames, HandleNames, CurrentState, StateObject>]));
}
function separateConfigItem<StateNames extends string, HandleNames extends string, CurrentState extends StateItem<StateNames>, StateObject extends Record<HandleNames, StateHandleOption>>(handleNames: Array<HandleNames>) {
    return (configItem: StateConfigItem<StateNames, HandleNames, CurrentState, StateObject>) => separateConfigItemWithHandleNames(configItem, handleNames);
}
function includeHandleName<handleName extends string>(handleNames: Array<handleName>, handleName: handleName): boolean {
    return handleNames.includes(handleName);
}
function includeStateName<StateNames extends string>(stateNames: Array<StateNames>, stateName: StateNames): boolean {
    return stateNames.includes(stateName);
}
type StatePart<StateNames extends string, HandleNames extends string, CurrentState extends StateItem<StateNames>, StateObject extends Record<HandleNames, StateHandleOption>> = {
    /**
     * @description handle with handle name
     * @param {HandleName} handleName the handle name
     * @param {unknown} options the handle options
     */
    handle: <HandleName extends HandleNames>(handleName: HandleName, options?: Parameters<StateConfig<StateNames, CurrentState, HandleName, StateObject>[StateNames][HandleName]>[1]) => Promise<void>;
    /**
     * @description force change state
     * @param {StateItem<StateNames>} newState the new state
     */
    forceChangeState: (newState: CurrentState) => void;
    /**
     * @description subscribe state change
     * @param {() => void} callbackFn the callback function
     * @returns {() => void} unsubscribe function
     */
    subscribe: (callbackFn: () => void) => () => void;
    /**
     * @description get current state
     * @returns {StateItem<StateNames>} current state
     */
    getState: () => StateItem<StateNames>;
}

export function createStatePart<StateNames extends string, HandleNames extends string, StateObject extends Record<HandleNames, StateHandleOption>, CurrentState extends StateItem<StateNames> = StateItem<StateNames>>(props: StatePatternStoreProps<StateNames, HandleNames, CurrentState, StateObject>): StatePart<StateNames, HandleNames, CurrentState, StateObject>  {
    let stateItem: CurrentState = props.initState
    const stateNames: Array<StateNames> = props.stateNameList
    const handleNames: Array<HandleNames> = props.handleNameList
    const stateHandleMap: Map<StateItemID<StateNames, HandleNames>, HandleFunction<StateNames, HandleNames, CurrentState, StateObject>> = new Map(props.stateConfigItems.flatMap(separateConfigItem(handleNames)))
    const listerSet: Set<() => void> = new Set();
    return {
        handle: async <HandleName extends HandleNames>(handleName: HandleName, options?: Parameters<StateConfig<StateNames, CurrentState, HandleName, StateObject>[StateNames][HandleName]>[1]) => {
            if (!includeHandleName(handleNames, handleName)) {
                console.warn(`handle name ${handleName} not in handle name list`);
                return;
            }
            const currentStateName = stateItem.stateName;
            if (!includeStateName(stateNames, currentStateName)) {
                console.warn(`state name ${currentStateName} not in state name list`);
                return;
            }
            const currentHandleFunction = stateHandleMap.get(getStateID(currentStateName, handleName));
            if (!currentHandleFunction) {
                console.warn(`state name ${currentStateName} with handle name ${handleName} not in state handle map`);
                return;
            }
            try {
                const result = await currentHandleFunction<HandleName>(stateItem, options as StateObject[HandleName]);
                if (!result) {
                    return;
                }
                stateItem = result;
                listerSet.forEach((cb) => cb());
            } catch (error) {
                console.warn(error);
                return;
            }
        },
        forceChangeState: (newState) => {
            const currentStateName = newState.stateName
            if (!includeStateName(stateNames, currentStateName)) {
                console.warn(`state name ${currentStateName} not in state name list`);
                return;
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