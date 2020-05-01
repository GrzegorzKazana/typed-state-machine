export const shallowMerge = <T>(...obj: object[]): T => Object.assign({}, ...obj);

export const canIndex = <T extends object, K extends string | number | symbol>(
    obj: T,
    prop: K,
): obj is T & Record<K, unknown> => prop in obj;
