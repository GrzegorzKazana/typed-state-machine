import { PossibleStateValues, PossibleTransitions, ArrayUnion } from './types';

export type StatelessMachine<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    CurrentKey extends StateKeys,
    PossibleNextKeys extends StateKeys,
    TransitionMatrix extends PossibleTransitions<StateKeys>
> = {
    value: StateMatrix[CurrentKey];
} & {
    [NextPossibleKey in ArrayUnion<TransitionMatrix[CurrentKey]>]: (
        nextState: StateMatrix[NextPossibleKey],
    ) => StatelessMachine<
        StateKeys,
        StateMatrix,
        NextPossibleKey,
        PossibleNextKeys,
        TransitionMatrix
    >;
};

export default function createMachine<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    TransitionMatrix extends PossibleTransitions<StateKeys>
>(
    transitions: TransitionMatrix,
): <CurrentKey extends StateKeys, PossibleNextKeys extends StateKeys>(
    initStateKey: CurrentKey,
    initState: StateMatrix[CurrentKey],
) => StatelessMachine<StateKeys, StateMatrix, CurrentKey, PossibleNextKeys, TransitionMatrix> {
    return (initStateKey, initState) => {
        const transitionsInCurState = transitions[initStateKey];
        const transitionMathodObjs = transitionsInCurState
            ? transitionsInCurState.map(nextStateKey => ({
                  [nextStateKey]: (nextState: StateMatrix[typeof nextStateKey]) =>
                      createMachine(transitions)(nextStateKey, nextState),
              }))
            : [];

        return {
            value: initState,
            ...Object.assign({}, ...transitionMathodObjs),
        };
    };
}
