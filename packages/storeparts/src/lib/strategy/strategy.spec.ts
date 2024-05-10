import { createStrategyPart } from './strategy';
describe('createStrategyFun', () => {
    const strategy = createStrategyPart<number, 'a' | 'b', {a: string, b: number}>({
        strategyNames: ['a', 'b'],
        initialStrategyName: 'a',
        strategyConfig: {
            a: (value) => `${value}`,
            b: (value) => value
        }
    });
    it('should return a Object', () => {
        expect(strategy).toBeInstanceOf(Object);
    })
    it('test function a', () => {
        expect(strategy.getStrategyName()).toBe('a');
        expect(strategy.handle<'a'>(1)).toBe('1');
    })
    it('test function b', () => {
        strategy.changeStrategy('b');
        expect(strategy.getStrategyName()).toBe('b');
        expect(strategy.handle<'b'>(1)).toBe(1);
    })
})