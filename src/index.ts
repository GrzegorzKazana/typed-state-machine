type AllowedStates = 'idle' | 'pending' | 'fetched' | 'failed';
type PossibleState<Keys extends string> = { [K in Keys]: unknown };
type PossibleTransitions<Keys extends string> = {
    [K in Keys]: readonly Keys[];
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
    idle: ['pending'],
    pending: ['fetched', 'failed'],
    fetched: ['idle', 'fetched'],
    failed: ['pending'],
} as const;
type TransitionMatrix = typeof transitions;

type Machine<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    CurrentKey extends AllowedStateKeys,
    PossibleNextKeys extends AllowedStateKeys,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
> = {
    value: StateMatrix[CurrentKey];
} & {
    [NextPossibleKey in TransitionMatrix[CurrentKey][number]]: (
        nextState: StateMatrix[NextPossibleKey],
    ) => Machine<
        AllowedStateKeys,
        StateMatrix,
        NextPossibleKey,
        PossibleNextKeys,
        TransitionMatrix
    >;
};

function machine<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
>(
    transitions: TransitionMatrix,
): <
    CurrentKey extends AllowedStateKeys,
    PossibleNextKeys extends AllowedStateKeys
>(
    initStateKey: CurrentKey,
    initState: StateMatrix[CurrentKey],
) => Machine<
    AllowedStateKeys,
    StateMatrix,
    CurrentKey,
    PossibleNextKeys,
    TransitionMatrix
> {
    return (initStateKey, initState) => {
        const transitionsInCurState = transitions[initStateKey];

        return {
            value: initState,
            ...Object.assign(
                {},
                ...transitionsInCurState.map(k => ({
                    [k]: (n: StateMatrix[typeof k]) =>
                        machine(transitions)(k, n),
                })),
            ),
        };
    };
}

const a = machine<AllowedStates, PossibleStates, TransitionMatrix>(
    transitions,
)('idle', { a: 1 });
