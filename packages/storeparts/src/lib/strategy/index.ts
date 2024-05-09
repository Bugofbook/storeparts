type StrategyHandleReturn = unknown
type StrategyConfig<StrategyHandleParameter, StrategyNames extends string, StrategyItem extends Record<StrategyNames, StrategyHandleReturn>> = {
  [StrategyName in StrategyNames]: (props: StrategyHandleParameter) => StrategyItem[StrategyName]
}
type PartProps<StrategyHandleParameter, StrategyNames extends string, StrategyItem extends Record<StrategyNames, StrategyHandleReturn>> = {
  strategyNames: Array<StrategyNames>;
  initialStrategyName: StrategyNames;
  strategyConfig: StrategyConfig<StrategyHandleParameter, StrategyNames, StrategyItem>;
}
type StrategyPart<StrategyHandleParameter, StrategyNames extends string, StrategyItem extends Record<StrategyNames, StrategyHandleReturn>> = {
  getStrategyName: () => StrategyNames;
  handle: <CurrentName extends StrategyNames>(prop: StrategyHandleParameter) => ReturnType<StrategyConfig<StrategyHandleParameter, CurrentName, StrategyItem>[CurrentName]>;
  changeStrategy: (name: StrategyNames) => undefined;
  subscribe: (callbackFn: () => void) => () => void;
}
export function createStrategyPart<StrategyHandleParameter, StrategyNames extends string, StrategyItem extends Record<StrategyNames, StrategyHandleReturn>>(props: PartProps<StrategyHandleParameter, StrategyNames, StrategyItem>): StrategyPart<StrategyHandleParameter, StrategyNames, StrategyItem> {
  let strategyName = props.initialStrategyName;
  const listerSet: Set<() => void> = new Set();
  const strategyMap: Map<StrategyNames, (props: StrategyHandleParameter) => StrategyItem[StrategyNames]> = new Map(Object.entries(props.strategyConfig) as Array<[StrategyNames, (props: StrategyHandleParameter) => StrategyItem[StrategyNames]]>);
  return ({
    getStrategyName: () => strategyName,
    handle: <CurrentName extends StrategyNames>(prop: StrategyHandleParameter) => {
      const currentStrategy = strategyMap.get(strategyName) ;
      if (!currentStrategy) throw new Error('strategyName is illegal');
      return currentStrategy(prop) as ReturnType<StrategyConfig<StrategyHandleParameter, CurrentName, StrategyItem>[CurrentName]>;
    },
    changeStrategy: (name) => {
      if (props.strategyNames.includes(name)) {
        strategyName = name
        listerSet.forEach((cb) => cb());
      }
      return;
    },
    subscribe: (callbackFn) => {
      listerSet.add(callbackFn);
      return () => {
          listerSet.delete(callbackFn);
      }
    },
  })
}