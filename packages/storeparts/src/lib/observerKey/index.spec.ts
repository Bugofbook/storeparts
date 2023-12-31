import createListerStore from './index';
function createSubject<T>(subjectName: string, initValue: T) {
  let value = initValue;
  return {
    setValue: (newValue: T) => {
      value = newValue;
    },
    getValue: () => {
      return value
    },
    getContext: () => {
      return `${subjectName}: ${value}`
    }
  }
}
describe('listerStore', () => {
  it('case1', () => {
    const listerStore = createListerStore<'key1' | 'key2'>();
    const subject1 = createSubject<number>('subject1', 0);

    const callback1 = () => {
      subject1.setValue(subject1.getValue() + 1);
    }
    listerStore.subscribeKey('key1')(callback1);
    function event1() {
      listerStore.triggerListerKey('key1');
      return subject1.getContext();
    }
    expect(event1()).toBe('subject1: 1');
    function event2() {
      listerStore.triggerListerKey('key2');
      return subject1.getContext();
    }
    expect(event2()).toBe('subject1: 1');
  });
  it('case2', () => {
    const listerStore = createListerStore<'key1' | 'key2'>();
    const subject1 = createSubject<number>('subject1', 0);
    const subject2 = createSubject<number>('subject2', 0);
    const callback1 = () => {
      subject1.setValue(subject1.getValue() + 1);
    }
    const callback2 = () => {
      subject2.setValue(subject2.getValue() + 1);
    }
    listerStore.subscribeKey('key1')(callback1);
    listerStore.subscribeKey('key2')(callback2);
    function event1() {
      listerStore.triggerListerKey('key1');
      return [subject1.getValue(), subject2.getValue()];
    }
    expect(event1()).toEqual([1, 0]);
    function event2() {
      listerStore.triggerListerKeys(['key1', 'key2']);
      return [subject1.getValue(), subject2.getValue()];
    }
    expect(event2()).toEqual([2, 1]);
    function event3() {
      listerStore.triggerListerAll();
      return [subject1.getValue(), subject2.getValue()];
    }
    expect(event3()).toEqual([3, 2]);
  });
});
