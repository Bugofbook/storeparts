import type { StateConfigItem } from './index'
import { createStatePart } from './index'
describe('listerStore', () => {
    it('case1', async () => {
        type StateNames = 'step-1' | 'step-2' | 'step-3-1' | 'step-3-2' | 'step-3-3' | 'step-4-a' | 'step-4-b' | 'step-4-c' | 'step-5'
        type HandleNames = 'nextStep' | 'prevStep' | 'select-3' | 'select-4'
        type StateObject = {'nextStep': undefined, 'prevStep': undefined, 'select-3': {type: '1' | '2' | '3'}, 'select-4': {type: 'a' | 'b' | 'c'}}
        type StateItem<StateNames> = {
            stateName: StateNames,
        }
        const config: Array<StateConfigItem<StateNames, HandleNames, StateItem<StateNames>, StateObject>> = [
            {
                name: 'step-1',
                handleObject: {
                    nextStep: async () => {
                        return await ({
                            stateName: 'step-2',
                        })
                    },
                    'select-3': async (originState) => {
                        return await originState
                    },
                    'select-4': async (originState) => {
                        return await originState
                    },
                    prevStep: async (originState) => {
                        return await originState
                    }
                }
            },
            {
                name: 'step-2',
                handleObject: {
                    nextStep: async (originState) => {
                        return await originState
                    },
                    'select-3': async (originState, options) => {
                        switch (options.type) {
                            case '1': {
                                return await ({
                                    stateName: 'step-3-1',
                                });
                            }
                            case '2': {
                                return await ({
                                    stateName: 'step-3-2',
                                });
                            }
                            case '3': {
                                return await ({
                                    stateName: 'step-3-3',
                                });
                            }
                            default: {
                                return await originState;
                            }
                        }
                    },
                    'select-4': async (originState) => {
                        return await originState
                    },
                    prevStep: async () => {
                        return await ({
                            stateName: 'step-1',
                        })
                    }
                }
            },
            {
                name: 'step-3-1',
                handleObject: {
                    nextStep: async (originState) => {
                        return await originState
                    },
                    'select-3': async (originState) => {
                        return await originState
                    },
                    'select-4': async (originState, options) => {
                        switch (options.type) {
                            case 'a': {
                                return await ({
                                    stateName: 'step-4-a',
                                })
                            }
                            case 'b': {
                                return await ({
                                    stateName: 'step-4-b',
                                })
                            }
                            case 'c': {
                                return await ({
                                    stateName: 'step-4-c',
                                })
                            }
                            default: {
                                return await originState
                            }
                        }
                    },
                    prevStep: async () => {
                        return await ({
                            stateName: 'step-2',
                        })
                    }
                }
            },
            {
                name: 'step-3-2',
                handleObject: {
                    nextStep: async (originState) => {
                        return await originState
                    },
                    'select-3': async (originState) => {
                        return await originState
                    },
                    'select-4': async (originState, options) => {
                        switch (options.type) {
                            case 'a': {
                                return await ({
                                    stateName: 'step-4-a',
                                })
                            }
                            case 'b': {
                                return await ({
                                    stateName: 'step-4-b',
                                })
                            }
                            case 'c': {
                                return await ({
                                    stateName: 'step-4-c',
                                })
                            }
                            default: {
                                return await originState
                            }
                        }
                    },
                    prevStep: async () => {
                        return await ({
                            stateName: 'step-2',
                        })
                    }
                }
            },
            {
                name: 'step-3-3',
                handleObject: {
                    nextStep: async (originState) => {
                        return await originState
                    },
                    'select-3': async (originState) => {
                        return await originState
                    },
                    'select-4': async (originState, options) => {
                        switch (options.type) {
                            case 'a': {
                                return await ({
                                    stateName: 'step-4-a',
                                })
                            }
                            case 'b': {
                                return await ({
                                    stateName: 'step-4-b',
                                })
                            }
                            case 'c': {
                                return await ({
                                    stateName: 'step-4-c',
                                })
                            }
                            default: {
                                return await originState
                            }
                        }
                    },
                    prevStep: async () => {
                        return await ({
                            stateName: 'step-2',
                        })
                    }
                }
            },
            {
                name: 'step-4-a',
                handleObject: {
                    nextStep: async () => {
                        return await ({
                            stateName: 'step-5',
                        })
                    },
                    'select-3': async (originState) => {
                        return await originState
                    },
                    'select-4': async (originState) => {
                        return await originState
                    },
                    prevStep: async () => {
                        return await ({
                            stateName: 'step-4-a',
                        })
                    }
                }
            },
            {
                name: 'step-4-b',
                handleObject: {
                    nextStep: async () => {
                        return await ({
                            stateName: 'step-5',
                        })
                    },
                    'select-3': async (originState) => {
                        return await originState
                    },
                    'select-4': async (originState) => {
                        return await originState
                    },
                    prevStep: async () => {
                        return await ({
                            stateName: 'step-4-b',
                        })
                    }
                }
            },
            {
                name: 'step-4-c',
                handleObject: {
                    nextStep: async () => {
                        return await ({
                            stateName: 'step-5',
                        })
                    },
                    'select-3': async (originState) => {
                        return await originState
                    },
                    'select-4': async (originState) => {
                        return await originState
                    },
                    prevStep: async (originState) => {
                        return await originState
                    }
                }
            },
            {
                name: 'step-5',
                handleObject: {
                    nextStep: async () => {
                        return await ({
                            stateName: 'step-1',
                        })
                    },
                    'select-3': async (originState) => {
                        return await originState
                    },
                    'select-4': async (originState) => {
                        return await originState
                    },
                    prevStep: async (originState) => {
                        return await originState
                    }
                }
            },
        ]
        const statePart = createStatePart<StateNames, HandleNames, StateObject, StateItem<StateNames>>({
            initState: {
                stateName: 'step-1',
            },
            stateConfigItems: config,
            stateNameList: ['step-1', 'step-2', 'step-3-1', 'step-3-2', 'step-3-3', 'step-4-a', 'step-4-b', 'step-4-c', 'step-5'],
            handleNameList: ['nextStep', 'prevStep',  'select-3', 'select-4'],
        })
        // state-1
        expect(statePart.getState()).toEqual({
            stateName: 'step-1',
        })
        await statePart.handle('prevStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-1',
        })
        await statePart.handle('nextStep')
        // state-2
        expect(statePart.getState()).toEqual({
            stateName: 'step-2',
        })
        await statePart.handle('prevStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-1',
        })
        await statePart.handle('nextStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-2',
        })
        await statePart.handle('select-3', {type: '1'})
        // state-3-1
        expect(statePart.getState()).toEqual({
            stateName: 'step-3-1',
        })
        await statePart.handle('prevStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-2',
        })
        await statePart.handle('select-3', {type: '2'})
        // state-3-2
        expect(statePart.getState()).toEqual({
            stateName: 'step-3-2',
        })
        await statePart.handle('prevStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-2',
        })
        await statePart.handle('select-3', {type: '3'})
        // state-3-3
        expect(statePart.getState()).toEqual({
            stateName: 'step-3-3',
        })
        await statePart.handle('prevStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-2',
        })
        await statePart.handle('select-3', {type: '1'})
        await statePart.handle('select-4', {type: 'a'})
        // state-4-1
        expect(statePart.getState()).toEqual({
            stateName: 'step-4-a',
        })
        await statePart.handle('prevStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-4-a',
        })
        await statePart.handle('nextStep')
        // state-5
        expect(statePart.getState()).toEqual({
            stateName: 'step-5',
        })
        await statePart.handle('prevStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-5',
        })
        await statePart.handle('nextStep')
        expect(statePart.getState()).toEqual({
            stateName: 'step-1',
        })
    })
})