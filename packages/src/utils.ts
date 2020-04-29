// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any) => any;

export type PossibleState<Keys extends string> = { [K in Keys]: unknown };
export type PossibleTransitions<Keys extends string> = {
    [K in Keys]: readonly Keys[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeReturnType<F extends any> = F extends (...args: any) => infer R ? R : undefined;

export const shallowMerge = <T>(...obj: object[]): T => Object.assign({}, ...obj);

export const canIndex = <T extends object, K extends string | number | symbol>(
    obj: T,
    prop: K,
): obj is T & Record<K, unknown> => prop in obj;
