type PossibleState<Keys extends string> = { [K in Keys]: unknown };
type PossibleTransitions<Keys extends string> = {
    [K in Keys]?: readonly Keys[];
};

export type Machine<
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

export default function machine<
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
        const transitionMathodObjs = transitionsInCurState
            ? transitionsInCurState.map(k => ({
                  [k]: (n: StateMatrix[typeof k]) => machine(transitions)(k, n),
              }))
            : [];

        return {
            value: initState,
            ...Object.assign({}, ...transitionMathodObjs),
        };
    };
}
