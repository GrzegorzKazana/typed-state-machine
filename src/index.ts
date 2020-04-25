type AllowedStates = 'idle' | 'pending' | 'fetched' | 'failed';
type PossibleState<Keys extends string> = { [K in Keys]: unknown };
type PossibleTransitions<Keys extends string> = {
    [K in Keys]: {
        [L in Keys]?: unknown;
    };
};

const firstState = { a: 0 };

const initialState = {
    idle: { a: 0 },
    pending: { b: 1 },
    fetched: { c: 2 },
    failed: { d: 3 },
};

type PossibleStates = {
    idle: { a: number };
    pending: { b: number };
    fetched: { c: number };
    failed: { d: number };
};

const transitions = {
    idle: { pending: {} },
    pending: { fetched: {}, failed: {} },
    fetched: { idle: {}, fetched: {} },
    failed: { pending: {} },
} as const;

type Machine<
    CurrentKey extends AllowedStates,
    PossibleNextKeys extends AllowedStates,
    TransitionMatrix extends PossibleTransitions<AllowedStates>,
    StateMatrix extends PossibleState<AllowedStates>
> = {
    value: PossibleStates[CurrentKey];
} & {
    [NextPossibleKey in keyof TransitionMatrix[CurrentKey]]: (
        nextState: StateMatrix[NextPossibleKey],
    ) => Machine<
        // @ts-ignore :(
        // for some reason ts cannot properly infer that
        // keyof TransitionMatrix[CurrentKey] extends AllowedStates
        // as it is clearly defined in PossibleTransitions<AllowedStates>
        NextPossibleKey,
        PossibleNextKeys,
        TransitionMatrix,
        StateMatrix
    >;
};

function machine<
    CurrentKey extends AllowedStates,
    PossibleNextKeys extends AllowedStates,
    TransitionMatrix extends PossibleTransitions<AllowedStates>,
    StateMatrix extends PossibleState<AllowedStates> = PossibleStates
>(
    initStateKey: CurrentKey,
    initState: StateMatrix[CurrentKey],
    transitions: TransitionMatrix,
): Machine<CurrentKey, PossibleNextKeys, TransitionMatrix, StateMatrix> {
    const transitionsInCurState = transitions[initStateKey];
    const asd = (transitionsInCurState
        ? Object.keys(transitionsInCurState)
        : []) as PossibleNextKeys[];

    return {
        value: initState,
        ...Object.assign(
            {},
            ...asd.map(k => ({
                [k]: (n: StateMatrix[typeof k]) => machine(k, n, transitions),
            })),
        ),
    };
}

const a = machine('idle', { a: 1 }, transitions);
