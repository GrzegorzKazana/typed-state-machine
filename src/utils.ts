// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any) => any;

export type PossibleState<Keys extends string> = { [K in Keys]: unknown };
export type PossibleTransitions<Keys extends string> = {
    [K in Keys]: readonly Keys[];
};

export type MapReturnTypeUnion<T extends Record<string, AnyFn | undefined>> = MapReturnType<
    T
>[keyof T];
type MapReturnType<T extends Record<string, AnyFn | undefined>> = {
    [F in keyof T]: T[F] extends AnyFn ? ReturnType<T[F]> : undefined;
};

export const shallowMerge = <T>(...obj: object[]): T => Object.assign({}, ...obj);
