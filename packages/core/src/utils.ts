import { PossibleStateValues } from './types';

export const shallowMerge = <T>(...obj: object[]): T => Object.assign({}, ...obj);

export const canIndex = <T extends object, K extends string | number | symbol>(
    obj: T,
    prop: K,
): obj is T & Record<K, unknown> => prop in obj;

export const buildObjFromKeys = <K extends string, V, R extends Record<K[number], V>>(
    keys: readonly K[],
    valueCreator: (key: K) => V,
): R => shallowMerge(...keys.map(key => ({ [key]: valueCreator(key) })));

export const isValueRepresentingKey = <
    StateKeys extends string,
    CurrentKey extends StateKeys,
    StateMatrix extends PossibleStateValues<StateKeys>
>(
    currentKey: CurrentKey,
    stateKey: StateKeys,
    _stateValue: StateMatrix[StateKeys],
): _stateValue is StateMatrix[CurrentKey] => currentKey === stateKey;
