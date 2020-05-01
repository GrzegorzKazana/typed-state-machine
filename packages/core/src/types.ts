/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyFn = (...args: any) => any;
export type FnAnyReturn<Args extends any[]> = (...args: Args) => any;
export type SafeReturnType<F extends any> = F extends (...args: any) => infer R ? R : undefined;
export type ArrayUnion<L extends readonly T[], T = any> = L[number];
/* eslint-enable */

export type PossibleStateValues<Keys extends string> = { [K in Keys]: unknown };
export type PossibleTransitions<Keys extends string> = {
    [K in Keys]: readonly Keys[];
};

export type StateFolders<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>
> = {
    [K in StateKeys]?: FnAnyReturn<[StateMatrix[K]]>;
};

export type TransitionObject<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    TransitionMatrix extends PossibleTransitions<StateKeys>,
    TransitionTarget extends StateKeys
> = { [L in ArrayUnion<TransitionMatrix[TransitionTarget]>]: (newState: StateMatrix[L]) => void };

export type TransitionHandlers<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    TransitionMatrix extends PossibleTransitions<StateKeys>
> = {
    [K in StateKeys]?: (
        newState: StateMatrix[K],
        transitionObj: TransitionObject<StateKeys, StateMatrix, TransitionMatrix, K>,
    ) => void;
};
