import { PossibleState, PossibleTransitions, shallowMerge, MapReturnTypeUnion } from './utils';

type StateHandlers<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>
> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in AllowedStateKeys]?: (state: StateMatrix[K]) => any;
};

type TransitionHandlers<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
> = {
    [K in AllowedStateKeys]?: (
        transitionObj: { [L in TransitionMatrix[K][number]]: (newState: StateMatrix[L]) => void },
    ) => void;
};

type StatefulMachine<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
> = {
    value: StateMatrix[AllowedStateKeys];
    state: AllowedStateKeys;
    transitions: TransitionMatrix;
} & {
    isInState(state: AllowedStateKeys): boolean;
    canTransitionTo(state: AllowedStateKeys): boolean;
    fold<H extends StateHandlers<AllowedStateKeys, StateMatrix>>(
        handlers: H,
    ): AllowedStateKeys extends keyof H ? MapReturnTypeUnion<H> : MapReturnTypeUnion<H> | undefined;
    transition<H extends TransitionHandlers<AllowedStateKeys, StateMatrix, TransitionMatrix>>(
        handlers: H,
    ): void;
};

export default function createStatefulMachine<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
>(
    transitions: TransitionMatrix,
): <CurrentKey extends AllowedStateKeys>(
    initStateKey: CurrentKey,
    initState: StateMatrix[CurrentKey],
) => StatefulMachine<AllowedStateKeys, StateMatrix, TransitionMatrix> {
    return (initStateKey, initState) => {
        return {
            value: initState,
            state: initStateKey,
            transitions,
            isInState(state: AllowedStateKeys): boolean {
                return this.state === state;
            },
            canTransitionTo(state: AllowedStateKeys): boolean {
                return this.transitions[this.state].includes(state);
            },
            transition<
                H extends TransitionHandlers<AllowedStateKeys, StateMatrix, TransitionMatrix>
            >(handlers: H) {
                const currentState = this.state;
                const methodObjs = this.transitions[currentState].map(newKey => ({
                    [newKey]: (newState: StateMatrix[typeof newKey]) => {
                        this.value = newState;
                        this.state = newKey;
                    },
                }));
                const methodObj = shallowMerge<
                    {
                        [L in TransitionMatrix[typeof currentState][number]]: (
                            newState: StateMatrix[L],
                        ) => void;
                    }
                >(...methodObjs);
                const currentHandler = handlers[currentState];
                currentHandler && currentHandler(methodObj);
            },
            fold<H extends StateHandlers<AllowedStateKeys, StateMatrix>>(handlers: H) {
                const currentHandler = handlers[this.state];
                return currentHandler ? currentHandler(this.value) : null;
            },
        };
    };
}
